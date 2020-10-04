'use strict';

const {
  zclNode, debug, Cluster, CLUSTER,
} = require('zigbee-clusters');
//const { Cluster } = require('zigbee-clusters');
const { ZCLDataTypes } = require('zigbee-clusters');

const ATTRIBUTES = {
	inputConfigurations: {
    id: 0,
    type: ZCLDataTypes.map8('InputAndOptions', 'Transition', 'Endpoint', 'ClusterID', 'CommandTemplate'), // This attribute is an array (ZCL data type 0x48) of 8-bit data (ZCL data type 0x08),
  },
	inputActions: {
		id: 1,
		type: ZCLDataTypes.octstr
	}, // This attribute is an array (ZCL data type 0x48) of raw binary data (ZCL data type 0x41)
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
