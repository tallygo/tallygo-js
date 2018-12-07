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
    this.currentBearing = 0
    // Temporary workaround for https://github.com/istanbuljs/babel-plugin-istanbul/issues/143 #TODO
    /* eslint-disable no-proto */
    // $FlowFixMe
    this.constructor = AnimationBuffer
    // $FlowFixMe
    this.__proto__ = AnimationBuffer.prototype
    /* eslint-enable */
  }

  add(coordinates) {
    if ((this.length + 1) > 1) {
      this.calculateIntermediatePoints(coordinates)
    }
    this.push({bearing: this.currentBearing, coordinates: coordinates})
  }

  continue() {
    if (this.currentIndex >= (this.length - 1)) {
      this.truncate(0)
      return false
    }

    if (this.currentIndex === this.steps) { this.truncate(0) }
    this.currentIndex = this.currentIndex + 1
    return true
  }

  current() {
    return this[this.currentIndex]
  }

  truncate(startIndex) {
    this.splice(startIndex, this.currentIndex)
    this.currentIndex = startIndex
  }

  calculateDistanceAndBearing(from, to) {
    let distanceM = distance(from, to, this.options) * 1000
    if (distanceM >= 10) {
      this.currentBearing = bearing(point(from), point(to))
    }
    return distanceM
  }

  calculateIntermediatePoints(coordinates) {
    let from = this[this.length - 1].coordinates
    let to = coordinates
    let distanceM = this.calculateDistanceAndBearing(from, to)
    let stepDistance = (distanceM / this.steps)
    if (distanceM < 3) { return }

    for (let i = stepDistance; i < (distanceM - stepDistance); i += stepDistance) {
      var segment = along(lineString([from, to]), (i / 1000), this.options)
      this.push({
        bearing: this.currentBearing,
        coordinates: segment.geometry.coordinates
      })
    }
  }
}
