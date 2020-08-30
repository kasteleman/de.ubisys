'use strict';

const { Cluster } = require('zigbee-clusters');
const { ZCLDataTypes } = require('zigbee-clusters');

const ATTRIBUTES = {
	inputConfigurations: { id: 0, type: ZCLDataTypes.data8 }, // This attribute is an array (ZCL data type 0x48) of 8-bit data (ZCL data type 0x08)
	inputActions: { id: 1, type: ZCLDataTypes.octstr }, // This attribute is an array (ZCL data type 0x48) of raw binary data (ZCL data type 0x41)
};

const COMMANDS = {

};

class DeviceManagement extends Cluster {

	static get ID() {
		return 64512; // 0xFC00
	}

	static get NAME() {
		return 'DeviceManagement';
	}

	static get ATTRIBUTES() {
		return ATTRIBUTES;
	}

	static get COMMANDS() {
		return COMMANDS;
	}

}

Cluster.addCluster(DeviceManagement);

module.exports = DeviceManagement;
