# de.ubisys
Homey Zigbee driver for Ubisys devices

# 1.0.1

* Added S1 POWERSWITCH and S1-R RAILSWITCH
* Fixed flows for S2 and S2-R

# 1.0.2

* Added support for Homey v2.0.
* Added support for D1 and D1-R transition time.
* Added support for D1 and D1-R minimum dimming level. If dimmed below minimum level device is turned off.
* Added device specific information on advanced settings tab; Manufactured and Hardware version.
* Fixed trigger support for S2 and S2-R.

# 2.0.0

* Added support for Homey v5.0
* Added support for configuring input actions

# Input actions

The Ubisys devices have one output part and one input part. 

The output part consists of a dimmer unit (D1 and D1R devices) or switch units (S1, S1R, S2 and S2R devices). The output part can be controlled from Homey with the usual flow cards, e.g.
* When... "Turned on"
* When... "Is turned on"
* Then... "Turn on"

The input part can be connected to physical switches. By default, the input part is configured to control the output part. E.g., a physical switch connected to input 1 will turn on and off output 1 of the device. However, it is possible to configure the device to change this behaviour.

The following configurations are supported.
* Stationary switch as toggle switch
* Stationary switch as on/off switch
* Push button as toggle switch
* Push button as dimmer switch
* Dual push buttons as dimmer switch
* Stationary switch as scene selector
* Push button as scene selector

Depending on the configuration, the input will have different impacts on the output, and different Flow cards will be triggered.
Triggers for input 1 (similar for input 2):
* When... "Input 1 - Set on" (triggered by the "on/off switch" configuration)
* When... "Input 1 - Set off" (triggered by the "on/off switch" configuration)
* When... "Input 1 - Toggle on or off" (triggered by the "toggle switch" and "dimmer switch" configurations)
* When... "Input 1 - Increase relative dim-level" (triggered by the "dimmer switch" configuration)
* When... "Input 1 - Decrease relative dim-level" (triggered by the "dimmer switch" configuration)

For "Push button as dimmer switch", a short press will toggle, a long press will (alternately) dim up or down.

For "Dual push buttons as dimmer switch", a short press on input 1 will turn on, a short press on input 2 will turn off, a long press on input 1 will dim up and a long press on input 2 will dim down. Only Flow cards named "Input 1" will be triggered by the inputs. For devices with two outputs, output 2 will not be controlled by input 2.

For the "dimmer switch" options, the app will trigger "Increase/decrease relative dim-level" Flow cards repeatably every 800 ms as long as the push button is long pressed. The idea is to use them in the "When..." part of a Homey flow and then use a "Set relative dim-level" card in the "Then..." part of the flow. One flow to increase with e.g. +10%, and one flow to decrease with e.g. -10%.

For "Stationary switch as scene selector", the primary scene is recalled in the "On" state and the secondary scene is recalled in the "Off" state. For "Push button as scene selector", the primary scene is recalled with short press and the secondary scene is recalled with long press. The inputs will not control the outputs and no Flow cards will be triggered by the inputs. Note that configurations of scenes in the Zigbee network is assumed to be done with some other app or tool.

## Example - Push button as dimmer switch - Input 1

The physical switch connect to the device should be of push button type. 

If the purpose is to control an ordinary (non-smart) dimmable light using a D1 or D1R device, then no more is needed.

If the purpose is to control a different (smart) dimmable light connected to Homey, then three flows are needed:
* When... (Ubisys device) "Input 1 - Toggle on or off", Then... (another device) "Toggle on or off"
* When... (Ubisys device) "Input 1 - Increase relative dim-level", Then... (another device) "Set relative dim-level 10%"
* When... (Ubisys device) "Input 1 - Decrease relative dim-level", Then... (another device) "Set relative dim-level -10%"
