'use strict';

const { ZigBeeDevice } = require('homey-zigbeedriver');
const {
  zclNode, debug, Cluster, CLUSTER,
} = require('zigbee-clusters');
//const { CLUSTER } = require('zigbee-clusters');

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

		// add capability meter_power if not already present like in sdkv2 driver
		if (!this.hasCapability('meter_power')) {
			this.addCapability('meter_power')
		};

		if (typeof this.meteringFactor !== 'number') {
			const { multiplier, divisor } = await zclNode.endpoints[
				this.getClusterEndpoint(CLUSTER.METERING)
			]
			.clusters[CLUSTER.METERING.NAME]
			.readAttributes('multiplier', 'divisor');
			this.meteringFactor = multiplier / divisor;
		}

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

module.exports = Switch;
