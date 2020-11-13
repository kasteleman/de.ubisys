'use strict';

const debug = require('debug')('InputActionsHandler');
/**
 * @example
 * // From within a ZigBeeDevice
 * const InputActionsHandler = require('./InputActionsHandler');
 * const inputActionsHandler = new InputActionsHandler(this.zclNode);
 * await inputActionsHandler.writeAttributes(
 *   InputActionsHandler.S2InputActionsShortClickToggleArray);
 * const res = await inputActionsHandler.readAttributes();
 * @class InputActionsHandler
 */
class InputActionsHandler {

  constructor(zclNode) {
    this._zclNode = zclNode;
  }

  /**
   * Returns the 'inputActions' attribute in endpoint 232, cluster 'devicesetup'
   * as an Array of Arrays.
   *
   * @return {number[][]}
   * @memberof InputActionsHandler
   */
  async readAttributes() {
    try {
      const attributes = await this._zclNode
        .endpoints[232]
        .clusters['devicesetup']
        .readAttributes('inputActions');
      const attributesArray = this._fromRawtoArray(attributes.inputActions);
      debug('readAttributes', 'attributesArray:', attributesArray);
      return attributesArray;
    } catch (err) {
      debug('readAttributes', 'Error:', err);
      return err;
    }
  }

  /**
   * Takes an Array of Array as input and writes
   * the attribute 'inputActions' to endpoint 232, cluster 'devicesetup'
   *
   * @param {number[][]} attributesArray
   * @return {*}
   * @memberof InputActionsHandler
   */
  async writeAttributes(attributesArray) {
    try {
      const raw = this._fromArraytoRaw(attributesArray);
      debug('writeAttributes', 'raw:', raw);
      const res = await this._zclNode
        .endpoints[232]
        .clusters['devicesetup']
        .writeAttributes({ inputActions: raw });
      debug('writeAttributes', 'res:', res);
      return res;
    } catch (err) {
      debug('writeAttributes', 'Error:', err);
      return err;
    }
  }

  _fromRawtoArray(inputActionsRaw) {
    const inputActionsArray = [];
    const numberOfElements = inputActionsRaw[1] + 256 * inputActionsRaw[2];
    let index = 3;
    for (let i = 0; i < numberOfElements; i++) {
      const elementSize = inputActionsRaw[index];
      inputActionsArray.push(inputActionsRaw.slice(index + 1, index + 1 + elementSize));
      index += elementSize + 1;
    }
    return inputActionsArray;
  }

  _fromArraytoRaw(inputActionsArray) {
    const inputActionsRaw = [];
    inputActionsRaw.push(0x41); // octstr type
    const arrayLength = inputActionsArray.length;
    const lengthLSB = arrayLength % 256;
    const lengthMSB = Math.round((arrayLength - lengthLSB) / 256);
    inputActionsRaw.push(lengthLSB);
    inputActionsRaw.push(lengthMSB);
    for (const item of inputActionsArray) {
      inputActionsRaw.push(item.length);
      for (const value of item) inputActionsRaw.push(value);
    }
    return inputActionsRaw;
  }

  /**
   * @param  {} driverId 'D1_5503', 'D1R_5503', 'S1_5501', 'S1R_5501', 'S2_5502', 'S2R_5502'
   * @param  {} inputNumber 1, 2
   * @param  {} actionType 'ShortClickToggle', 'ShortClickToggleLongClickDim'
   */
  static builder(driverId, inputNumber, actionType) {
    let endpoint;
    const inputAndOptions = inputNumber - 1;

    if (inputNumber === 1) {
      // Input 1
      switch (driverId) {
        case 'D1_5503':
        case 'D1R_5503':
        case 'S1_5501':
        case 'S1R_5501':
          endpoint = 2;
          break;
        case 'S2_5502':
        case 'S2R_5502':
          endpoint = 3;
          break;
        default:
          break;
      }
    } else {
      // Input 2
      switch (driverId) {
        case 'D1_5503':
        case 'D1R_5503':
        case 'S1R_5501':
          endpoint = 3;
          break;
        case 'S2_5502':
        case 'S2R_5502':
          endpoint = 4;
          break;
        default:
          break;
      }
    }

    if (actionType === 'ShortClickToggle') {
      return ([
        [inputAndOptions, 0x0d, endpoint, 0x06, 0x00, 0x02],
      ]);
    }

    if (actionType === 'ShortClickToggleLongClickDim') {
      return ([
        [inputAndOptions, 0x07, endpoint, 0x06, 0x00, 0x02],
        [inputAndOptions, 0x86, endpoint, 0x08, 0x00, 0x05, 0x00, 0x32],
        [inputAndOptions, 0xc6, endpoint, 0x08, 0x00, 0x05, 0x01, 0x32],
        [inputAndOptions, 0x0b, endpoint, 0x08, 0x00, 0x07],
      ]);
    }

    return null;
  }

