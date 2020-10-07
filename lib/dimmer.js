'use strict';

const { ZigBeeLightDevice } = require('homey-zigbeedriver');
const {
  zclNode, debug, Cluster, CLUSTER,
} = require('zigbee-clusters');
//const { Cluster, CLUSTER } = require('zigbee-clusters');
const DeviceSetup = require('../../lib/DeviceSetup');

Cluster.addCluster(DeviceSetup);

class Dimmer extends ZigBeeLightDevice {

	async onNodeInit({ zclNode }) {

    // enable debugging
    // this.enableDebug();

    // Enables debug logging in zigbee-clusters
    debug(true);

		// print the node's info to the console
		this.printNode();
		await super.onNodeInit({ zclNode });

    /*try {
      const attributes = await this.zclNode.endpoints[this.getClusterEndpoint(DeviceSetup)]
      .clusters[DeviceSetup.NAME].discoverAttributes();
      this.log('Read Attributes: ', attributes);
      } catch (err) {
        this.log('could not read Attributes');
        this.log(err);
      }*/

      try {
        const inputConfigurations = await this.zclNode.endpoints[this.getClusterEndpoint(DeviceSetup)]
        .clusters[DeviceSetup.NAME].readAttributes('inputConfigurations');
        this.log('Read Attribute inputConfigurations: ', inputConfigurations);

        const inputConfigurationsElements = inputConfigurations;
        this.log('Button_1_inputConfiguration: ', inputConfigurationsElements.inputConfigurations[0]);
        this.log('Button_2_inputConfiguration: ', inputConfigurationsElements.inputConfigurations[1]);

        } catch (err) {
          this.log('could not read Attribute inputConfigurations');
          this.log(err);
        }

        try {
          const inputActions = await this.zclNode.endpoints[this.getClusterEndpoint(DeviceSetup)]
          .clusters[DeviceSetup.NAME].readAttributes('inputActions');
          this.log('Read Attribute inputActions: ', inputActions);

          const inputActionsElements = inputActions;
          this.log('inputActionsElements_1: ', inputActionsElements.inputActions[0]);
          this.log('inputActionsElements_2: ', inputActionsElements.inputActions[1]);
          this.log('inputActionsElements_3: ', inputActionsElements.inputActions[2]);
          this.log('inputActionsElements_4: ', inputActionsElements.inputActions[3]);
          this.log('inputActionsElements_5: ', inputActionsElements.inputActions[4]);
          this.log('inputActionsElements_6: ', inputActionsElements.inputActions[5]);
          this.log('inputActionsElements_7: ', inputActionsElements.inputActions[6]);
          this.log('inputActionsElements_8: ', inputActionsElements.inputActions[7]);

          } catch (err) {
            this.log('could not read Attribute inputActions');
            this.log(err);
          }


      //2020-10-04T21:13:42.118Z zigbee-clusters:cluster ep: 232, cl: devicesetup (64512) received frame discoverAttributes.response devicesetup.discoverAttributes.response {
      //lastResponse: true,
      //attributes: [
      //DiscoveredAttribute { id: 0, dataTypeId: 72 },
      //DiscoveredAttribute { id: 1, dataTypeId: 72 },
      //DiscoveredAttribute { id: 65533, dataTypeId: 33 }
      //]

		if (this.hasCapability('onoff')) {

			await this.configureAttributeReporting([
				{
					endpointId: 1,
					cluster: CLUSTER.ON_OFF,
					attributeName: 'onOff',
					minInterval: 5,
					maxInterval: 300,
					minChange: 1,
				},
			]);

		}

		if (this.hasCapability('dim')) {

			await this.configureAttributeReporting([
				{
					endpointId: 1,
					cluster: CLUSTER.LEVEL_CONTROL,
					attributeName: 'currentLevel',
					minInterval: 5,
					maxInterval: 300,
					minChange: 10,
				},
			]);

		}

		// measure_power
		//D1 and D1-R, endpoint #4

		// add capability meter_power if not already present like in sdkv2 driver
		if (!this.hasCapability('meter_power')) {
			this.addCapability('meter_power')
		};

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
					minChange: 1,
				}
			]);

		}

    Object.keys(this.zclNode.endpoints)
    .forEach(endpoint => {
      if ((endpoint === 3) || (endpoint === 4)) {
        // Bind on/off button commands
        zclNode.endpoints[endpoint].bind(CLUSTER.ON_OFF.NAME, new OnOffBoundCluster({
          //onSetOff: this._commandHandler.bind(this, 'off', endpoint),
          //onSetOn: this._commandHandler.bind(this, 'on', endpoint),
        }));
        // Bind long press on/off button commands
        //zclNode.endpoints[endpoint].bind(CLUSTER.LEVEL_CONTROL.NAME, new LevelControlBoundCluster({
        //  onStop: this._commandHandler.bind(this, 'stop', endpoint),
        //  onStopWithOnOff: this._commandHandler.bind(this, 'stopWithOnOff', endpoint),
        //  onMove: this._commandHandler.bind(this, ',move', endpoint),
        //  onMoveWithOnOff: this._commandHandler.bind(this, 'moveWithOnOff', endpoint),
        //}));
      }

    });
	}
}

module.exports = Dimmer;
