import { lineString } from '@turf/helpers'
import along from '@turf/along'
import distance from '@turf/distance'

export default class PointBuffer extends Array {
  constructor(stepFactor) {
    super()
    this.stepFactor = stepFactor
    this.options = {units: 'kilometers'}
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

    let distanceKm = distance(from, to, this.options)
    let distanceM = distanceKm * 1000
    let steps = Math.ceil(distanceM / this.stepFactor)

    for (var i = 0; i < distanceM; i += distanceM / steps) {
      if (i === 0) { continue }
      var line = lineString([from, to])
      var segment = along(line, (i / 1000), this.options)
      this.push(segment.geometry.coordinates)
    }
  }
}
