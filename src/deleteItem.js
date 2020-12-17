const fp = require('lodash/fp');

const deleteItem = async (
  { entity, newIocs, foundEntities },
  requestWithDefaults,
  options,
  Logger,
  callback
) => {
  try {
    await requestWithDefaults({
      method: 'DELETE',
      uri: `${options.url}/api/indicators/${entity.id}`,
      options
    });
  } catch (error) {
    Logger.error(error, 'Item Deletion Error');
    return callback({
      errors: [
        {
          err: error,
          detail: error.message
        }
      ]
    });
  }

  return callback(null, {
    newList: fp.filter(({ value }) => value !== entity.value, foundEntities),
    newIocs: [entity, ...newIocs]
  });
};

module.exports = deleteItem;