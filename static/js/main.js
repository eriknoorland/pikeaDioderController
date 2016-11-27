/* globals HueWheel */

(function() {
  'use strict';

  var socket;
  var hueWheel;
  var $hueWheel;
  var $toggleStateButton;
  var $shutdownButton;

  /**
   * DOM ready
   */
  $(function() {
    socket = io.connect('pdc.local:8080');

    cacheSelectors();
    bindEvents();
  });

  /**
   * Init
   * @param {Object} data
   */
  function init(data) {
    var rgb = hexToByteArray(data.colour);

    hueWheel = new HueWheel('hueWheel', {
      changeSaturation: false,
      changeLightness: false,
      showColorSpot: false,
      diameter: 300,
      thicknessHue: 60,
      rgb: rgb,
      onChange: onHueWheelUpdate
    });

    onToggleState(data);
  }

  /**
   * Bind handlers to events
   */
  function bindEvents() {
    $toggleStateButton.on('click', onToggleStateButtonClick);
    $shutdownButton.on('click', onShutdownButtonClick);

    socket.on('connected', init);
    socket.on('toggleState', onToggleState);
    socket.on('colourChange', onColourChange);
    socket.on('shutdown', onShutdown);
  }

  /**
   * Cache jQuery selectors
   */
  function cacheSelectors() {
    $hueWheel = $('#hueWheel');
    $toggleStateButton = $('#toggleOnOff');
    $shutdownButton = $('#shutdownPdc');
  }

  /**
   * Handler for toggle state button click
   */
  function onToggleStateButtonClick() {
    socket.emit('toggleStateRequest');
  }

  /**
   * Handler for shutdown button click
   */
  function onShutdownButtonClick() {
    socket.emit('shutdownRequest');
  }

  /**
   * Handler for the colour changes on the server side
   * @param {Object} data
   */
  function onColourChange(data) {

  }

  /**
   * State toggle handler
   * @param {Object} data
   */
  function onToggleState(data) {
    $toggleStateButton.toggleClass('is-active', data.state === 'on');
  }

  /**
   * Server shutdown handler
   * @param {Object} data
   */
  function onShutdown(data) {
    $hueWheel.css('opacity', 0.2);
    $toggleStateButton.css('opacity', 0.2);
    $shutdownButton.css('opacity', 0.2);
  }

  /**
   * Handler for the hue wheel update
   * @param {Event} event
   */
  function onHueWheelUpdate(event) {
    var colour = '#' + byteToHex(event.r) + byteToHex(event.g) + byteToHex(event.b);
    socket.emit('colourChangeRequest', {colour: colour});
  }

  /**
   * Returns the hex value for the given byte
   * @param {int} byte
   * @return {String}
   */
  function byteToHex(byte) {
    var hex = byte.toString(16);

    if(hex.length === 1) {
      hex = '0' + hex;
    }

    return hex;
  }

  /**
   * Returns a bytes array for the given hex string (#0000ff)
   * @param {String} hex
   * @return {Array}
   */
  function hexToByteArray(hex) {
    var bytes = [];
    var hexes = [];

    hex = hex.replace('#', '');
    hexes = hex.match(/.{1,2}/g);

    for(var i = 0, x = hexes.length; i < x; i++) {
      bytes.push(hexToByte(hexes[i]));
    }

    return bytes;
  }

  /**
   * Returns a single byte value for the given hex string (i.e. ff)
   * @param {String} hex
   * @return {int}
   */
  function hexToByte(hex) {
    return parseInt(hex, 16);
  }
}());
