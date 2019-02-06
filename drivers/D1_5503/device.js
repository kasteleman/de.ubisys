'use strict';

const Homey = require('homey');

const ZigBeeDevice = require('homey-meshdriver').ZigBeeDevice;

class D1_5503 extends ZigBeeDevice {

	onMeshInit() {
		this.printNode();
		this.enableDebug();

		this.PowerFactor = 1000;

		if (this.hasCapability('onoff')) this.registerCapability('onoff', 'genOnOff');

		this.registerAttrReportListener('genOnOff', 'onOff', 1, 0, 1, value => {
			this.log('onoff', value);
			this.setCapabilityValue('onoff', value === 1);
		}, 0);

		if (this.hasCapability('dim')) {
			this.registerCapability('dim', 'genLevelCtrl');
		}

		this.registerAttrReportListener('genLevelCtrl', 'currentLevel', 1, 0, null,
			this.onDimLevelReport.bind(this), 0)
				.catch(err => {
					// Registering attr reporting failed
					this.error('failed to register attr report listener - genLevelCtrl/currentLevel', err);
				});

		// measure_power
		if (this.hasCapability('measure_power')) {
			this.registerCapability('measure_power', 'seMetering', { endpoint: 3 });
		}

		this.registerAttrReportListener('seMetering', 'instantaneousDemand', 1, 0, null,
			this.onMeteringReport.bind(this), 3)
				.catch(err => {
					// Registering attr reporting failed
					this.error('failed to register attr report listener - seMetering/instantaneousDemand', err);
				});

		this.registerReportListener('genOnOff', 'onOff', report => {
			console.log(report);
		}, 2);

		// [log] [ManagerDrivers] [D1-5503] [0] - Endpoints: 5
		// [log] [ManagerDrivers] [D1-5503] [0] -- Clusters:
		// [log] [ManagerDrivers] [D1-5503] [0] --- 64512
		// [log] [ManagerDrivers] [D1-5503] [0] ---- 0 : { elmType: 8, numElms: 2, elmVals: [], _isCb: false }

	/*	this.node.endpoints[5].clusters['64512'].read('0')
			.then(switchconfig => {
				this.log('switchconfig: ', new Buffer(switchconfig, 'ascii'));
			})
			.catch(err => {
				this.log('could not read switchconfig');
				this.log(err);
			}); */

	}

	onMeteringReport(value) {
		const parsedValue = Math.max(0, value);
		this.log('instantaneousDemand', value, parsedValue);
		this.setCapabilityValue('measure_power', parsedValue);
	}

	onDimLevelReport(value) {
		const parsedValue = value / 254;
		this.log('currentLevel', value, parsedValue);
		this.setCapabilityValue('dim', parsedValue);
	}


}

module.exports = D1_5503;


