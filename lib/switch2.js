'use strict';

const { ZigBeeDevice } = require('homey-zigbeedriver');
const { CLUSTER } = require('zigbee-clusters');

class Switch2 extends ZigBeeDevice {

	async onNodeInit(zclNode) {
		//Application Endpoint #1 – On/off Output #1
		//Application Endpoint #2 – On/off Output #2
		if (this.hasCapability('onoff')) {
			this.registerCapability('onoff', CLUSTER.ON_OFF);
		}

		// measure_power
		//S2, S2-R, endpoint #5
		let meteringEndpoint = 5;
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

	/*

	onMeshInit() {
		//Set endpoint for metering information
		this.meteringEnpoint = 4;
		//Initialize the basic shared settings
		super.initCore();

		//Switch 2
		this.registerCapability('onoff.1', 'genOnOff', { endpoint: 1 });
		this.registerAttrReportListener('genOnOff', 'onOff', 1, 0, null,
			this.onOffSwitch2Report.bind(this), 1)
			.catch(err => {
				this.error('failed to register attr report listener - genOnOff/onOff.1', err);
			});

		this._triggerSwitchTwoOn = new Homey.FlowCardTriggerDevice('switch2_turned_on').register();
		this._triggerSwitchTwoOff = new Homey.FlowCardTriggerDevice('switch2_turned_off').register();

		// Register conditions for flows
		this._conditionSwitchTwo = new Homey.FlowCardCondition('switch2_is_on').register()
			.registerRunListener((args, state) => {
				return Promise.resolve(args.S2R_5602.getCapabilityValue('onoff.1'));
			});

		// Register actions for flows
		this._actionSwitchTwoOn = new Homey.FlowCardAction('turn_on_switch2').register()
			.registerRunListener((args, state) => {
				return args.S2R_5602.triggerCapabilityListener('onoff.1', true, {});
			});
		this._actionSwitchTwoOff = new Homey.FlowCardAction('turn_off_switch2').register()
			.registerRunListener((args, state) => {
				return args.S2R_5602.triggerCapabilityListener('onoff.1', false, {});
			});
	}

	onOffSwitch2Report(value) {
		const parsedValue = (value === 1);
		this.log('Switch2, genOnOff.1', value, parsedValue);
		this.setCapabilityValue('onoff.1', parsedValue);
		this.log('Firing switch2 trigger ', parsedValue ? 'On' : 'Off');
		if (parsedValue) {
			this._triggerSwitchTwoOn.trigger(this, {}, {}).catch(this.error);
		} else {
			this._triggerSwitchTwoOff.trigger(this, {}, {}).catch(this.error);
		}
	}

	// Temporary till until Zigbee Meshdriver bug is fixed. See https://github.com/athombv/homey/issues/2137
	// Rewrite parent method to overcome Zigbee Meshdriver bug.
	_mergeSystemAndUserOpts(capabilityId, clusterId, userOpts) {

		// Merge systemOpts & userOpts
		let systemOpts = {};

		let tempCapabilityId = capabilityId;
		const index = tempCapabilityId.lastIndexOf('.');
		if (index !== -1) {
			tempCapabilityId = tempCapabilityId.slice(0, index);
		}

		try {
			systemOpts = Homey.util.recursiveDeepCopy(require(`../../node_modules/homey-meshdriver/lib/zigbee/system/capabilities/${tempCapabilityId}/${clusterId}.js`));

			// Bind correct scope
			for (const i in systemOpts) {
				if (systemOpts.hasOwnProperty(i) && typeof systemOpts[i] === 'function') {
					systemOpts[i] = systemOpts[i].bind(this);
				}
			}
		} catch (err) {
			if (err.code !== 'MODULE_NOT_FOUND' || err.message.indexOf(`../../node_modules/homey-meshdriver/lib/zigbee/system/capabilities/${tempCapabilityId}/${clusterId}.js`) < 0) {
				process.nextTick(() => {
					throw err;
				});
			}
		}

		// Insert default endpoint zero
		if (userOpts && !userOpts.hasOwnProperty('endpoint')) userOpts.endpoint = this.getClusterEndpoint(clusterId);
		else if (typeof userOpts === 'undefined') {
			userOpts = {
				endpoint: this.getClusterEndpoint(clusterId),
			};
		}

		this._capabilities[capabilityId][clusterId] = Object.assign(
			systemOpts || {},
			userOpts || {}
		);
	}
*/
}

module.exports = Switch2;
