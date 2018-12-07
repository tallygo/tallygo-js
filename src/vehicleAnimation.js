// @flow
/* eslint valid-jsdoc: ["error", { "requireParamDescription": false }] */

import WebSocket from 'isomorphic-ws'
import AnimationBuffer from './animationBuffer'
import { vehiclePointLayer } from './layerUtils'
import { extend } from './utils'

const defaultOptions = {
  vehicleIcon: 'airport-15',
  animationSteps: 500,
  panMap: true,
  logMessages: false
}

const defaultParseWSevent = function(event) {
  let message = JSON.parse(event.data)
  return {
    session_id: message.session_id,
    coordinates: [
      message.payload.longitude,
      message.payload.latitude
    ]
  }
}

/**
 * The `VehicleAnimation` object accepts a WebSocket address and listens for location updates that it uses to
 * animate a vehicle icon on the map.
 *
 * You create a `VehicleAnimation` by passing a map and a set of configuration options
 *
 * @param {Map} map Instance of TallyGo.Map object
 * @param {Object} options
 * @param {string} options.wsUrl The url on which to listen for WebSocket events describing vehicle location updates.
 * @param {string} [options.vehicleIcon='airport-15'] The string identifying the vehicle image to use for the animation.
 * @param {number} [options.animationSteps=500] The number of steps to use for 'tweening'. More steps will result in a smoother, slower animation.
 * @param {boolean} [options.logMessages=false] Logs each message received to the console if set to true
 * @param {boolean} [options.panMap=true] boolean that causes the map to zoom and pan following the animated vehicle as it moves around the map.
 *    During a multiple vehicle animation only the first point received will be used. Subsequent updates will not move the map.
 *
 * @example
 * var vehicleAnimation = new TallyGo.VehicleAnimation({
 *   vehicleIcon: 'car-taxi',
 *   animationSteps: 550,
 *   panMap: false,
 *   logMessages: true,
 *   wsUrl: 'ws://localhost:3200'
 * })
 */
export default class VehicleAnimation {
  constructor(map, options) {
    options = extend({}, defaultOptions, options)
    this.collection = []
    this.map = map
    this.animationSteps = options.animationSteps
    this.vehicleIcon = options.vehicleIcon
    this.panMap = options.panMap
    this.logMessages = options.logMessages
    this.webSocket = new WebSocket(options.wsUrl)
    /**
     * Is the function that accepts the WebSocket event and extracts the necessary data for
     * VehicleAnimation.updateLocation function
     *
     * @example
     * let vehicleAnimation = new VehicleAnimation(map, animationOptions)
     * vehicleAnimation.parseWSevent = function(event) {
     *   let message = JSON.parse(event.data)
     *   return {
     *     session_id: message.session_id,
     *     coordinates: [
     *       message.payload.longitude,
     *       message.payload.latitude
     *     ]
     *   }
     * }
     */
    this.parseWSevent = defaultParseWSevent
    this.animationInProgress = false
  }

  /**
   * Sets the webSocket's onmessage callback function to parse and process incoming
   * WebSocket event data and then kick off or update the animation
   * @example
   * vehicleAnimation.animate()
   * @returns {void}
   */
  animate() {
    let self = this
    this.map.glMap.on('load', function() {
      function updateAnimation() {
        if (self.continue()) window.requestAnimationFrame(updateAnimation)
      }
      self.webSocket.onmessage = function(event) {
        let message = self.parseWSevent(event)
        if (self.updateLocation(message)) updateAnimation()
      }
    })
  }

  updateLocation(message) {
    if (this.logMessages) console.log(message)
    this.updateMapCenter(message.coordinates)
    let vehicle = this.findOrInitVehicle(message.session_id)
    vehicle.buffer.add(message.coordinates)
    return this.start(vehicle)
  }

  start(vehicle) {
    this.animationInProgress = (
      !this.animationInProgress &&
      vehicle.buffer.length > 1 &&
      vehicle.buffer.currentIndex === 0
    )
    return this.animationInProgress
  }

  continue() {
    this.updateMap()
    this.animationInProgress = this.collection.map((vehicle) => {
      return vehicle.buffer.continue() // advance all the vehicles
    }).some((boolean) => { // true if any of the buffers advanced
      return boolean
    })
    return this.animationInProgress
  }

  updateMap() {
    let glMap = this.map.glMap
    this.collection.forEach(function(vehicle) {
      try {
        vehicle.layer.source.data.features[0].geometry.coordinates = vehicle.buffer.current().coordinates
        vehicle.layer.source.data.features[0].properties.bearing = vehicle.buffer.current().bearing
        glMap.getSource(vehicle.layer.id).setData(vehicle.layer.source.data)
      } catch (err) {
        console.log('id: ', vehicle.layer.id)
        console.log('vehicle buffer ', vehicle.buffer)
        throw (err)
      }
    })
  }

  findOrInitVehicle(sessionId) {
    let vehicle = this.find(sessionId)
    if (vehicle !== undefined) return vehicle

    return this.initVehicle(sessionId)
  }

  find(sessionId) {
    return this.collection.find(function(vehicle) {
      return vehicle.layer.id === sessionId
    })
  }

  initVehicle(sessionId) {
    let vehicle = {
      buffer: new AnimationBuffer(this.animationSteps),
      layer: vehiclePointLayer({
        id: sessionId,
        iconImage: this.vehicleIcon
      })
    }
    this.map.addLayer(vehicle.layer)
    this.collection.push(vehicle)
    return vehicle
  }

  /**
   * This pans the map to follow the vehicle as it moves across the map.
   * It will not attempt to pan the map if there is more than one vehicle
   * in the animation. So if the panMap boolean is set to true, as soon as
   * the vehicleAnimation receives an event for a second vehicle it will stop
   * panning the map to follow the first vehicle in the animation.
   * @param {LngLatLike} coordinates
   * @returns {void}
   */
  updateMapCenter(coordinates) {
    if (this.panMap && this.collection.length < 2) {
      this.map.glMap.flyTo(
        this.flyToOptions(this.map.glMap.getZoom(), coordinates)
      )
    }
  }

  flyToOptions(zoom, coordinates) {
    if (zoom <= 5) {
      return {
        center: coordinates,
        zoom: 15,
        speed: 1
      }
    }
    return {
      center: coordinates,
      zoom: zoom,
      speed: 0.2
    }
  }
}
