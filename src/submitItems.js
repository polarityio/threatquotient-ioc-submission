const fp = require('lodash/fp');
const { ENTITY_DISPLAY_TYPES } = require('./constants');
const threatQConfig = require('../config/threatq.config');

const submitItems = async (
  { newIocsToSubmit, foundEntities, description, status, score, sources, tags },
  requestWithDefaults,
  options,
  Logger,
  callback
) => {
  try {
    const createdItems = await createItems(
      newIocsToSubmit,
      description,
      status,
      sources,
      options,
      requestWithDefaults,
      Logger
    );

    await Promise.all([
      createTags(createdItems, tags, options, requestWithDefaults, Logger),
      addScore(createdItems, score, options, requestWithDefaults, Logger)
    ]);

    return callback(null, {
      foundEntities: [...createdItems, ...foundEntities]
    });
  } catch (error) {
    Logger.error(
      error,
      { detail: 'Failed to Create IOC in ThreatConnect' },
      'IOC Creation Failed'
    );
    return callback({
      errors: [
        {
          err: error,
          detail: error.message
        }
      ]
    });
  }
};

const createItems = async (
  newIocsToSubmit,
  description,
  status,
  sources,
  options,
  requestWithDefaults,
  Logger
) => {
  const createdIndicators = fp.getOr(
    [],
    'body.data',
    await requestWithDefaults({
      method: 'POST',
      uri: `${options.url}/api/indicators`,
      headers: { 'Content-Type': 'application/json' },
      body: fp.map(
        ({ value, type }) => ({
          class: 'network',
          value,
          type_id: threatQConfig.threatQIndicatorTypes[fp.toLower(type)],
          description,
          status_id: status,
          sources
        }),
        newIocsToSubmit
      ),
      options
    })
  );

  const createdItems = fp.map((createdEntity) => {
    const createdIndicator = fp.find(
      ({ value }) => value === createdEntity.value,
      createdIndicators
    );
    return {
      ...createdIndicator,
      ...createdEntity,
      displayedType: ENTITY_DISPLAY_TYPES[createdEntity.type]
    };
  })(newIocsToSubmit);

  return createdItems;
};

const createTags = (createdItems, submitTags, options, requestWithDefaults) =>
  Promise.all(
    fp.flatMap(
      (indicator) =>
        fp.map(
          (tag) =>
            requestWithDefaults({
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },

              uri: `${options.url}/api/indicators/${indicator.id}/tags`,
              body: tag,
              options
            }),
          submitTags
        ),
      createdItems
    )
  );

const addScore = (createdItems, manual_score, options, requestWithDefaults) =>
  Promise.all(
    fp.map(
      (indicator) =>
        requestWithDefaults({
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },

          uri: `${options.url}/api/indicator/${indicator.id}/scores`,
          body: { manual_score },
          options
        }),
      createdItems
    )
  );

module.exports = submitItems;