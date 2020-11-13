'use strict';

const { ZigBeeDevice } = require('homey-zigbeedriver');
const {
  // eslint-disable-next-line no-unused-vars
  debug, Cluster, CLUSTER,
} = require('zigbee-clusters');
const DeviceSetup = require('./DeviceSetup');
const InputActionsHandler = require('./InputActionsHandler');
const BoundClusterHandler = require('./BoundClusterHandler');

Cluster.addCluster(DeviceSetup);

class Switch extends ZigBeeDevice {

  async onNodeInit({ zclNode }) {
    // enable debugging
    // this.enableDebug();

    // Enables debug logging in zigbee-clusters
    // debug(true);

    // print the node's info to the console
    this.printNode();

    await super.onNodeInit({ zclNode });

    const inputActionsHandler = new InputActionsHandler(this.zclNode);

    try {
      const inputConfigurations = await this.zclNode.endpoints[this.getClusterEndpoint(DeviceSetup)]
        .clusters[DeviceSetup.NAME].readAttributes('inputConfigurations');
      // this.log('Read Attribute inputConfigurations: ', inputConfigurations);

      const inputConfigurationsElements = [];
      inputConfigurationsElements.push(inputConfigurations.inputConfigurations[3]);
      if (inputConfigurations.inputConfigurations.length === 5) {
        // Device has two inputs
        inputConfigurationsElements.push(inputConfigurations.inputConfigurations[4]);
      }
      this.log('inputConfiguration: ', inputConfigurationsElements);
    } catch (err) {
      this.log('could not read Attribute inputConfigurations');
      this.log(err);
    }

    try {
      /*
      const resWrite = await inputActionsHandler
        .writeAttributes(InputActionsHandler.S2InputActionsShortClickToggleLongClickDim);
      this.log('inputActionsHandler.writeAttributes():', resWrite);
      */
      const resRead = await inputActionsHandler.readAttributes();
      this.log('inputActionsHandler.readAttributes():', resRead);
    } catch (err) {
      this.log('could not read and/or write inputActions');
      this.log(err);
    }

    if (this.hasCapability('onoff')) {
      this.registerCapability('onoff', CLUSTER.ON_OFF);
    }

    // add capability meter_power if not already present like in sdkv2 driver
    if (!this.hasCapability('meter_power')) {
      this.addCapability('meter_power');
    }

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
          // eslint-disable-next-line consistent-return
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
          maxInterval: 600, // once per ~5 min
          minChange: 2,
        },
      ]);
    }

    this.boundCluster1 = null;
    this.boundCluster2 = null;
    switch (this.driver.id) {
      case 'S1_5501':
        this.boundCluster1 = new BoundClusterHandler(this, zclNode, 2, 'sw1');
        break;
      case 'S1R_5501':
        this.boundCluster1 = new BoundClusterHandler(this, zclNode, 2, 'sw1');
        this.boundCluster2 = new BoundClusterHandler(this, zclNode, 3, 'sw2');
        break;
      case 'S2_5502':
      case 'S2R_5502':
        this.boundCluster1 = new BoundClusterHandler(this, zclNode, 3, 'sw1');
        this.boundCluster2 = new BoundClusterHandler(this, zclNode, 4, 'sw2');
        break;
      default:
        break;
    }
  }

}

module.exports = Switch;
