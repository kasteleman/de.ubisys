'use strict';

const Homey = require('homey');

const { ZigBeeDevice } = require('homey-zigbeedriver');
const {
  zclNode, debug, Cluster, CLUSTER,
} = require('zigbee-clusters');
//const { Cluster, CLUSTER } = require('zigbee-clusters');
const DeviceSetup = require('../../lib/DeviceSetup');

Cluster.addCluster(DeviceSetup);

class RootSwitch extends ZigBeeDevice {

	async onNodeInit({ zclNode }) {

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

		//Application Endpoint #1 – On/off Output #1
		if (this.hasCapability('onoff')) {

			this.registerCapability('onoff', CLUSTER.ON_OFF, {
				endpoint: 1,
			});

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

		// measure_power
		//S2, S2-R, endpoint #5

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

module.exports = RootSwitch;
