'use strict';

const { ZigBeeLightDevice } = require('homey-zigbeedriver');
const { CLUSTER } = require('zigbee-clusters');
//const { deviceManagement } = require('../../lib/deviceManagement');

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

		if (this.hasCapability('measure_power')) {
			if (typeof this.activePowerFactor !== 'number') {
				const { acPowerMultiplier, acPowerDivisor } = await zclNode.endpoints[
					this.getClusterEndpoint(CLUSTER.ELECTRICAL_MEASUREMENT)
				]
				.clusters[CLUSTER.ELECTRICAL_MEASUREMENT.NAME]
				.readAttributes('acPowerMultiplier', 'acPowerDivisor');

				this.activePowerFactor = acPowerMultiplier / acPowerDivisor;
			}

			this.registerCapability('measure_power', CLUSTER.METERING, {
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
					maxInterval: 300,
					minChange: 1,
				}
			]);

		}
	}
}

module.exports = Dimmer;
