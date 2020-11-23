const fp = require('lodash/fp');

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
        requestWithDefaults
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
  requestWithDefaults
) => {

  const foundEntities = fp.compact(
    await Promise.all(
      fp.map(async (entity) => {
        const searchResults = await fp.getOr(
          [],
          'body.data', // TODO: Modify with correct data path
          await requestWithDefaults({
            //TODO: Add properties for search request
            options
          })
        );

        return (
          searchResults &&
          searchResults.length && {
            ...entity,
            // TODO: Custom data transformation for search results go here
          }
        );
      }, entitiesPartition)
    )
  );

  return foundEntities;
};

module.exports = {
  getLookupResults
};
