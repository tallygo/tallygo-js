// @flow

import WebSocket from 'isomorphic-ws'
import AnimationBuffer from './animationBuffer'
import { vehiclePointLayer } from './layerUtils'
import { extend } from './utils'

const defaultOptions = {
  vehicleIcon: 'airport-15',
  animationSteps: 600,
  panMap: true
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

export default class VehicleAnimation {
  constructor(map, options) {
    options = extend({}, defaultOptions, options)
    this.collection = []
    this.map = map
    this.animationSteps = options.animationSteps
    this.vehicleIcon = options.vehicleIcon
    this.panMap = options.panMap
    this.webSocket = new WebSocket(options.wsUrl)
    this.parseWSevent = defaultParseWSevent
    this.animationInProgress = false
  }

  animate() {
    let self = this
    this.map.glMap.on('load', function() {
      function updateAnimation() {
        if (self.continueAnimation()) {
          window.requestAnimationFrame(updateAnimation)
        }
      }

      self.webSocket.onmessage = function(event) {
        let update = self.parseWSevent(event)
        if (self.locationUpdate(update)) {
          updateAnimation()
        }
      }
    })
  }

  locationUpdate(update) {
    this.centerMapOnLocation(update.coordinates)
    let vehicle = this.findOrInitVehicle(update.session_id)
    vehicle.buffer.add(update.coordinates)
    return this.startAnimation(vehicle)
  }

  startAnimation(vehicle) {
    this.animationInProgress = (
      !this.animationInProgress &&
      vehicle.buffer.length > 1 &&
      vehicle.buffer.currentIndex === 0
    )
    return this.animationInProgress
  }

  continueAnimation() {
    this.updateLayers()
    this.animationInProgress = this.collection.map(
      (vehicle) => { return vehicle.buffer.continue() }
    ).some((boolean) => { return boolean })
    return this.animationInProgress
  }

  updateLayers() {
    let glMap = this.map.glMap
    this.collection.forEach(function(vehicle) {
      try {
        vehicle.layer.source.data.features[0].geometry.coordinates = vehicle.buffer.current().coordinates
        vehicle.layer.source.data.features[0].properties.bearing = vehicle.buffer.current().bearing
      } catch (err) {
        console.log('id: ', vehicle.layer.id)
        console.log('vehicle buffer ', vehicle.buffer)
        throw (err)
      }
    })
    this.collection.forEach(function(vehicle) {
      glMap.getSource(vehicle.layer.id).setData(vehicle.layer.source.data)
    })
  }

  findOrInitVehicle(sessionId) {
    let vehicle = this.find(sessionId)
    if (vehicle === undefined) {
      vehicle = this.initVehicle(sessionId)
      this.map.addLayer(vehicle.layer)
      this.collection.push(vehicle)
    }
    return vehicle
  }

  find(sessionId) {
    return this.collection.find(function(vehicle) {
      return vehicle.layer.id === sessionId
    })
  }

  initVehicle(sessionId) {
    return {
      buffer: new AnimationBuffer(this.animationSteps),
      layer: vehiclePointLayer({
        id: sessionId,
        iconImage: this.vehicleIcon
      })
    }
  }

  centerMapOnLocation(coordinates) {
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
