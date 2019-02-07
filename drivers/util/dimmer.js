'use strict';

const Homey = require('homey');
const ZigBeeDevice = require('homey-meshdriver').ZigBeeDevice;

class Dimmer extends ZigBeeDevice {

	onMeshInit() {
    this.instantaneousDemandFactor = 1;
    this.printNode();
		this.enableDebug();

		this.registerCapability('onoff', 'genOnOff');
    this.registerAttrReportListener('genOnOff', 'onOff', 1, 0, null,
      this.onOffReport.bind(this), 0)
        .catch(err => {
          this.error('failed to register attr report listener - genOnOff/onOff', err);
        });

		if (this.hasCapability('dim')) {
			this.registerCapability('dim', 'genLevelCtrl');
      this.registerAttrReportListener('genLevelCtrl', 'currentLevel', 1, 0, 2,
  			this.onDimLevelReport.bind(this), 0)
  				.catch(err => {
  					this.error('failed to register attr report listener - genLevelCtrl/currentLevel', err);
  				});
		}

		// Power metering
		if (this.hasCapability('measure_power')) {
			this.registerCapability('measure_power', 'seMetering', { endpoint: 3 });
      this.registerAttrReportListener('seMetering', 'instantaneousDemand', 1, 0, 2,
  			this.onMeteringReport.bind(this), 3)
  				.catch(err => {
  					this.error('failed to register attr report listener - seMetering/instantaneousDemand', err);
  				});
		}
	}

  onOffReport(value) {
		const parsedValue = (value === 1);
		this.log('genOnOff', value, parsedValue);
    this.setCapabilityValue('onoff', parsedValue);
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

module.exports = Dimmer;
