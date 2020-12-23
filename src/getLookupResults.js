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
      uri: `${options.url}/api/indicators/query`,
      qs: {
        limit: 10,
        offset: 0,
        sort: '-created'
      },
      headers: {
        'Content-Type': 'application/json'
      },
      body: {
        criteria: {},
        filters: {
          '+or': _createSearchQuery(entitiesPartition, options)
        }
      },
      options
    })
  );

  return fp.map((foundEntity) => {
    const entityFromUser = fp.find(
      ({ value }) => fp.toLower(value) === fp.toLower(foundEntity.value),
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
    (entityObj) => ({
      '+or': [
        {
          '+and': [
            {
              '+or': [
                {
                  type_name: _getEntityType(entityObj)
                }
              ]
            },
            {
              '+and': [
                {
                  '+or': [
                    {
                      value: entityObj.value
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }),
    entityObjects
  );

const _getEntityType = (entity) =>
  entity.isIPv4
    ? 'IP Address'
    : entity.isIPv6
    ? 'IPv6 Address'
    : entity.isDomain
    ? 'FQDN'
    : entity.isURL
    ? 'URL'
    : entity.isSHA1
    ? 'SHA1'
    : entity.isSHA256
    ? 'SHA256'
    : entity.isMD5
    ? 'MD5'
    : entity.isEmail
    ? 'Email Address'
    : 'CIDR Block';


module.exports = {
  getLookupResults
};
