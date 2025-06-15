import { List } from './List';


import { SeqKeyed } from './Seq';

import { collectionOpWithMutations } from './collection/collection';

import {
  collectionRecordPropertiesCreate,
  collectionRecordAssertValidDefaultValues,
} from './collection/collectionRecord';

import { probeIsRecord, probeIsKeyed } from './probe';
import { utilAssignNamedPropAccessor } from './util';

const recordOpNameGet = (record) => {
  return record.constructor.displayName || record.constructor.name || 'Record';
};

const Record = (defaultValues, name) => {
  let hasInitialized;

  collectionRecordAssertValidDefaultValues(defaultValues);

  const RecordType = function Record(values) {
    if (values instanceof RecordType) {
      return values;
    }
    if (this instanceof RecordType === false) {
      return new RecordType(values);
    }

    if (!hasInitialized) {
      hasInitialized = true;
      const keys = Object.keys(defaultValues);
      const indices = (RecordTypePrototype._indices = {});
      // Deprecated: left to attempt not to break any external code which
      // relies on a ._name property existing on record instances.
      // Use Record.getDescriptiveName() instead
      RecordTypePrototype._name = name;
      RecordTypePrototype._keys = keys;
      RecordTypePrototype._defaultValues = defaultValues;
      for (let i = 0; i < keys.length; i++) {
        const propName = keys[i];
        indices[propName] = i;
        if (RecordTypePrototype[propName]) {
          /* eslint-disable no-console */
          // eslint-disable-next-line @typescript-eslint/no-unused-expressions -- TODO enable eslint here
          typeof console === 'object' &&
            console.warn &&
            console.warn(
              'Cannot define ' +
                recordOpNameGet(this) +
                ' with property "' +
                propName +
                '" since that property name is part of the Record API.'
            );
          /* eslint-enable no-console */
        } else {
          utilAssignNamedPropAccessor(RecordTypePrototype, propName);
        }
      }
    }
    this.__ownerID = undefined;

    const collectionKeyedCreateBest = (value) => {
      return probeIsKeyed(value) ? value : SeqKeyed(value);
    };

    this._values = collectionOpWithMutations(List(), (l) => {
      l.setSize(this._keys.length);

      collectionKeyedCreateBest(values).forEach((v, k) => {
        l.set(this._indices[k], v === this._defaultValues[k] ? undefined : v);
      });
    });
    return this;
  };

  const RecordTypePrototype = (RecordType.prototype = Object.create(
    collectionRecordPropertiesCreate()
  ));
  RecordTypePrototype.constructor = RecordType;
  RecordTypePrototype.create = RecordType;

  if (name) {
    RecordType.displayName = name;
  }

  return RecordType;
};

Record.isRecord = probeIsRecord;
Record.getDescriptiveName = recordOpNameGet;

export { Record };
