'use strict';

const { CLUSTER } = require('zigbee-clusters');
const OnOffBoundCluster = require('./OnOffBoundCluster');
const LevelControlBoundCluster = require('./LevelControlBoundCluster');

class BoundClusterHandler {

  /**
   * @param  {object} device
   * @param  {object} zclNode
   * @param  {number} endpoint
   * @param  {string} sw 'sw1' or 'sw2'
   */
  constructor(device, zclNode, endpoint, sw) {
    this._device = device;
    this._sw = sw;
    this._intervalObj = null;
    this._timeoutObj = null;
    this.log = device.log;
    this.error = device.error;

    // Bind on/off cluster
    // Ubisys devices supports Turn on, Turn off and Toggle
    zclNode.endpoints[endpoint].bind(CLUSTER.ON_OFF.NAME, new OnOffBoundCluster({
      onToggle: this._toggleCommandHandler.bind(this),
    }));

    // Bind level control cluster
    // Ubisys devices supports Move with on/off and Stop with on/off
    zclNode.endpoints[endpoint].bind(CLUSTER.LEVEL_CONTROL.NAME, new LevelControlBoundCluster({
      onMove: this._moveCommandHandler.bind(this),
      onMoveWithOnOff: this._moveCommandHandler.bind(this),

      onStop: this._stopCommandHandler.bind(this),
      onStopWithOnOff: this._stopCommandHandler.bind(this),
    }));
  }

  /**
   * Triggers the 'toggled' flow cards.
   * @private
   */
  _toggleCommandHandler() {
    // this.log('_toggleCommandHandler sw =', this._sw);

    this._device.triggerFlow({ id: `${this._sw}toggled` })
      .then(() => this.log('flow was triggered', `${this._sw}toggled`))
      .catch(err => this.error('Error: triggering flow', `${this._sw}toggled`, err));
  }

  /**
   * Handles `onMove` and `onMoveWithOnOff` commands, and triggers flow cards.
   * @param {'up'|'down'} moveMode
   * @private
   */
  _moveCommandHandler({ moveMode }) {
    // this.log('_moveCommandHandler moveMode =', moveMode, 'sw =', this._sw);

    // Trigger card move up/down
    this._device.triggerFlow({ id: `${this._sw}move${moveMode}` })
      .then(() => this.log('flow was triggered', `${this._sw}move${moveMode}`))
      .catch(err => this.error('Error: triggering flow', `${this._sw}move${moveMode}`, err));

    if (this._intervalObj) {
      clearInterval(this._intervalObj);
    }
    if (this._timeoutObj) {
      clearInterval(this._timeoutObj);
    }
    this._intervalObj = setInterval(() => {
      // this.log(`_moveCommandHandler - trigger card ${this._sw}move${moveMode}`);
      // Trigger card move up/down
      this._device.triggerFlow({ id: `${this._sw}move${moveMode}` })
        .then(() => this.log('flow was triggered', `${this._sw}move${moveMode}`))
        .catch(err => this.error('Error: triggering flow', `${this._sw}move${moveMode}`, err));
    }, 800); // Trigger one flow per 800 ms while long-pressing

    this._timeoutObj = setTimeout(() => {
      this.log('_moveCommandHandler - cancel timer');
      if (this._intervalObj) {
        clearInterval(this._intervalObj);
        this._intervalObj = null;
      }
    }, 8000); // Stop sending flow triggers after 8 seconds.
  }

  /**
   * Handles `onStop` and `onStopWithOnOff` commands.
   * @private
   */
  _stopCommandHandler() {
    this.log('_stopCommandHandler sw =', this._sw);
    if (this._intervalObj) {
      clearInterval(this._intervalObj);
      this._intervalObj = null;
    }
    if (this._timeoutObj) {
      clearInterval(this._timeoutObj);
      this._timeoutObj = null;
    }
  }

}

module.exports = BoundClusterHandler;