// [log] [ManagerDrivers] [D1_5503] [0] ZigBeeDevice has been inited
// [log] [ManagerDrivers] [D1_5503] [0] ------------------------------------------
// [log] [ManagerDrivers] [D1_5503] [0] Node: 75facb77-6ec2-4cad-bea4-6a2c9fd76c76
// [log] [ManagerDrivers] [D1_5503] [0] - Battery: false
// [log] [ManagerDrivers] [D1_5503] [0] - Endpoints: 0
// [log] [ManagerDrivers] [D1_5503] [0] -- Clusters:
// [log] [ManagerDrivers] [D1_5503] [0] --- 64513
// [log] [ManagerDrivers] [D1_5503] [0] ---- 0 : 227
// [log] [ManagerDrivers] [D1_5503] [0] ---- 1 : 198
// [log] [ManagerDrivers] [D1_5503] [0] ---- 2 : 0
// [log] [ManagerDrivers] [D1_5503] [0] ---- 65533 : 1
// [log] [ManagerDrivers] [D1_5503] [0] ---- cid : 64513
// [log] [ManagerDrivers] [D1_5503] [0] ---- sid : attrs
// [log] [ManagerDrivers] [D1_5503] [0] --- zapp
// [log] [ManagerDrivers] [D1_5503] [0] --- genBasic
// [log] [ManagerDrivers] [D1_5503] [0] ---- 9 : 255
// [log] [ManagerDrivers] [D1_5503] [0] ---- 10 :
// [log] [ManagerDrivers] [D1_5503] [0] ---- 11 :
// [log] [ManagerDrivers] [D1_5503] [0] ---- 65533 : 1
// [log] [ManagerDrivers] [D1_5503] [0] ---- cid : genBasic
// [log] [ManagerDrivers] [D1_5503] [0] ---- sid : attrs
// [log] [ManagerDrivers] [D1_5503] [0] ---- zclVersion : 2
// [log] [ManagerDrivers] [D1_5503] [0] ---- appVersion : 1
// [log] [ManagerDrivers] [D1_5503] [0] ---- stackVersion : 1
// [log] [ManagerDrivers] [D1_5503] [0] ---- hwVersion : 5
// [log] [ManagerDrivers] [D1_5503] [0] ---- manufacturerName : ubisys
// [log] [ManagerDrivers] [D1_5503] [0] ---- modelId : D1 (5503)
// [log] [ManagerDrivers] [D1_5503] [0] ---- dateCode : 20190114-DE-FB0
// [log] [ManagerDrivers] [D1_5503] [0] ---- powerSource : 1
// [log] [ManagerDrivers] [D1_5503] [0] ---- appProfileVersion : 255
// [log] [ManagerDrivers] [D1_5503] [0] ---- locationDesc :
// [log] [ManagerDrivers] [D1_5503] [0] ---- physicalEnv : 0
// [log] [ManagerDrivers] [D1_5503] [0] ---- swBuildId :
// [log] [ManagerDrivers] [D1_5503] [0] --- genIdentify
// [log] [ManagerDrivers] [D1_5503] [0] ---- 65533 : 1
// [log] [ManagerDrivers] [D1_5503] [0] ---- cid : genIdentify
// [log] [ManagerDrivers] [D1_5503] [0] ---- sid : attrs
// [log] [ManagerDrivers] [D1_5503] [0] ---- identifyTime : 0
// [log] [ManagerDrivers] [D1_5503] [0] --- genGroups
// [log] [ManagerDrivers] [D1_5503] [0] ---- 65533 : 1
// [log] [ManagerDrivers] [D1_5503] [0] ---- cid : genGroups
// [log] [ManagerDrivers] [D1_5503] [0] ---- sid : attrs
// [log] [ManagerDrivers] [D1_5503] [0] ---- nameSupport : 0
// [log] [ManagerDrivers] [D1_5503] [0] --- genScenes
// [log] [ManagerDrivers] [D1_5503] [0] ---- 65533 : 1
// [log] [ManagerDrivers] [D1_5503] [0] ---- cid : genScenes
// [log] [ManagerDrivers] [D1_5503] [0] ---- sid : attrs
// [log] [ManagerDrivers] [D1_5503] [0] ---- count : 0
// [log] [ManagerDrivers] [D1_5503] [0] ---- currentScene : 0
// [log] [ManagerDrivers] [D1_5503] [0] ---- currentGroup : 0
// [log] [ManagerDrivers] [D1_5503] [0] ---- sceneValid : 0
// [log] [ManagerDrivers] [D1_5503] [0] ---- nameSupport : 1
// [log] [ManagerDrivers] [D1_5503] [0] --- genOnOff
// [log] [ManagerDrivers] [D1_5503] [0] ---- 16387 : 255
// [log] [ManagerDrivers] [D1_5503] [0] ---- 65533 : 1
// [log] [ManagerDrivers] [D1_5503] [0] ---- cid : genOnOff
// [log] [ManagerDrivers] [D1_5503] [0] ---- sid : attrs
// [log] [ManagerDrivers] [D1_5503] [0] ---- onOff : 1
// [log] [ManagerDrivers] [D1_5503] [0] ---- globalSceneCtrl : 1
// [log] [ManagerDrivers] [D1_5503] [0] ---- onTime : 0
// [log] [ManagerDrivers] [D1_5503] [0] ---- offWaitTime : 0
// [log] [ManagerDrivers] [D1_5503] [0] --- genLevelCtrl
// [log] [ManagerDrivers] [D1_5503] [0] ---- 15 : 1
// [log] [ManagerDrivers] [D1_5503] [0] ---- 16384 : 255
// [log] [ManagerDrivers] [D1_5503] [0] ---- 65533 : 1
// [log] [ManagerDrivers] [D1_5503] [0] ---- cid : genLevelCtrl
// [log] [ManagerDrivers] [D1_5503] [0] ---- sid : attrs
// [log] [ManagerDrivers] [D1_5503] [0] ---- currentLevel : 38
// [log] [ManagerDrivers] [D1_5503] [0] ---- remainingTime : 0
// [log] [ManagerDrivers] [D1_5503] [0] ---- onOffTransitionTime : 10
// [log] [ManagerDrivers] [D1_5503] [0] ---- onLevel : 255
// [log] [ManagerDrivers] [D1_5503] [0] --- lightingBallastCfg
// [log] [ManagerDrivers] [D1_5503] [0] ---- 65533 : 1
// [log] [ManagerDrivers] [D1_5503] [0] ---- cid : lightingBallastCfg
// [log] [ManagerDrivers] [D1_5503] [0] ---- sid : attrs
// [log] [ManagerDrivers] [D1_5503] [0] ---- physicalMinLevel : 1
// [log] [ManagerDrivers] [D1_5503] [0] ---- physicalMaxLevel : 254
// [log] [ManagerDrivers] [D1_5503] [0] ---- ballastStatus : 0
// [log] [ManagerDrivers] [D1_5503] [0] ---- minLevel : 1
// [log] [ManagerDrivers] [D1_5503] [0] ---- maxLevel : 254
// [log] [ManagerDrivers] [D1_5503] [0] - Endpoints: 1
// [log] [ManagerDrivers] [D1_5503] [0] -- Clusters:
// [log] [ManagerDrivers] [D1_5503] [0] --- zapp
// [log] [ManagerDrivers] [D1_5503] [0] --- genBasic
// [log] [ManagerDrivers] [D1_5503] [0] ---- 65533 : 1
// [log] [ManagerDrivers] [D1_5503] [0] ---- cid : genBasic
// [log] [ManagerDrivers] [D1_5503] [0] ---- sid : attrs
// [log] [ManagerDrivers] [D1_5503] [0] ---- zclVersion : 2
// [log] [ManagerDrivers] [D1_5503] [0] ---- appVersion : 1
// [log] [ManagerDrivers] [D1_5503] [0] ---- stackVersion : 1
// [log] [ManagerDrivers] [D1_5503] [0] ---- hwVersion : 5
// [log] [ManagerDrivers] [D1_5503] [0] ---- manufacturerName : ubisys
// [log] [ManagerDrivers] [D1_5503] [0] ---- modelId : D1 (5503)
// [log] [ManagerDrivers] [D1_5503] [0] ---- dateCode : 20190114-DE-FB0
// [log] [ManagerDrivers] [D1_5503] [0] ---- powerSource : 1
// [log] [ManagerDrivers] [D1_5503] [0] ---- locationDesc :
// [log] [ManagerDrivers] [D1_5503] [0] ---- physicalEnv : 0
// [log] [ManagerDrivers] [D1_5503] [0] --- genIdentify
// [log] [ManagerDrivers] [D1_5503] [0] ---- 65533 : 1
// [log] [ManagerDrivers] [D1_5503] [0] ---- cid : genIdentify
// [log] [ManagerDrivers] [D1_5503] [0] ---- sid : attrs
// [log] [ManagerDrivers] [D1_5503] [0] ---- identifyTime : 0
// [log] [ManagerDrivers] [D1_5503] [0] --- genScenes
// [log] [ManagerDrivers] [D1_5503] [0] ---- cid : genScenes
// [log] [ManagerDrivers] [D1_5503] [0] ---- sid : attrs
// [log] [ManagerDrivers] [D1_5503] [0] --- genOnOff
// [log] [ManagerDrivers] [D1_5503] [0] ---- cid : genOnOff
// [log] [ManagerDrivers] [D1_5503] [0] ---- sid : attrs
// [log] [ManagerDrivers] [D1_5503] [0] --- genLevelCtrl
// [log] [ManagerDrivers] [D1_5503] [0] ---- cid : genLevelCtrl
// [log] [ManagerDrivers] [D1_5503] [0] ---- sid : attrs
// [log] [ManagerDrivers] [D1_5503] [0] - Endpoints: 2
// [log] [ManagerDrivers] [D1_5503] [0] -- Clusters:
// [log] [ManagerDrivers] [D1_5503] [0] --- zapp
// [log] [ManagerDrivers] [D1_5503] [0] --- genBasic
// [log] [ManagerDrivers] [D1_5503] [0] ---- 65533 : 1
// [log] [ManagerDrivers] [D1_5503] [0] ---- cid : genBasic
// [log] [ManagerDrivers] [D1_5503] [0] ---- sid : attrs
// [log] [ManagerDrivers] [D1_5503] [0] ---- zclVersion : 2
// [log] [ManagerDrivers] [D1_5503] [0] ---- appVersion : 1
// [log] [ManagerDrivers] [D1_5503] [0] ---- stackVersion : 1
// [log] [ManagerDrivers] [D1_5503] [0] ---- hwVersion : 5
// [log] [ManagerDrivers] [D1_5503] [0] ---- manufacturerName : ubisys
// [log] [ManagerDrivers] [D1_5503] [0] ---- modelId : D1 (5503)
// [log] [ManagerDrivers] [D1_5503] [0] ---- dateCode : 20190114-DE-FB0
// [log] [ManagerDrivers] [D1_5503] [0] ---- powerSource : 1
// [log] [ManagerDrivers] [D1_5503] [0] ---- locationDesc :
// [log] [ManagerDrivers] [D1_5503] [0] ---- physicalEnv : 0
// [log] [ManagerDrivers] [D1_5503] [0] --- genIdentify
// [log] [ManagerDrivers] [D1_5503] [0] ---- 65533 : 1
// [log] [ManagerDrivers] [D1_5503] [0] ---- cid : genIdentify
// [log] [ManagerDrivers] [D1_5503] [0] ---- sid : attrs
// [log] [ManagerDrivers] [D1_5503] [0] ---- identifyTime : 0
// [log] [ManagerDrivers] [D1_5503] [0] --- genScenes
// [log] [ManagerDrivers] [D1_5503] [0] ---- cid : genScenes
// [log] [ManagerDrivers] [D1_5503] [0] ---- sid : attrs
// [log] [ManagerDrivers] [D1_5503] [0] --- genOnOff
// [log] [ManagerDrivers] [D1_5503] [0] ---- cid : genOnOff
// [log] [ManagerDrivers] [D1_5503] [0] ---- sid : attrs
// [log] [ManagerDrivers] [D1_5503] [0] --- genLevelCtrl
// [log] [ManagerDrivers] [D1_5503] [0] ---- cid : genLevelCtrl
// [log] [ManagerDrivers] [D1_5503] [0] ---- sid : attrs
// [log] [ManagerDrivers] [D1_5503] [0] - Endpoints: 3
// [log] [ManagerDrivers] [D1_5503] [0] -- Clusters:
// [log] [ManagerDrivers] [D1_5503] [0] --- zapp
// [log] [ManagerDrivers] [D1_5503] [0] --- genBasic
// [log] [ManagerDrivers] [D1_5503] [0] ---- 65533 : 1
// [log] [ManagerDrivers] [D1_5503] [0] ---- cid : genBasic
// [log] [ManagerDrivers] [D1_5503] [0] ---- sid : attrs
// [log] [ManagerDrivers] [D1_5503] [0] ---- zclVersion : 2
// [log] [ManagerDrivers] [D1_5503] [0] ---- appVersion : 1
// [log] [ManagerDrivers] [D1_5503] [0] ---- stackVersion : 1
// [log] [ManagerDrivers] [D1_5503] [0] ---- hwVersion : 5
// [log] [ManagerDrivers] [D1_5503] [0] ---- manufacturerName : ubisys
// [log] [ManagerDrivers] [D1_5503] [0] ---- modelId : D1 (5503)
// [log] [ManagerDrivers] [D1_5503] [0] ---- dateCode : 20190114-DE-FB0
// [log] [ManagerDrivers] [D1_5503] [0] ---- powerSource : 1
// [log] [ManagerDrivers] [D1_5503] [0] ---- locationDesc :
// [log] [ManagerDrivers] [D1_5503] [0] ---- physicalEnv : 0
// [log] [ManagerDrivers] [D1_5503] [0] --- seMetering
// [log] [ManagerDrivers] [D1_5503] [0] ---- 65533 : 1
// [log] [ManagerDrivers] [D1_5503] [0] ---- cid : seMetering
// [log] [ManagerDrivers] [D1_5503] [0] ---- sid : attrs
// [log] [ManagerDrivers] [D1_5503] [0] ---- currentSummDelivered : [ 0, 18 ]
// [log] [ManagerDrivers] [D1_5503] [0] ---- currentSummReceived : [ 0, 0 ]
// [log] [ManagerDrivers] [D1_5503] [0] ---- currentMaxDemandDelivered : [ 0, 33 ]
// [log] [ManagerDrivers] [D1_5503] [0] ---- currentMaxDemandReceived : [ 0, 0 ]
// [log] [ManagerDrivers] [D1_5503] [0] ---- powerFactor : 0
// [log] [ManagerDrivers] [D1_5503] [0] ---- status : 0
// [log] [ManagerDrivers] [D1_5503] [0] ---- unitOfMeasure : 0
// [log] [ManagerDrivers] [D1_5503] [0] ---- multiplier : 1
// [log] [ManagerDrivers] [D1_5503] [0] ---- divisor : 1000
// [log] [ManagerDrivers] [D1_5503] [0] ---- instantaneousDemand : 9
// [log] [ManagerDrivers] [D1_5503] [0] --- haElectricalMeasurement
// [log] [ManagerDrivers] [D1_5503] [0] ---- 65533 : 1
// [log] [ManagerDrivers] [D1_5503] [0] ---- cid : haElectricalMeasurement
// [log] [ManagerDrivers] [D1_5503] [0] ---- sid : attrs
// [log] [ManagerDrivers] [D1_5503] [0] ---- measurementType : 15
// [log] [ManagerDrivers] [D1_5503] [0] ---- acFrequency : 49382
// [log] [ManagerDrivers] [D1_5503] [0] ---- totalActivePower : 0
// [log] [ManagerDrivers] [D1_5503] [0] ---- totalReactivePower : 0
// [log] [ManagerDrivers] [D1_5503] [0] ---- totalApparentPower : 0
// [log] [ManagerDrivers] [D1_5503] [0] ---- rmsVoltage : 227
// [log] [ManagerDrivers] [D1_5503] [0] ---- rmsCurrent : 4
// [log] [ManagerDrivers] [D1_5503] [0] ---- activePower : 0
// [log] [ManagerDrivers] [D1_5503] [0] ---- reactivePower : 0
// [log] [ManagerDrivers] [D1_5503] [0] ---- apparentPower : 0
// [log] [ManagerDrivers] [D1_5503] [0] ---- powerFactor : 0
// [log] [ManagerDrivers] [D1_5503] [0] - Endpoints: 4
// [log] [ManagerDrivers] [D1_5503] [0] -- Clusters:
// [log] [ManagerDrivers] [D1_5503] [0] --- zapp
// [log] [ManagerDrivers] [D1_5503] [0] - Endpoints: 5
// [log] [ManagerDrivers] [D1_5503] [0] -- Clusters:
// [log] [ManagerDrivers] [D1_5503] [0] --- 64512
// [log] [ManagerDrivers] [D1_5503] [0] ---- 0 : { elmType: 8, numElms: 2, elmVals: [], _isCb: false }
// [log] [ManagerDrivers] [D1_5503] [0] ---- 1 : null
// [log] [ManagerDrivers] [D1_5503] [0] ---- 65533 : 1
// [log] [ManagerDrivers] [D1_5503] [0] ---- cid : 64512
// [log] [ManagerDrivers] [D1_5503] [0] ---- sid : attrs
// [log] [ManagerDrivers] [D1_5503] [0] --- zapp
// [log] [ManagerDrivers] [D1_5503] [0] --- genBasic
// [log] [ManagerDrivers] [D1_5503] [0] ---- 65533 : 1
// [log] [ManagerDrivers] [D1_5503] [0] ---- cid : genBasic
// [log] [ManagerDrivers] [D1_5503] [0] ---- sid : attrs
// [log] [ManagerDrivers] [D1_5503] [0] ---- zclVersion : 2
// [log] [ManagerDrivers] [D1_5503] [0] ---- appVersion : 1
// [log] [ManagerDrivers] [D1_5503] [0] ---- stackVersion : 1
// [log] [ManagerDrivers] [D1_5503] [0] ---- hwVersion : 5
// [log] [ManagerDrivers] [D1_5503] [0] ---- manufacturerName : ubisys
// [log] [ManagerDrivers] [D1_5503] [0] ---- modelId : D1 (5503)
// [log] [ManagerDrivers] [D1_5503] [0] ---- dateCode : 20190114-DE-FB0
// [log] [ManagerDrivers] [D1_5503] [0] ---- powerSource : 1
// [log] [ManagerDrivers] [D1_5503] [0] ---- locationDesc :
// [log] [ManagerDrivers] [D1_5503] [0] ---- physicalEnv : 0
// [log] [ManagerDrivers] [D1_5503] [0] --- genIdentify
// [log] [ManagerDrivers] [D1_5503] [0] ---- cid : genIdentify
// [log] [ManagerDrivers] [D1_5503] [0] ---- sid : attrs
// [log] [ManagerDrivers] [D1_5503] [0] --- genCommissioning
// [log] [ManagerDrivers] [D1_5503] [0] ---- 7 : 0
// [log] [ManagerDrivers] [D1_5503] [0] ---- 65533 : 1
// [log] [ManagerDrivers] [D1_5503] [0] ---- cid : genCommissioning
// [log] [ManagerDrivers] [D1_5503] [0] ---- sid : attrs
// [log] [ManagerDrivers] [D1_5503] [0] ---- shortress : 39807
// [log] [ManagerDrivers] [D1_5503] [0] ---- extendedPANId : 0xdddddddddddddddd
// [log] [ManagerDrivers] [D1_5503] [0] ---- panId : 3532
// [log] [ManagerDrivers] [D1_5503] [0] ---- channelmask : 134215680
// [log] [ManagerDrivers] [D1_5503] [0] ---- protocolVersion : 2
// [log] [ManagerDrivers] [D1_5503] [0] ---- stackProfile : 2
// [log] [ManagerDrivers] [D1_5503] [0] ---- startupControl : 0
// [log] [ManagerDrivers] [D1_5503] [0] ---- trustCenterress : 0x00124b00183e2d49
// [log] [ManagerDrivers] [D1_5503] [0] ---- trustCenterMasterKey : [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]
// [log] [ManagerDrivers] [D1_5503] [0] ---- networkKey : [ 1, 3, 5, 7, 9, 11, 13, 15, 0, 2, 4, 6, 8, 10, 12, 13 ]
// [log] [ManagerDrivers] [D1_5503] [0] ---- useInsecureJoin : 1
// [log] [ManagerDrivers] [D1_5503] [0] ---- preconfiguredLinkKey : [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]
// [log] [ManagerDrivers] [D1_5503] [0] ---- networkKeySeqNum : 0
// [log] [ManagerDrivers] [D1_5503] [0] ---- networkKeyType : 1
// [log] [ManagerDrivers] [D1_5503] [0] ---- networkManagerress : 0
// [log] [ManagerDrivers] [D1_5503] [0] ---- scanAttempts : 0
// [log] [ManagerDrivers] [D1_5503] [0] ---- timeBetweenScans : 0
// [log] [ManagerDrivers] [D1_5503] [0] ---- rejoinInterval : 0
// [log] [ManagerDrivers] [D1_5503] [0] ---- maxRejoinInterval : 0
// [log] [ManagerDrivers] [D1_5503] [0] ---- indirectPollRate : 0
// [log] [ManagerDrivers] [D1_5503] [0] ---- parentRetryThreshold : 0
// [log] [ManagerDrivers] [D1_5503] [0] ---- concentratorFlag : 0
// [log] [ManagerDrivers] [D1_5503] [0] ---- concentratorRus : 0
// [log] [ManagerDrivers] [D1_5503] [0] ---- concentratorDiscoveryTime : 0
// [log] [ManagerDrivers] [D1_5503] [0] --- genOta
// [log] [ManagerDrivers] [D1_5503] [0] ---- cid : genOta
// [log] [ManagerDrivers] [D1_5503] [0] ---- sid : attrs
// [log] [ManagerDrivers] [D1_5503] [0] - Endpoints: 6
// [log] [ManagerDrivers] [D1_5503] [0] -- Clusters:
// [log] [ManagerDrivers] [D1_5503] [0] --- zapp
// [log] [ManagerDrivers] [D1_5503] [0] --- genGreenPowerProxy
// [log] [ManagerDrivers] [D1_5503] [0] ---- cid : genGreenPowerProxy
// [log] [ManagerDrivers] [D1_5503] [0] ---- sid : attrs
// [log] [ManagerDrivers] [D1_5503] [0] ------------------------------------------
