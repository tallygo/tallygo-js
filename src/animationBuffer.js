import { lineString } from '@turf/helpers'
import along from '@turf/along'
import distance from '@turf/distance'

export default class AnimationBuffer extends Array {
  constructor(steps) {
    super()
    this.steps = steps
    this.options = {units: 'kilometers'}
    this.currentIndex = 0
  }

  continue() {
    return ((this.currentIndex + 3) < this.length)
  }

  current() {
    return this[this.currentIndex]
  }

  next() {
    return this[this.currentIndex + 1]
  }

  advance() {
    this.currentIndex = this.currentIndex + 1
  }

  truncate() {
    this.splice(0, this.length - 3)
    this.currentIndex = 0
  }

  add(coordinates) {
    if ((this.length + 1) > 1) {
      this.calculateIntermediatePoints(coordinates)
    }
    this.push(coordinates)
  }

  calculateIntermediatePoints(coordinates) {
    let from = this[this.length - 1]
    let to = coordinates
    let distanceM = (distance(from, to, this.options) * 1000)

    for (var i = 0; i < distanceM; i += distanceM / this.steps) {
      if (i === 0) { continue } // The 0th coordinate is already present
      var segment = along(
        lineString([from, to]),
        (i / 1000),
        this.options
      )
      this.push(segment.geometry.coordinates)
    }
  }
}
