'use strict';

const Homey = require('homey');

class Ubisys extends Homey.App {

  onInit() {
    this.log('Ubisys SmartHome ZigBee Devices are running...');
  }

}

module.exports = Ubisys;
