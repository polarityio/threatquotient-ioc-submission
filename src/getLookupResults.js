const fp = require('lodash/fp');

const { ENTITY_DISPLAY_TYPES } = require('./constants');
const threatQConfig = require('../config/threatq.config');

const { partitionFlatMap, splitOutIgnoredIps } = require('./dataTransformations');
const createLookupResults = require('./createLookupResults');

const getLookupResults = (entities, options, requestWithDefaults, Logger) =>
  partitionFlatMap(
    async (_entitiesPartition) => {
      const { entitiesPartition, ignoredIpLookupResults } = splitOutIgnoredIps(
        _entitiesPartition
      );

      const foundEntities = await _getFoundEntities(
        entitiesPartition,
        options,
        requestWithDefaults,
        Logger
      );

      const lookupResults = createLookupResults(
        options,
        entitiesPartition,
        foundEntities,
        Logger
      );

      Logger.trace({ lookupResults, foundEntities }, 'Lookup Results');

      return lookupResults.concat(ignoredIpLookupResults);
    },
    20,
    entities
  );


const _getFoundEntities = async (
  entitiesPartition,
  options,
  requestWithDefaults,
  Logger
) => {
  const foundEntities = fp.getOr(
    [],
    'body.data',
    await requestWithDefaults({
      method: 'POST',
      uri: `${options.url}/api/search/advanced`,
      qs: {
        limit: 10
      },
      headers: {
        'Content-Type': 'application/json'
      },
      body: {
        indicators: _createSearchQuery(entitiesPartition, options)
      },
      options
    })
  );

  return fp.map((foundEntity) => {
    const entityFromUser = fp.find(
      ({ value }) => value === foundEntity.value,
      entitiesPartition
    );
    return {
      ...foundEntity,
      ...entityFromUser,
      displayedType: ENTITY_DISPLAY_TYPES[entityFromUser.type]
    };
  }, foundEntities);
};

const _createSearchQuery = (entityObjects, options) =>
  fp.map(
    (entityObj) => [
      {
        field: 'indicator_value',
        operator: 'is',
        value: entityObj.value
      },
      {
        field: 'indicator_type',
        operator: 'is',
        value: threatQConfig.threatQIndicatorTypes[fp.toLower(entityObj.type)]
      }
    ],
    entityObjects
  );

 

module.exports = {
  getLookupResults
};
