const fp = require('lodash/fp');
const {} = require('./constants')
const {
  POLARITY_TYPE_TO_THREATCONNECT,
  SUBMISSION_LABELS,
  INDICATOR_TYPES,
  ENTITY_DISPLAY_TYPES
} = require('./constants');

const submitItems = async (
  {
    newIocsToSubmit,
    foundEntities,
    submitTags 
    // TODO: Add Submission Options keys here from ../components/block.js
  },
  requestWithDefaults,
  options,
  Logger,
  callback
) => {
  try {
    const createdItems = await createItems(
      newIocsToSubmit,
      // TODO: add submission option keys here
      options,
      requestWithDefaults,
      Logger
    );

    // TODO: Verify a separate step for creating tags is needed and delete this function if not
    // await createTags(newIocsToSubmit, submitTags, options, requestWithDefaults, Logger);

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
  // TODO: add submission option keys here
  options,
  requestWithDefaults,
  Logger
) => {
  // await Promise.all(
  //   fp.map(
  //     (entity) =>
  //       requestWithDefaults({
  //         // TODO: Replace with request options for creating your data type
  //         options
  //       }),
  //     newIocsToSubmit
  //   )
  // );
  return fp.map((createdEntity) => ({
    ...createdEntity,
    displayedType: ENTITY_DISPLAY_TYPES[createdEntity.type]
  }))(newIocsToSubmit);
};

const createTags = (newIocsToSubmit, submitTags, options, requestWithDefaults) =>
  // TODO: Verify a separate step for creating is needed and delete this function if not
  Promise.all(
    fp.flatMap(
      async (entity) =>
        fp.map(
          (tag) =>
            requestWithDefaults({
              // TODO: Add request options for creating tags
              options
            }),
          submitTags
        ),
      newIocsToSubmit
    )
  );

module.exports = submitItems;