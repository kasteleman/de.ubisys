'use strict';

const PowerFactor = 100;

const Homey = require('homey');

const ZigBeeDevice = require('homey-meshdriver').ZigBeeDevice;

class S2R_5502 extends ZigBeeDevice {

	onMeshInit() {
		this.printNode();
		this.enableDebug();
		this.PowerFactor = 1000;

		this.registerCapability('onoff', 'genOnOff', { endpoint: 0 });

		this.registerAttrReportListener('genOnOff', 'onOff', 1, 0, 1, value => {
			this.log('onoff', value);
			this.setCapabilityValue('onoff', value === 1);
		}, 0);

		this.registerCapability('onoff.1', 'genOnOff', { endpoint: 1 });

		this.registerAttrReportListener('genOnOff', 'onOff', 1, 0, 0, value => {
			this.log('onoff.1', value);
			this.setCapabilityValue('onoff.1', value === 1);
		}, 1);

		// measure_power
		if (this.hasCapability('measure_power')) {
			this.registerCapability('measure_power', 'seMetering', { endpoint: 4 });
		}

		this.registerAttrReportListener('seMetering', 'instantaneousDemand', 1, 300, 1, value => {
			this.parsedValue = value;
			this.log('instantaneousDemand', value, this.parsedValue);
			if (value < 0) return;
			this.setCapabilityValue('measure_power', this.parsedValue);
		}, 4);

		/*	this.node.endpoints[6].clusters['64512'].read('1')
			.then(switchconfig => {
				this.log('switchconfig: ', new Buffer(switchconfig, 'ascii'));
			})
			.catch(err => {
				this.log('could not read switchconfig');
				this.log(err);
			}); */

		// Register triggers for flows
		this._triggerSwitchTwoOn = new Homey.FlowCardTriggerDevice('switch2_turned_on').register();
		this._triggerSwitchTwoOff = new Homey.FlowCardTriggerDevice('switch2_turned_off').register();

		// Register conditions for flows
		this._conditionSwitchTwo = new Homey.FlowCardCondition('switch2_is_on').register()
			.registerRunListener((args, state) => {
				return Promise.resolve(args.S2R_5502.getCapabilityValue('onoff.1'));
			});

		// Register actions for flows
		this._actionSwitchTwoOn = new Homey.FlowCardAction('turn_on_switch2').register()
			.registerRunListener((args, state) => {
				return args.S2R_5502.triggerCapabilityListener('onoff.1', true, {});
			});
		this._actionSwitchTwoOff = new Homey.FlowCardAction('turn_off_switch2').register()
			.registerRunListener((args, state) => {
				return args.S2R_5502.triggerCapabilityListener('onoff.1', false, {});
			});
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

}

module.exports = S2R_5502;
