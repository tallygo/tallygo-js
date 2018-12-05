// @flow

import AnimationBuffer from './animationBuffer'
import { vehiclePointLayer } from './layerUtils'

export default class VehicleCollection {
  constructor(map, vehicleIcon, animationSteps) {
    this.map = map
    this.collection = []
    this.animationSteps = animationSteps
    this.vehicleIcon = vehicleIcon
  }

  length() {
    return this.collection.length
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

  locationUpdate(update) {
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
