'use strict';

const { ZigBeeLightDevice } = require('homey-zigbeedriver');
const { CLUSTER } = require('zigbee-clusters');
const { deviceManagement } = require('../../lib/deviceManagement');

class Dimmer extends ZigBeeLightDevice {

	async onNodeInit({ zclNode }) {
		await super.onNodeInit({ zclNode });

		if (this.hasCapability('onoff')) {

			await this.configureAttributeReporting([
				{
					endpointId: 1,
					cluster: CLUSTER.ON_OFF,
					attributeName: 'onOff',
					minInterval: 0,
					maxInterval: 300,
					minChange: null,
				},
			]);
		}

		if (this.hasCapability('dim')) {

			await this.configureAttributeReporting([
				{
					endpointId: 1,
					cluster: CLUSTER.LEVEL_CONTROL,
					attributeName: 'currentLevel',
					minInterval: 0,
					maxInterval: 300,
					minChange: 10,
				},
			]);

		}

		// measure_power
		//D1 and D1-R, endpoint #4

		if (this.hasCapability('meter_power')) {
			this.registerCapability('meter_power', CLUSTER.METERING, {
				getOpts: {
					getOnStart: true,
					pollInterval: 360000,
				},
				endpoint: this.getClusterEndpoint(CLUSTER.METERING),
			});
		}

		if (this.hasCapability('measure_power')) {
			this.registerCapability('measure_power', CLUSTER.METERING, {
				get: 'instantaneousDemand',
				reportParser(value) {
					if (value < 0 && value >= -2) return;
					return value;
				},
				report: 'instantaneousDemand',
				getOpts: {
					getOnStart: true,
				},
				endpoint: this.getClusterEndpoint(CLUSTER.METERING),
			});

			await this.configureAttributeReporting([
				{
					endpointId: this.getClusterEndpoint(CLUSTER.METERING),
					cluster: CLUSTER.METERING,
					attributeName: 'instantaneousDemand',
					minInterval: 0,
					maxInterval: 600, //once per ~5 min
					minChange: 10,
				}
			]);

		}
	}
}

module.exports = Dimmer;
