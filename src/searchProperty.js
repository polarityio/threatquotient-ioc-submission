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
          [sortField]: `${term}${['tags', 'sources'].includes(property) ? '%25' : ''}`,
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

const _getComparableString = (sortField, str) =>
  fp.flow(fp.getOr('', sortField), fp.lowerCase, fp.trim)(str);

const formatResults = (tagResults, selectedTags, sortField) =>
  fp.flow(
    fp.filter((tagResult) =>
      fp.every(
        (selectedTag) =>
          _getComparableString(tagResult) !== _getComparableString(selectedTag),
        selectedTags
      )
    ),
    fp.uniqBy(_getComparableString),
    fp.sortBy(sortField)
  )(tagResults);

module.exports = searchProperty;
