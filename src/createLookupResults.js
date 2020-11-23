const fp = require('lodash/fp');
const { ENTITY_DISPLAY_TYPES } = require('./constants');

let maxUniqueKeyNumber = 0;

const createLookupResults = (
  options,
  entities,
  _foundEntities,
  Logger
) => {
  const foundEntities = getFoundEntities(_foundEntities, entities);

  const notFoundEntities = getNotFoundEntities(foundEntities, entities);

  const summary = [
    ...(foundEntities.length ? ['Entities Found'] : []),
    ...(notFoundEntities.length ? ['New Entites'] : [])
  ];
  maxUniqueKeyNumber++;

  return [
    {
      entity: {
        ...entities[0],
        value: '___ IOC Submission'
      },
      isVolatile: true,
      data: {
        summary,
        details: {
          url: options.url,
          maxUniqueKeyNumber,
          [`summary${maxUniqueKeyNumber}`]: summary,
          [`foundEntities${maxUniqueKeyNumber}`]: foundEntities,
          [`notFoundEntities${maxUniqueKeyNumber}`]: notFoundEntities
        }
      }
    }
  ];
};

const getFoundEntities = (_foundEntities, entities) =>
  fp.flow(
    fp.filter(({ value }) =>
      fp.any(({ value: _value }) => fp.toLower(value) === fp.toLower(_value), entities)
    ),
    fp.map((foundEntity) => ({
      ...foundEntity,
      displayedType: ENTITY_DISPLAY_TYPES[foundEntity.type]
    }))
  )(_foundEntities);

const getNotFoundEntities = (foundEntities, entities) =>
  fp.reduce(
    (agg, entity) =>
      !fp.any(
        ({ value }) => fp.lowerCase(entity.value) === fp.lowerCase(value),
        foundEntities
      )
        ? agg.concat({
            ...entity,
            displayedType: ENTITY_DISPLAY_TYPES[foundEntity.type]
          })
        : agg,
    [],
    entities
  );

module.exports = createLookupResults;
