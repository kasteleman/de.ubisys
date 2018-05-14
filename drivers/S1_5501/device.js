'use strict';

const Homey = require('homey');

const ZigBeeDevice = require('homey-meshdriver').ZigBeeDevice;

class S1_5501 extends ZigBeeDevice {

	onMeshInit() {
		this.printNode();
		this.enableDebug();
		this.PowerFactor = 1000;

		this.registerCapability('onoff', 'genOnOff', { endpoint: 0 });

		this.registerAttrReportListener('genOnOff', 'onOff', 1, 0, 1, value => {
			this.log('onoff', value);
			this.setCapabilityValue('onoff', value === 1);
		}, 0);

		// measure_power
		if (this.hasCapability('measure_power')) {
			this.registerCapability('measure_power', 'seMetering', { endpoint: 2 });
		}

		this.registerAttrReportListener('seMetering', 'instantaneousDemand', 1, 300, 1, value => {
			this.parsedValue = value;
			this.log('instantaneousDemand', value, this.parsedValue);
			if (value < 0) return;
			this.setCapabilityValue('measure_power', this.parsedValue);
		}, 2);

	}


}

module.exports = S1_5501;
