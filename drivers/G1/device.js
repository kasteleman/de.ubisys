'use strict';

const Homey = require('homey');

const ZigBeeDevice = require('homey-meshdriver').ZigBeeDevice;

class G1 extends ZigBeeDevice {

	onMeshInit() {
		this.printNode();
		this.enableDebug();
		// view	server	["groupid"]
		/* this.node.endpoints[0].clusters.genGroups.do('view', { groupid: 0 })
			.then(result => {
				this.log('view: ', result);
			})
			.catch(err => {
				this.log('could not view groupid');
				this.log(err);
			}); */
	}

}

module.exports = G1;

// [log] [Ubisys] Ubisys SmartHome ZigBee Devices is running...
// [log] [ManagerDrivers] [G1] [0] ZigBeeDevice has been inited
// [log] [ManagerDrivers] [G1] [0] ------------------------------------------
// [log] [ManagerDrivers] [G1] [0] Node: 027a12f7-f88d-45e5-af8f-89f95b4a8ca1
// [log] [ManagerDrivers] [G1] [0] - Battery: undefined
// [log] [ManagerDrivers] [G1] [0] - Endpoints: 0
// [log] [ManagerDrivers] [G1] [0] -- Clusters:
// [log] [ManagerDrivers] [G1] [0] --- zapp
// [log] [ManagerDrivers] [G1] [0] --- genGreenPowerProxy
// [log] [ManagerDrivers] [G1] [0] ---- cid : genGreenPowerProxy
// [log] [ManagerDrivers] [G1] [0] ---- sid : attrs
// [log] [ManagerDrivers] [G1] [0] ------------------------------------------
