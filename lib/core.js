'use strict';

const Homey = require('homey');
const ZigBeeDevice = require('homey-meshdriver').ZigBeeDevice;

class Core extends ZigBeeDevice {

	onAdded() {
		this.log(`Adding device '${this.getName()}' to Homey`);
	}

	onDeleted() {
		this.log(`Deleting device '${this.getName()}' to Homey`);
	}

	initCore() {
		//Property seems to be required for measure_power in seMetering.js
		this.instantaneousDemandFactor = 1;
		this.printNode();
		this.enableDebug();

		//OnOff
		this.registerCapability('onoff', 'genOnOff', { endpoint: 0 });
		this.registerAttrReportListener('genOnOff', 'onOff', 1, 0, null,
			this.onOffSwitchReport.bind(this), 0)
			.catch(err => {
				this.error('failed to register attr report listener - genOnOff/onOff', err);
			});

		// Power metering
		// this.meteringEnpoint must be defined in inheriting class
		if (this.hasCapability('measure_power')) {
			this.registerCapability('measure_power', 'seMetering', { endpoint: this.meteringEnpoint });
			this.registerAttrReportListener('seMetering', 'instantaneousDemand', 1, 0, 2,
				this.onMeteringReport.bind(this), this.meteringEnpoint)
				.catch(err => {
					this.error('failed to register attr report listener - seMetering/instantaneousDemand', err);
				});
		}

		//Read dateCode and hardware version info and write to setting
		//assuming device has setting defined
		if (this.getSetting("dateCode") != null) {
			this.node.endpoints[0].clusters['genBasic'].read("dateCode")
				.then(result => {
					//this.log('dateCode:', result);
					this.setSettings({ dateCode: result })
						.catch(err => {
							this.error('failed to update dateCode settings', err);
						});
				})
				.catch(err => {
					this.error('failed to read dateCode', err);
				});
		}

		if (this.getSetting("hwVersion") != null) {
			this.node.endpoints[0].clusters['genBasic'].read("hwVersion")
				.then(result => {
					//this.log('hwVersion:', result);
					this.setSettings({ hwVersion: result })
						.catch(err => {
							this.error('failed to update hwVersion settings', err);
						});
				})
				.catch(err => {
					this.error('failed to read hwVersion', err);
				});
		}
	}

	onOffSwitchReport(value) {
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

module.exports = Core;
