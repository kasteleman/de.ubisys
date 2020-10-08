'use strict';

const RootDevice = require('./device.js');
const SecondSwitchDevice = require('../../lib/switch2.js');

const { ZigBeeDriver } = require('homey-zigbeedriver');
class S2_5502 extends ZigBeeDriver {
  onMapDeviceClass(device) {
    if (device.data.subDeviceId === 'secondSwitch') {
      return SecondSwitchDevice;
    } else {
      return RootDevice;
    }
  }
}
module.exports = S2_5502;
