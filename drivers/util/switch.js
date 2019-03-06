'use strict';

const Core = require('./core.js');

class Switch extends Core {

	onMeshInit() {
		//Set endpoint for metering information
		this.meteringEnpoint = 2;
		//Initialize the basic shared settings
		super.initCore();

	}

}

module.exports = Switch;
