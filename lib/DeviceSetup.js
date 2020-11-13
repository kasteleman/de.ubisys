'use strict';

const {
  // eslint-disable-next-line no-unused-vars
  zclNode, ZCLStruct, ZCLDataTypes, ZCLDataType, debug, Cluster, CLUSTER,
} = require('zigbee-clusters');

const LocalDataTypes = require('./LocalDataTypes');

const INPUTACTIONS_ATTRIBUTES = {
  1: { name: 'InputAndOptions' }, // type: ZCLDataTypes.uint8
  2: { name: 'Transition' }, // type: ZCLDataTypes.uint8
  3: { name: 'Endpoint' }, // type: ZCLDataTypes.uint8
  4: { name: 'ClusterID' }, // type: ZCLDataTypes.uint16
  5: { name: 'CommandTemplate' }, // type: ZCLDataTypes.raw
};

const InputActionsDataRecord = new ZCLDataType(
  NaN,
  'InputActionsDataRecordArray',
  -3,
  () => { // to buffer
    throw new Error('Not implemented');
  },
  ((buf, i, returnLength) => { // from buffer
    i = i || 0;
    const startByte = i;
    const result = {};

    // Read the attribute id of this custom attribute-in-an-attribute (first byte)
    result.id = ZCLDataTypes.uint8.fromBuffer(buf, i);
    i += ZCLDataTypes.uint8.length;

    // Read the ZCL data type of this custom attribute-in-an-attribute (second byte)
    const dataTypeId = ZCLDataTypes.uint8.fromBuffer(buf, i);
    i += ZCLDataTypes.uint8.length;

    // Try to find an existing DataType based on the `dataTypeId`, first check the
    // `XIAOMI_ATTRIBUTES` if a type is specified, second, search the `ZCLDataTypes` for a
    // DataType with id = `dataTypeId`.
    // eslint-disable-next-line max-len
    const DataType = (INPUTACTIONS_ATTRIBUTES[result.id] && INPUTACTIONS_ATTRIBUTES[result.id].type) || Object.values(ZCLDataTypes).find(type => type && type.id === dataTypeId);

    // Abort if no valid data type was found
    if (!DataType) throw new TypeError(`Invalid type for attribute: ${result.id}`);

    // eslint-disable-next-line no-mixed-operators
    result.name = (INPUTACTIONS_ATTRIBUTES[result.id] && INPUTACTIONS_ATTRIBUTES[result.id].name) || `unknown_attr_${result.id}`;

    // Parse the value from the buffer using the DataType
    const entry = DataType.fromBuffer(buf, i, true);
    if (DataType.length > 0) {
      i += DataType.length;
      result.value = entry;
    } else {
      result.value = entry.result;
      i += entry.length;
    }
    if (returnLength) {
      return { result, length: i - startByte };
    }
    return result;
  }),
);

// eslint-disable-next-line no-unused-vars
const InputActionsDataRecordArray = new ZCLDataType(
  NaN,
  'InputActionsDataRecord',
  -1,
  () => { // to buffer
    throw new Error('Not implemented');
  },
  ((buf, i, returnLength) => { // from buffer
    // eslint-disable-next-line prefer-const
    let { result, length } = ZCLDataTypes.buffer.fromBuffer(buf, i, true);

    // Parse the buffer for multiple `XiaomiLifelineDataRecord`
    result = ZCLDataTypes.Array8(InputActionsDataRecord).fromBuffer(result, 0);
    result = result.reduce((r, { name, value }) => Object.assign(r, { [name]: value }), {});
    if (returnLength) {
      return { result, length };
    }
    return result;
  }),
);

const ATTRIBUTES = {
  inputConfigurations: {
    id: 0,
    // dataTypeId: 72,
    type: LocalDataTypes.array(ZCLDataTypes.data8),
    // type: ZCLDataTypes.Array0(ZCLDataTypes.data8),
    /* type: ZCLStruct('InputConfigurations', {
      elementType: ZCLDataTypes.data8,
      elementCount: ZCLDataTypes.uint16,
      elements: ZCLDataTypes.Array0(ZCLDataTypes.data8),
    }), */
  },
  inputActions: {
    id: 1,
    // dataTypeId: 72,
    // type: InputActionsDataRecordArray,
    type: LocalDataTypes.array(ZCLDataTypes.data8),
    // type: ZCLDataTypes.Array8(ZCLDataTypes.octstr),
  }, // This attribute is an array (ZCL data type 0x48) of raw binary data (ZCL data type 0x41)*/
};

const COMMANDS = {

};

class DeviceSetup extends Cluster {

  static get ID() {
    return 64512; // 0xFC00
  }

  static get NAME() {
    return 'devicesetup';
  }

  static get ATTRIBUTES() {
    return ATTRIBUTES;
  }

  static get COMMANDS() {
    return COMMANDS;
  }

}

Cluster.addCluster(DeviceSetup);

module.exports = DeviceSetup;
