'use strict';

const Homey = require('homey');

const { ZigBeeDevice } = require('homey-zigbeedriver');
const {
  zclNode, debug, Cluster, CLUSTER,
} = require('zigbee-clusters');

const DeviceSetup = require('../../lib/DeviceSetup');
const Switch = require('../../lib/switch.js');

Cluster.addCluster(DeviceSetup);

class RootSwitch extends Switch {

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
      }

}

module.exports = RootSwitch;
