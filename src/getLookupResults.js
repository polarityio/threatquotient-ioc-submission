const fp = require('lodash/fp');

const { TYPES_FOR_QUERY } = require('./constants');
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
      body: JSON.stringify({
        indicators: _createSearchQuery(entitiesPartition, options)
      }),
      options
    })
  );

  return foundEntities;
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
        value: threatQConfig.threatQIndicatorTypes[TYPES_FOR_QUERY[entityObj.type]]
      },
      {
        field: 'indicator_score',
        operator: 'greater than or equal to',
        value: options.minimumScore.value
      },
      {
        field: 'indicator_score',
        operator: 'less than or equal to',
        value: options.maximumScore.value
      }
    ],
    entityObjects
  );

 

module.exports = {
  getLookupResults
};
