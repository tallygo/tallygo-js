// @flow

import AnimationBuffer from './animationBuffer'
import { vehiclePointLayer } from './layerUtils'
import { extend } from './utils'

const defaultOptions = {
  vehicleIcon: 'airport-15',
  animationSteps: 600,
  panMap: true
}

export default class VehicleCollection {
  constructor(options) {
    options = extend({}, defaultOptions, options)
    this.collection = []
    this.map = options.map
    this.animationSteps = options.animationSteps
    this.vehicleIcon = options.vehicleIcon
    this.panMap = options.panMap
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

  findOrInitVehicle(sessionId) {
    let vehicle = this.find(sessionId)
    if (vehicle === undefined) {
      vehicle = this.initVehicle(sessionId)
      this.map.addLayer(vehicle.layer)
      this.collection.push(vehicle)
    }
    return vehicle
  }

  centerMapOnLocation(coordinates) {
    if (this.panMap && this.collection.length < 2) {
      this.map.glMap.flyTo(
        this.flyToOptions(this.map.glMap.getZoom(), coordinates)
      )
    }
  }

  locationUpdate(update) {
    this.centerMapOnLocation(update.coordinates)
    let vehicle = this.findOrInitVehicle(update.session_id)
    vehicle.buffer.add(update.coordinates)
    return this.startAnimation()
  }

  startAnimation() {
    return this.collection.some(
      (vehicle) => {
        return (vehicle.buffer.length > 1 && vehicle.buffer.currentIndex === 0)
      }
    )
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

  continueAnimation() {
    this.updateLayers()
    return this.collection.some(
      (vehicle) => { return vehicle.buffer.continue() }
    )
  }

  updateLayers() {
    let glMap = this.map.glMap
    this.collection.forEach(function(vehicle) {
      vehicle.layer.source.data.features[0].geometry.coordinates = vehicle.buffer.current().coordinates
      vehicle.layer.source.data.features[0].properties.bearing = vehicle.buffer.current().bearing
    })
    this.collection.forEach(function(vehicle) {
      glMap.getSource(vehicle.layer.id).setData(vehicle.layer.source.data)
    })
  }
}
