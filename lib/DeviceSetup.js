'use strict';

const {
  zclNode, ZCLStruct, ZCLDataTypes, debug, Cluster, CLUSTER,
} = require('zigbee-clusters');

const ATTRIBUTES = {
	inputConfigurations: {
    id: 0,
    dataTypeId: 72,
    type: ZCLDataTypes.Array0(ZCLDataTypes.data8),
    /*type: ZCLStruct('InputConfigurations', {
      elementType: ZCLDataTypes.data8,
      elementCount: ZCLDataTypes.uint16,
      elements: ZCLDataTypes.Array0(ZCLDataTypes.data8),
    }),*/
  },
	inputActions: {
		id: 1,
    dataTypeId: 72,
    type: ZCLDataTypes.Array8(ZCLDataTypes.octstr),
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
