'use strict';

const { ZigBeeDriver } = require('homey-zigbeedriver');
const RootDevice = require('../../lib/switch.js');
const SecondSwitchDevice = require('../../lib/switch2.js');

class S2_5502 extends ZigBeeDriver {

  onMapDeviceClass(device) {
    if (device.getData().subDeviceId === 'secondSwitch') {
      return SecondSwitchDevice;
    }
    return RootDevice;
  }

}
module.exports = S2_5502;
