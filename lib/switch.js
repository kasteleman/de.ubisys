'use strict';

const { ZigBeeDevice } = require('homey-zigbeedriver');
const { CLUSTER } = require('zigbee-clusters');
//const { deviceManagement } = require('../../lib/devicemanagement');

class Switch extends ZigBeeDevice {

	async onNodeInit({ zclNode }) {
		await super.onNodeInit({ zclNode });
		if (this.hasCapability('onoff')) {
			this.registerCapability('onoff', CLUSTER.ON_OFF);

			await this.configureAttributeReporting([
				{
					endpointId: 1,
					cluster: CLUSTER.ON_OFF,
					attributeName: 'onOff',
					minInterval: 0,
					maxInterval: 300,
				},
			]);
		}

		//measure_power
		//S1, endpoint #3; S1-R, endpoint #4

		if (this.hasCapability('meter_power')) {
			if (typeof this.meteringFactor !== 'number') {
				const { multiplier, divisor } = await zclNode.endpoints[
						this.getClusterEndpoint(CLUSTER.METERING)
					]
					.clusters[CLUSTER.METERING.NAME]
					.readAttributes('multiplier', 'divisor');

				this.meteringFactor = multiplier / divisor;
			}
			this.registerCapability('meter_power', CLUSTER.METERING, {
				getOpts: {
					getOnStart: true,
				},
				endpoint: this.getClusterEndpoint(CLUSTER.METERING),
			});
			await this.configureAttributeReporting([
				{
					endpointId: this.getClusterEndpoint(CLUSTER.METERING),
					cluster: CLUSTER.METERING,
					attributeName: 'currentSummationDelivered',
					minInterval: 0,
					maxInterval: 300, //once per ~5 min
					minChange: 1,
				}
			]);

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
					maxInterval: 300, //once per ~5 min
					minChange: 10,
				}
			]);

		}
	}

}

module.exports = Switch;
