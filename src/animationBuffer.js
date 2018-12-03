import { lineString, point } from '@turf/helpers'
import bearing from '@turf/bearing'
import along from '@turf/along'
import distance from '@turf/distance'

export default class AnimationBuffer extends Array {
  constructor(steps) {
    super()
    this.steps = steps
    this.options = {units: 'kilometers'}
    this.currentIndex = 0
    // Temporary workaround for https://github.com/istanbuljs/babel-plugin-istanbul/issues/143 #TODO
    /* eslint-disable no-proto */
    // $FlowFixMe
    this.constructor = AnimationBuffer
    // $FlowFixMe
    this.__proto__ = AnimationBuffer.prototype
    /* eslint-enable */
  }

  continue() {
    if (this.currentIndex >= (this.length - 2)) {
      return false
    }
    if (this.currentIndex === this.steps) {
      this.truncate(this.currentIndex - this.steps)
    }
    return true
  }

  current() {
    return this[this.currentIndex].coordinates
  }

  bearingStart() {
    return this[this.currentIndex].coordinates
  }

  bearingEnd() {
    return this[this.currentIndex + 1].coordinates
  }

  currentBearing() {
    return bearing(
      point(this.bearingStart()),
      point(this.bearingEnd())
    )
  }

  advance() {
    this.currentIndex = this.currentIndex + 1
  }

  truncate(startIndex) {
    this.splice(startIndex, (this.currentIndex + 1))
    this.currentIndex = startIndex
  }

  add(coordinates) {
    if ((this.length + 1) > 1) {
      this.calculateIntermediatePoints(coordinates)
    }
    this.push({bearing: null, coordinates: coordinates})
  }

  distanceMeters(from, to) {
    return distance(from, to, this.options) * 1000
  }

  calculateIntermediatePoints(coordinates) {
    let from = this[this.length - 1].coordinates
    let to = coordinates
    let distanceM = this.distanceMeters(from, to)
    let stepDistance = (distanceM / this.steps)
    console.log(distanceM)
    console.log(stepDistance)

    for (var i = 0; i < distanceM; i += stepDistance) {
      if (i === 0) { continue } // The 0th coordinate is already present
      var segment = along(
        lineString([from, to]),
        (i / 1000),
        this.options
      )
      this.push({bearing: null, coordinates: segment.geometry.coordinates})
    }
  }
}
