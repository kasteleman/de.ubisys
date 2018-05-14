'use strict';

const Homey = require('homey');

const ZigBeeDevice = require('homey-meshdriver').ZigBeeDevice;

class S2_5502 extends ZigBeeDevice {

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
				return Promise.resolve(args.S2_5502.getCapabilityValue('onoff.1'));
			});

		// Register actions for flows
		this._actionSwitchTwoOn = new Homey.FlowCardAction('turn_on_switch2').register()
			.registerRunListener((args, state) => {
				return args.S2_5502.triggerCapabilityListener('onoff.1', true, {});
			});
		this._actionSwitchTwoOff = new Homey.FlowCardAction('turn_off_switch2').register()
			.registerRunListener((args, state) => {
				return args.S2_5502.triggerCapabilityListener('onoff.1', false, {});
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

module.exports = S2_5502;

// [log] [ManagerDrivers] [S2_5502] [0] ZigBeeDevice has been inited
// [log] [ManagerDrivers] [S2_5502] [0] ------------------------------------------
// [log] [ManagerDrivers] [S2_5502] [0] Node: 1df462ad-c0c7-4ac3-bdad-e37876740db1
// [log] [ManagerDrivers] [S2_5502] [0] - Battery: false
// [log] [ManagerDrivers] [S2_5502] [0] - Endpoints: 0
// [log] [ManagerDrivers] [S2_5502] [0] -- Clusters:
// [log] [ManagerDrivers] [S2_5502] [0] --- zapp
// [log] [ManagerDrivers] [S2_5502] [0] --- genBasic
// [log] [ManagerDrivers] [S2_5502] [0] ---- 65533 : 1
// [log] [ManagerDrivers] [S2_5502] [0] ---- cid : genBasic
// [log] [ManagerDrivers] [S2_5502] [0] ---- sid : attrs
// [log] [ManagerDrivers] [S2_5502] [0] ---- zclVersion : 2
// [log] [ManagerDrivers] [S2_5502] [0] ---- appVersion : 1
// [log] [ManagerDrivers] [S2_5502] [0] ---- stackVersion : 1
// [log] [ManagerDrivers] [S2_5502] [0] ---- hwVersion : 5
// [log] [ManagerDrivers] [S2_5502] [0] ---- manufacturerName : ubisys
// [log] [ManagerDrivers] [S2_5502] [0] ---- modelId : S2 (5502)
// [log] [ManagerDrivers] [S2_5502] [0] ---- dateCode : 20170202-DE-FB0
// [log] [ManagerDrivers] [S2_5502] [0] ---- powerSource : 1
// [log] [ManagerDrivers] [S2_5502] [0] ---- locationDesc :
// [log] [ManagerDrivers] [S2_5502] [0] ---- physicalEnv : 0
// [log] [ManagerDrivers] [S2_5502] [0] --- genIdentify
// [log] [ManagerDrivers] [S2_5502] [0] ---- 65533 : 1
// [log] [ManagerDrivers] [S2_5502] [0] ---- cid : genIdentify
// [log] [ManagerDrivers] [S2_5502] [0] ---- sid : attrs
// [log] [ManagerDrivers] [S2_5502] [0] ---- identifyTime : 0
// [log] [ManagerDrivers] [S2_5502] [0] --- genGroups
// [log] [ManagerDrivers] [S2_5502] [0] ---- 65533 : 1
// [log] [ManagerDrivers] [S2_5502] [0] ---- cid : genGroups
// [log] [ManagerDrivers] [S2_5502] [0] ---- sid : attrs
// [log] [ManagerDrivers] [S2_5502] [0] ---- nameSupport : 0
// [log] [ManagerDrivers] [S2_5502] [0] --- genScenes
// [log] [ManagerDrivers] [S2_5502] [0] ---- 65533 : 1
// [log] [ManagerDrivers] [S2_5502] [0] ---- cid : genScenes
// [log] [ManagerDrivers] [S2_5502] [0] ---- sid : attrs
// [log] [ManagerDrivers] [S2_5502] [0] ---- count : 0
// [log] [ManagerDrivers] [S2_5502] [0] ---- currentScene : 0
// [log] [ManagerDrivers] [S2_5502] [0] ---- currentGroup : 0
// [log] [ManagerDrivers] [S2_5502] [0] ---- sceneValid : 0
// [log] [ManagerDrivers] [S2_5502] [0] ---- nameSupport : 1
// [log] [ManagerDrivers] [S2_5502] [0] --- genOnOff
// [log] [ManagerDrivers] [S2_5502] [0] ---- 65533 : 1
// [log] [ManagerDrivers] [S2_5502] [0] ---- cid : genOnOff
// [log] [ManagerDrivers] [S2_5502] [0] ---- sid : attrs
// [log] [ManagerDrivers] [S2_5502] [0] ---- onOff : 0
// [log] [ManagerDrivers] [S2_5502] [0] - Endpoints: 1
// [log] [ManagerDrivers] [S2_5502] [0] -- Clusters:
// [log] [ManagerDrivers] [S2_5502] [0] --- zapp
// [log] [ManagerDrivers] [S2_5502] [0] --- genBasic
// [log] [ManagerDrivers] [S2_5502] [0] ---- 65533 : 1
// [log] [ManagerDrivers] [S2_5502] [0] ---- cid : genBasic
// [log] [ManagerDrivers] [S2_5502] [0] ---- sid : attrs
// [log] [ManagerDrivers] [S2_5502] [0] ---- zclVersion : 2
// [log] [ManagerDrivers] [S2_5502] [0] ---- appVersion : 1
// [log] [ManagerDrivers] [S2_5502] [0] ---- stackVersion : 1
// [log] [ManagerDrivers] [S2_5502] [0] ---- hwVersion : 5
// [log] [ManagerDrivers] [S2_5502] [0] ---- manufacturerName : ubisys
// [log] [ManagerDrivers] [S2_5502] [0] ---- modelId : S2 (5502)
// [log] [ManagerDrivers] [S2_5502] [0] ---- dateCode : 20170202-DE-FB0
// [log] [ManagerDrivers] [S2_5502] [0] ---- powerSource : 1
// [log] [ManagerDrivers] [S2_5502] [0] ---- locationDesc :
// [log] [ManagerDrivers] [S2_5502] [0] ---- physicalEnv : 0
// [log] [ManagerDrivers] [S2_5502] [0] --- genIdentify
// [log] [ManagerDrivers] [S2_5502] [0] ---- 65533 : 1
// [log] [ManagerDrivers] [S2_5502] [0] ---- cid : genIdentify
// [log] [ManagerDrivers] [S2_5502] [0] ---- sid : attrs
// [log] [ManagerDrivers] [S2_5502] [0] ---- identifyTime : 0
// [log] [ManagerDrivers] [S2_5502] [0] --- genGroups
// [log] [ManagerDrivers] [S2_5502] [0] ---- 65533 : 1
// [log] [ManagerDrivers] [S2_5502] [0] ---- cid : genGroups
// [log] [ManagerDrivers] [S2_5502] [0] ---- sid : attrs
// [log] [ManagerDrivers] [S2_5502] [0] ---- nameSupport : 0
// [log] [ManagerDrivers] [S2_5502] [0] --- genScenes
// [log] [ManagerDrivers] [S2_5502] [0] ---- 65533 : 1
// [log] [ManagerDrivers] [S2_5502] [0] ---- cid : genScenes
// [log] [ManagerDrivers] [S2_5502] [0] ---- sid : attrs
// [log] [ManagerDrivers] [S2_5502] [0] ---- count : 0
// [log] [ManagerDrivers] [S2_5502] [0] ---- currentScene : 0
// [log] [ManagerDrivers] [S2_5502] [0] ---- currentGroup : 0
// [log] [ManagerDrivers] [S2_5502] [0] ---- sceneValid : 0
// [log] [ManagerDrivers] [S2_5502] [0] ---- nameSupport : 1
// [log] [ManagerDrivers] [S2_5502] [0] --- genOnOff
// [log] [ManagerDrivers] [S2_5502] [0] ---- 65533 : 1
// [log] [ManagerDrivers] [S2_5502] [0] ---- cid : genOnOff
// [log] [ManagerDrivers] [S2_5502] [0] ---- sid : attrs
// [log] [ManagerDrivers] [S2_5502] [0] ---- onOff : 0
// [log] [ManagerDrivers] [S2_5502] [0] - Endpoints: 2
// [log] [ManagerDrivers] [S2_5502] [0] -- Clusters:
// [log] [ManagerDrivers] [S2_5502] [0] --- zapp
// [log] [ManagerDrivers] [S2_5502] [0] --- genBasic
// [log] [ManagerDrivers] [S2_5502] [0] ---- 65533 : 1
// [log] [ManagerDrivers] [S2_5502] [0] ---- cid : genBasic
// [log] [ManagerDrivers] [S2_5502] [0] ---- sid : attrs
// [log] [ManagerDrivers] [S2_5502] [0] ---- zclVersion : 2
// [log] [ManagerDrivers] [S2_5502] [0] ---- appVersion : 1
// [log] [ManagerDrivers] [S2_5502] [0] ---- stackVersion : 1
// [log] [ManagerDrivers] [S2_5502] [0] ---- hwVersion : 5
// [log] [ManagerDrivers] [S2_5502] [0] ---- manufacturerName : ubisys
// [log] [ManagerDrivers] [S2_5502] [0] ---- modelId : S2 (5502)
// [log] [ManagerDrivers] [S2_5502] [0] ---- dateCode : 20170202-DE-FB0
// [log] [ManagerDrivers] [S2_5502] [0] ---- powerSource : 1
// [log] [ManagerDrivers] [S2_5502] [0] ---- locationDesc :
// [log] [ManagerDrivers] [S2_5502] [0] ---- physicalEnv : 0
// [log] [ManagerDrivers] [S2_5502] [0] --- genIdentify
// [log] [ManagerDrivers] [S2_5502] [0] ---- 65533 : 1
// [log] [ManagerDrivers] [S2_5502] [0] ---- cid : genIdentify
// [log] [ManagerDrivers] [S2_5502] [0] ---- sid : attrs
// [log] [ManagerDrivers] [S2_5502] [0] ---- identifyTime : 0
// [log] [ManagerDrivers] [S2_5502] [0] --- genScenes
// [log] [ManagerDrivers] [S2_5502] [0] ---- cid : genScenes
// [log] [ManagerDrivers] [S2_5502] [0] ---- sid : attrs
// [log] [ManagerDrivers] [S2_5502] [0] --- genOnOff
// [log] [ManagerDrivers] [S2_5502] [0] ---- cid : genOnOff
// [log] [ManagerDrivers] [S2_5502] [0] ---- sid : attrs
// [log] [ManagerDrivers] [S2_5502] [0] --- genLevelCtrl
// [log] [ManagerDrivers] [S2_5502] [0] ---- cid : genLevelCtrl
// [log] [ManagerDrivers] [S2_5502] [0] ---- sid : attrs
// [log] [ManagerDrivers] [S2_5502] [0] - Endpoints: 3
// [log] [ManagerDrivers] [S2_5502] [0] -- Clusters:
// [log] [ManagerDrivers] [S2_5502] [0] --- zapp
// [log] [ManagerDrivers] [S2_5502] [0] --- genBasic
// [log] [ManagerDrivers] [S2_5502] [0] ---- 65533 : 1
// [log] [ManagerDrivers] [S2_5502] [0] ---- cid : genBasic
// [log] [ManagerDrivers] [S2_5502] [0] ---- sid : attrs
// [log] [ManagerDrivers] [S2_5502] [0] ---- zclVersion : 2
// [log] [ManagerDrivers] [S2_5502] [0] ---- appVersion : 1
// [log] [ManagerDrivers] [S2_5502] [0] ---- stackVersion : 1
// [log] [ManagerDrivers] [S2_5502] [0] ---- hwVersion : 5
// [log] [ManagerDrivers] [S2_5502] [0] ---- manufacturerName : ubisys
// [log] [ManagerDrivers] [S2_5502] [0] ---- modelId : S2 (5502)
// [log] [ManagerDrivers] [S2_5502] [0] ---- dateCode : 20170202-DE-FB0
// [log] [ManagerDrivers] [S2_5502] [0] ---- powerSource : 1
// [log] [ManagerDrivers] [S2_5502] [0] ---- locationDesc :
// [log] [ManagerDrivers] [S2_5502] [0] ---- physicalEnv : 0
// [log] [ManagerDrivers] [S2_5502] [0] --- genIdentify
// [log] [ManagerDrivers] [S2_5502] [0] ---- 65533 : 1
// [log] [ManagerDrivers] [S2_5502] [0] ---- cid : genIdentify
// [log] [ManagerDrivers] [S2_5502] [0] ---- sid : attrs
// [log] [ManagerDrivers] [S2_5502] [0] ---- identifyTime : 0
// [log] [ManagerDrivers] [S2_5502] [0] --- genScenes
// [log] [ManagerDrivers] [S2_5502] [0] ---- cid : genScenes
// [log] [ManagerDrivers] [S2_5502] [0] ---- sid : attrs
// [log] [ManagerDrivers] [S2_5502] [0] --- genOnOff
// [log] [ManagerDrivers] [S2_5502] [0] ---- cid : genOnOff
// [log] [ManagerDrivers] [S2_5502] [0] ---- sid : attrs
// [log] [ManagerDrivers] [S2_5502] [0] --- genLevelCtrl
// [log] [ManagerDrivers] [S2_5502] [0] ---- cid : genLevelCtrl
// [log] [ManagerDrivers] [S2_5502] [0] ---- sid : attrs
// [log] [ManagerDrivers] [S2_5502] [0] - Endpoints: 4
// [log] [ManagerDrivers] [S2_5502] [0] -- Clusters:
// [log] [ManagerDrivers] [S2_5502] [0] --- zapp
// [log] [ManagerDrivers] [S2_5502] [0] --- genBasic
// [log] [ManagerDrivers] [S2_5502] [0] ---- 65533 : 1
// [log] [ManagerDrivers] [S2_5502] [0] ---- cid : genBasic
// [log] [ManagerDrivers] [S2_5502] [0] ---- sid : attrs
// [log] [ManagerDrivers] [S2_5502] [0] ---- zclVersion : 2
// [log] [ManagerDrivers] [S2_5502] [0] ---- appVersion : 1
// [log] [ManagerDrivers] [S2_5502] [0] ---- stackVersion : 1
// [log] [ManagerDrivers] [S2_5502] [0] ---- hwVersion : 5
// [log] [ManagerDrivers] [S2_5502] [0] ---- manufacturerName : ubisys
// [log] [ManagerDrivers] [S2_5502] [0] ---- modelId : S2 (5502)
// [log] [ManagerDrivers] [S2_5502] [0] ---- dateCode : 20170202-DE-FB0
// [log] [ManagerDrivers] [S2_5502] [0] ---- powerSource : 1
// [log] [ManagerDrivers] [S2_5502] [0] ---- locationDesc :
// [log] [ManagerDrivers] [S2_5502] [0] ---- physicalEnv : 0
// [log] [ManagerDrivers] [S2_5502] [0] --- seMetering
// [log] [ManagerDrivers] [S2_5502] [0] ---- 65533 : 1
// [log] [ManagerDrivers] [S2_5502] [0] ---- cid : seMetering
// [log] [ManagerDrivers] [S2_5502] [0] ---- sid : attrs
// [log] [ManagerDrivers] [S2_5502] [0] ---- currentSummDelivered : [ 0, 0 ]
// [log] [ManagerDrivers] [S2_5502] [0] ---- currentSummReceived : [ 0, 0 ]
// [log] [ManagerDrivers] [S2_5502] [0] ---- currentMaxDemandDelivered : [ 0, 0 ]
// [log] [ManagerDrivers] [S2_5502] [0] ---- currentMaxDemandReceived : [ 0, 0 ]
// [log] [ManagerDrivers] [S2_5502] [0] ---- powerFactor : 100
// [log] [ManagerDrivers] [S2_5502] [0] ---- status : 0
// [log] [ManagerDrivers] [S2_5502] [0] ---- unitOfMeasure : 0
// [log] [ManagerDrivers] [S2_5502] [0] ---- multiplier : 16777215
// [log] [ManagerDrivers] [S2_5502] [0] ---- divisor : 16777215
// [log] [ManagerDrivers] [S2_5502] [0] ---- instantaneousDemand : 0
// [log] [ManagerDrivers] [S2_5502] [0] --- haElectricalMeasurement
// [log] [ManagerDrivers] [S2_5502] [0] ---- 65533 : 1
// [log] [ManagerDrivers] [S2_5502] [0] ---- cid : haElectricalMeasurement
// [log] [ManagerDrivers] [S2_5502] [0] ---- sid : attrs
// [log] [ManagerDrivers] [S2_5502] [0] ---- measurementType : 15
// [log] [ManagerDrivers] [S2_5502] [0] ---- acFrequency : 49622
// [log] [ManagerDrivers] [S2_5502] [0] ---- totalActivePower : 0
// [log] [ManagerDrivers] [S2_5502] [0] ---- totalReactivePower : 0
// [log] [ManagerDrivers] [S2_5502] [0] ---- totalApparentPower : 0
// [log] [ManagerDrivers] [S2_5502] [0] ---- rmsVoltage : 235
// [log] [ManagerDrivers] [S2_5502] [0] ---- rmsCurrent : 0
// [log] [ManagerDrivers] [S2_5502] [0] ---- activePower : 0
// [log] [ManagerDrivers] [S2_5502] [0] ---- reactivePower : 0
// [log] [ManagerDrivers] [S2_5502] [0] ---- apparentPower : 0
// [log] [ManagerDrivers] [S2_5502] [0] ---- powerFactor : 100
// [log] [ManagerDrivers] [S2_5502] [0] - Endpoints: 5
// [log] [ManagerDrivers] [S2_5502] [0] -- Clusters:
// [log] [ManagerDrivers] [S2_5502] [0] --- zapp
// [log] [ManagerDrivers] [S2_5502] [0] - Endpoints: 6
// [log] [ManagerDrivers] [S2_5502] [0] -- Clusters:
// [log] [ManagerDrivers] [S2_5502] [0] --- 64512
// [log] [ManagerDrivers] [S2_5502] [0] ---- 0 : { elmType: 8, numElms: 2, elmVals: [], _isCb: false }
// [log] [ManagerDrivers] [S2_5502] [0] ---- 1 : { elmType: 65, numElms: 2, elmVals: [ '\u0000\r\u0003\u0006\u0000\u0002', '\u0001\r\u0004\u0006\u0000\u0002' ],  _isCb: false
// [log] [ManagerDrivers] [S2_5502] [0] ---- 65533 : 1
// [log] [ManagerDrivers] [S2_5502] [0] ---- cid : 64512
// [log] [ManagerDrivers] [S2_5502] [0] ---- sid : attrs
// [log] [ManagerDrivers] [S2_5502] [0] --- zapp
// [log] [ManagerDrivers] [S2_5502] [0] --- genBasic
// [log] [ManagerDrivers] [S2_5502] [0] ---- 65533 : 1
// [log] [ManagerDrivers] [S2_5502] [0] ---- cid : genBasic
// [log] [ManagerDrivers] [S2_5502] [0] ---- sid : attrs
// [log] [ManagerDrivers] [S2_5502] [0] ---- zclVersion : 2
// [log] [ManagerDrivers] [S2_5502] [0] ---- appVersion : 1
// [log] [ManagerDrivers] [S2_5502] [0] ---- stackVersion : 1
// [log] [ManagerDrivers] [S2_5502] [0] ---- hwVersion : 5
// [log] [ManagerDrivers] [S2_5502] [0] ---- manufacturerName : ubisys
// [log] [ManagerDrivers] [S2_5502] [0] ---- modelId : S2 (5502)
// [log] [ManagerDrivers] [S2_5502] [0] ---- dateCode : 20170202-DE-FB0
// [log] [ManagerDrivers] [S2_5502] [0] ---- powerSource : 1
// [log] [ManagerDrivers] [S2_5502] [0] ---- locationDesc :
// [log] [ManagerDrivers] [S2_5502] [0] ---- physicalEnv : 0
// [log] [ManagerDrivers] [S2_5502] [0] --- genIdentify
// [log] [ManagerDrivers] [S2_5502] [0] ---- cid : genIdentify
// [log] [ManagerDrivers] [S2_5502] [0] ---- sid : attrs
// [log] [ManagerDrivers] [S2_5502] [0] --- genCommissioning
// [log] [ManagerDrivers] [S2_5502] [0] ---- 7 : 0
// [log] [ManagerDrivers] [S2_5502] [0] ---- 65533 : 1
// [log] [ManagerDrivers] [S2_5502] [0] ---- cid : genCommissioning
// [log] [ManagerDrivers] [S2_5502] [0] ---- sid : attrs
// [log] [ManagerDrivers] [S2_5502] [0] ---- shortress : 36698
// [log] [ManagerDrivers] [S2_5502] [0] ---- extendedPANId : 0xdddddddddddddddd
// [log] [ManagerDrivers] [S2_5502] [0] ---- panId : 52993
// [log] [ManagerDrivers] [S2_5502] [0] ---- channelmask : 134215680
// [log] [ManagerDrivers] [S2_5502] [0] ---- protocolVersion : 2
// [log] [ManagerDrivers] [S2_5502] [0] ---- stackProfile : 2
// [log] [ManagerDrivers] [S2_5502] [0] ---- startupControl : 0
// [log] [ManagerDrivers] [S2_5502] [0] ---- trustCenterress : 0x00124b0005f0cd16
// [log] [ManagerDrivers] [S2_5502] [0] ---- trustCenterMasterKey : [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]
// [log] [ManagerDrivers] [S2_5502] [0] ---- networkKey : [ 1, 3, 5, 7, 9, 11, 13, 15, 0, 2, 4, 6, 8, 10, 12, 13 ]
// [log] [ManagerDrivers] [S2_5502] [0] ---- useInsecureJoin : 1
// [log] [ManagerDrivers] [S2_5502] [0] ---- preconfiguredLinkKey : [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]
// [log] [ManagerDrivers] [S2_5502] [0] ---- networkKeySeqNum : 0
// [log] [ManagerDrivers] [S2_5502] [0] ---- networkKeyType : 1
// [log] [ManagerDrivers] [S2_5502] [0] ---- networkManagerress : 0
// [log] [ManagerDrivers] [S2_5502] [0] ---- scanAttempts : 0
// [log] [ManagerDrivers] [S2_5502] [0] ---- timeBetweenScans : 0
// [log] [ManagerDrivers] [S2_5502] [0] ---- rejoinInterval : 0
// [log] [ManagerDrivers] [S2_5502] [0] ---- maxRejoinInterval : 0
// [log] [ManagerDrivers] [S2_5502] [0] ---- indirectPollRate : 0
// [log] [ManagerDrivers] [S2_5502] [0] ---- parentRetryThreshold : 0
// [log] [ManagerDrivers] [S2_5502] [0] ---- concentratorFlag : 0
// [log] [ManagerDrivers] [S2_5502] [0] ---- concentratorRus : 0
// [log] [ManagerDrivers] [S2_5502] [0] ---- concentratorDiscoveryTime : 0
// [log] [ManagerDrivers] [S2_5502] [0] --- genOta
// [log] [ManagerDrivers] [S2_5502] [0] ---- cid : genOta
// [log] [ManagerDrivers] [S2_5502] [0] ---- sid : attrs
// [log] [ManagerDrivers] [S2_5502] [0] - Endpoints: 7
// [log] [ManagerDrivers] [S2_5502] [0] -- Clusters:
// [log] [ManagerDrivers] [S2_5502] [0] --- zapp
// [log] [ManagerDrivers] [S2_5502] [0] --- genGreenPowerProxy
// [log] [ManagerDrivers] [S2_5502] [0] ---- cid : genGreenPowerProxy
// [log] [ManagerDrivers] [S2_5502] [0] ---- sid : attrs
// [log] [ManagerDrivers] [S2_5502] [0] ------------------------------------------
