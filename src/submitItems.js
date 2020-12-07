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
    description,
    score,
    status,
    tags,
    sources,
    attributes,

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
  await requestWithDefaults({
    method: 'POST',
    uri: `${options.url}/api/indicators`,
    headers: { 'Content-Type': 'application/json' },
    body: [
      {
        class: 'network',
        value: '115.47.67.155',
        type_id: 10, // TODO: check to see if this is the score property rather than manual_score
        description: 'desc', //TODO: verify this is actually being submitted
        manual_score: 2, //TODO: verify this is actually being submitted
        status_id: 2,
        /*
        {
          1: 'Active',
          2: 'Expired',
          3: 'Indirect',
          4: 'Review',
          5: 'Whitelisted'
        }
        */
        sources: [
          // searchable list like tags
          {
            name: 'Source',
            tlp: {
              name: 'GREEN'
            }
          }
        ],
        attributes: [
          {
            name: 'Confidence',
            value: 'High',
            sources: [
              {
                name: 'Source',
                tlp: {
                  name: 'GREEN'
                }
              }
            ]
          },
          {
            name: 'Port',
            value: '4000'
          },
          {
            name: 'Scheme',
            value: 'https'
          }
        ],
        //TODO: Verify tags submit correctly
        tags: [
          {
            id: 23,
            name: 'another tag'
          },
          {
            name: 'New Test tag from int'
          }
        ]
      }
    ],
    options
  });

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