'use strict';

const Core = require('./core.js');
const maxDimLevel = 254;

class Dimmer extends Core {

	onMeshInit() {
		//Set endpoint for metering information
		this.meteringEnpoint = 3;
		//Initialize the basic shared settings
		super.initCore();

		if (this.hasCapability('dim')) {
			this.registerCapability('dim', 'genLevelCtrl', { endpoint: 0 });
      this.registerAttrReportListener('genLevelCtrl', 'currentLevel', 1, 0, 2,
  			this.onDimLevelReport.bind(this), 0)
  				.catch(err => {
  					this.error('failed to register attr report listener - genLevelCtrl/currentLevel', err);
  				});
		}
	}

	onDimLevelReport(value) {
		const parsedValue = value / maxDimLevel;
		this.log('currentLevel', value, parsedValue);
		this.setCapabilityValue('dim', parsedValue);
	}

	//If transtime is changed then write back to zigbee device
	async onSettings(oldSettings, newSettings, changedKeysArr) {
		if (changedKeysArr.indexOf("transtime") > -1) {
			this.log('Transtime value was change to:', newSettings.transtime);

			// onOffTransitionTime is in unit 0.1s
			this.node.endpoints[0].clusters['genLevelCtrl'].write("onOffTransitionTime", (newSettings.transtime*10))
			  .then(result => {
					//this.log('onOffTransitionTime return value:', result);
			  })
			  .catch(err => {
					this.error('failed to set onOffTransitionTime', err);
			  });
		}
	}
}

module.exports = Dimmer;
