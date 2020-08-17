'use strict';

const { ZigBeeLightDevice } = require('homey-zigbeedriver');
const { CLUSTER } = require('zigbee-clusters');

class Dimmer extends ZigBeeLightDevice {

	async onNodeInit({ zclNode, node }) {
		await super.onNodeInit({ zclNode, node });

		// measure_power
		//D1 and D1-R, endpoint #4
		let meteringEndpoint = 4;
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

module.exports = Dimmer;
