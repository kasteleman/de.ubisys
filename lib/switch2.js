'use strict';

const Homey = require('homey');

const { ZigBeeDevice } = require('homey-zigbeedriver');
const {
  zclNode, debug, Cluster, CLUSTER,
} = require('zigbee-clusters');

class SecondSwitch extends ZigBeeDevice {

	async onNodeInit({ zclNode }) {

    // print the node's info to the console
    this.printNode();

		await super.onNodeInit({ zclNode });

		//Application Endpoint #1 – On/off Output #2
    if (this.hasCapability('onoff')) {

      this.registerCapability('onoff', CLUSTER.ON_OFF, {
        endpoint: 2,
      });

    }

  }

}

module.exports = SecondSwitch;
