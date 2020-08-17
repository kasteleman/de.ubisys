'use strict';

const { ZigBeeDevice } = require('homey-zigbeedriver');
const { CLUSTER } = require('zigbee-clusters');

class Switch extends ZigBeeDevice {

	async onNodeInit(zclNode) {
		if (this.hasCapability('onoff')) {
			this.registerCapability('onoff', CLUSTER.ON_OFF);
		}

		//measure_power
		//S1, endpoint #3; S1-R, endpoint #4
		let meteringEndpoint = this.getMeteringEndpointId();
		if (this.hasCapability('measure_power')) {
			await this.configureAttributeReporting([
				{
					endpointId: meteringEndpoint,
					cluster: CLUSTER.METERING,
					attributeName: 'instantaneousDemand',
					minInterval: 0,
					maxInterval: 60000, //one per ~16 hours at minimum
					minChange: 1,
				}
			]);

			zclNode.endpoints[meteringEndpoint].clusters[CLUSTER.METERING.NAME]
				.on('attr.instantaneousDemand', (instantaneousDemand) => {
					let watt = Math.max(instantaneousDemand, 0);
					this.log('watt: ', watt);
					this.setCapabilityValue('measure_power', watt);
				});
		}
	}

}

module.exports = Switch;
