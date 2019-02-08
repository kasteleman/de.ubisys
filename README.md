# de.ubisys
Homey Zigbee driver for Ubisys devices

Beware that this release does not offer the possibility to configure the input-types for the modules.
This isn't supported yet in the ZigBee implementation by Athom.
So read the manuals of the devices at www.ubisys.de in order to know if you have the switches that are by default set in the configuration of the devices on delivery or ask the supplier if he can set it for you.

# 1.0.1

Added S1 POWERSWITCH and S1-R RAILSWITCH

Fixed flows for S2 and S2-R

# 1.0.2

* Added support for Homey v2.0.
* Added support for D1 and D1-R transition time.
* Added support for D1 and D1-R minimum dimming level. If dimmed below minimum level device is turned off.
* Added device specific information on advanced settings tab; Manufactured and Hardware version.
* Fixed trigger support for S2 and S2-R.