  // DEFAULT configuration D1_5503, D1R_5503
  // This will allow to control a dimmer with one push button. A short press will toggle
  // the light on/off, while a longer press starts dimming up or down (alternating) in order
  // to allow adjusting the brightness with the button. Dimming stops, when the button is released.
  static D1InputActionsShortClickToggleLongClickDim = [
    [0x00, 0x07, 0x02, 0x06, 0x00, 0x02],
    [0x00, 0x86, 0x02, 0x08, 0x00, 0x05, 0x00, 0x32],
    [0x00, 0xc6, 0x02, 0x08, 0x00, 0x05, 0x01, 0x32],
    [0x00, 0x0b, 0x02, 0x08, 0x00, 0x07],
    [0x01, 0x07, 0x03, 0x06, 0x00, 0x02],
    [0x01, 0x86, 0x03, 0x08, 0x00, 0x05, 0x00, 0x32],
    [0x01, 0xc6, 0x03, 0x08, 0x00, 0x05, 0x01, 0x32],
    [0x01, 0x0b, 0x03, 0x08, 0x00, 0x07],
  ];

  // DEFAULT configuration for S1_5501
  // Note that S1 only has one client cluster.
  // Is aimed at rocker switches (stationary, two stable positions).
  // Will toggle the light on/off when the position is changed.
  static S1InputActionsRockerSwitch = [
    [0x00, 0x0d, 0x02, 0x06, 0x00, 0x02],
    [0x00, 0x03, 0x02, 0x06, 0x00, 0x02],
  ];

  // Configuration for S1_5501
  // Is aimed at push-buttons (momentary, one stable position)
  // Will toggle the light on/off when pressed
  static S1InputActionsShortClickToggle = [
    [0x00, 0x0d, 0x02, 0x06, 0x00, 0x02],
  ];

  // Configuration for S1_5501
  // Note that S1 only has one client cluster.
  // This will allow to control a dimmer with one push button. A short press will toggle
  // the light on/off, while a longer press starts dimming up or down (alternating) in order
  // to allow adjusting the brightness with the button. Dimming stops, when the button is released.
  static S1InputActionsShortClickToggleLongClickDim = [
    [0x00, 0x07, 0x02, 0x06, 0x00, 0x02],
    [0x00, 0x86, 0x02, 0x08, 0x00, 0x05, 0x00, 0x32],
    [0x00, 0xc6, 0x02, 0x08, 0x00, 0x05, 0x01, 0x32],
    [0x00, 0x0b, 0x02, 0x08, 0x00, 0x07],
  ];

  // Default configuration for S1R_5501
  // Is aimed at push-buttons (momentary, one stable position)
  // Will toggle the light on/off when pressed
  static S1RInputActionsShortClickToggle = [
    [0x00, 0x0d, 0x02, 0x06, 0x00, 0x02],
    [0x01, 0x0d, 0x03, 0x06, 0x00, 0x02],
  ];

  // Configuration for S1R_5501
  // This will allow to control a dimmer with one push button. A short press will toggle
  // the light on/off, while a longer press starts dimming up or down (alternating) in order
  // to allow adjusting the brightness with the button. Dimming stops, when the button is released.
  static S1RInputActionsShortClickToggleLongClickDim = [
    [0x00, 0x07, 0x02, 0x06, 0x00, 0x02],
    [0x00, 0x86, 0x02, 0x08, 0x00, 0x05, 0x00, 0x32],
    [0x00, 0xc6, 0x02, 0x08, 0x00, 0x05, 0x01, 0x32],
    [0x00, 0x0b, 0x02, 0x08, 0x00, 0x07],
    [0x01, 0x07, 0x03, 0x06, 0x00, 0x02],
    [0x01, 0x86, 0x03, 0x08, 0x00, 0x05, 0x00, 0x32],
    [0x01, 0xc6, 0x03, 0x08, 0x00, 0x05, 0x01, 0x32],
    [0x01, 0x0b, 0x03, 0x08, 0x00, 0x07],
  ];

  // DEFAULT configuration for S2_5502, S2R_5502
  // Is aimed at push-buttons (momentary, one stable position)
  // Will toggle the light on/off when pressed
  static S2InputActionsShortClickToggle = [
    [0x00, 0x0d, 0x03, 0x06, 0x00, 0x02],
    [0x01, 0x0d, 0x04, 0x06, 0x00, 0x02],
  ];

  // Configuration for S2_5501, S2R_5501
  // This will allow to control a dimmer with one push button. A short press will toggle
  // the light on/off, while a longer press starts dimming up or down (alternating) in order
  // to allow adjusting the brightness with the button. Dimming stops, when the button is released.
  static S2InputActionsShortClickToggleLongClickDim = [
    [0x00, 0x07, 0x03, 0x06, 0x00, 0x02],
    [0x00, 0x86, 0x03, 0x08, 0x00, 0x05, 0x00, 0x32],
    [0x00, 0xc6, 0x03, 0x08, 0x00, 0x05, 0x01, 0x32],
    [0x00, 0x0b, 0x03, 0x08, 0x00, 0x07],
    [0x01, 0x07, 0x04, 0x06, 0x00, 0x02],
    [0x01, 0x86, 0x04, 0x08, 0x00, 0x05, 0x00, 0x32],
    [0x01, 0xc6, 0x04, 0x08, 0x00, 0x05, 0x01, 0x32],
    [0x01, 0x0b, 0x04, 0x08, 0x00, 0x07],
  ];

}

module.exports = InputActionsHandler;
