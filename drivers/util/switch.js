'use strict';

const Homey = require('homey');
const ZigBeeDevice = require('homey-meshdriver').ZigBeeDevice;

class Switch extends ZigBeeDevice {

	onMeshInit() {
    this.instantaneousDemandFactor = 1;
    this.printNode();
		this.enableDebug();

		//Switch 1
		this.registerCapability('onoff', 'genOnOff', { endpoint: 0 });
    this.registerAttrReportListener('genOnOff', 'onOff', 1, 0, null,
      this.onOffSwitch1Report.bind(this), 0)
        .catch(err => {
          this.error('failed to register attr report listener - genOnOff/onOff', err);
        });

		// Power metering
		if (this.hasCapability('measure_power')) {
			this.registerCapability('measure_power', 'seMetering', { endpoint: 2 });
      this.registerAttrReportListener('seMetering', 'instantaneousDemand', 1, 0, 2,
  			this.onMeteringReport.bind(this), 2)
  				.catch(err => {
  					this.error('failed to register attr report listener - seMetering/instantaneousDemand', err);
  				});
		}
	}

  onOffSwitch1Report(value) {
		const parsedValue = (value === 1);
		this.log('Switch1, genOnOff', value, parsedValue);
    this.setCapabilityValue('onoff', parsedValue);
	}

	onMeteringReport(value) {
		const parsedValue = Math.max(0, value);
		this.log('instantaneousDemand', value, parsedValue);
		this.setCapabilityValue('measure_power', parsedValue);
	}

}

module.exports = Switch;
