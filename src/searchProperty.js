const fp = require('lodash/fp');

const searchProperty = async (
  { term, selectedValues, property, propertyPath, sortField = 'name' },
  requestWithDefaults,
  options,
  Logger,
  callback
) => {
  propertyPath = propertyPath || property;
  try {
    const results = fp.getOr(
      [],
      'body.data',
      await requestWithDefaults({
        url: `${options.url}/api/${property}`,
        qs: {
          ...(term && {
            [sortField]: `${term}${['tags', 'sources'].includes(property) ? '%' : ''}`
          }),
          limit: 50,
          sort: sortField
        },
        options
      })
    );

    const formattedResults = formatResults(results, selectedValues, sortField);

    callback(null, { [property]: formattedResults });
  } catch (error) {
    Logger.error(
      error,
      { detail: `Failed to Get ${property} from ThreatQuotient` },
      `Get ${property} Failed`
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

const _getComparableString = (sortField) => (str) =>
  fp.flow(fp.getOr('', sortField), fp.lowerCase, fp.trim)(str);

const formatResults = (results, selectedProperties, sortField) =>
  fp.flow(
    fp.filter((result) =>
      fp.every(
        (selectedProperty) =>
          _getComparableString(sortField)(result) !==
          _getComparableString(sortField)(selectedProperty),
        selectedProperties
      )
    ),
    fp.uniqBy(_getComparableString(sortField)),
    fp.sortBy(sortField)
  )(results);

module.exports = searchProperty;
