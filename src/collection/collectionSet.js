import { collectionPropertiesCreate } from './collection';

const collectionSetCreate = () => {
  const ssqh = Object.create(collectionPropertiesCreate());

  ssqh.__shape = 'collectionSet';

  return ssqh;
};

export { collectionSetCreate };
