import RouteSegment from './routeSegment'

export default class Route {
  constructor(data) {
    this.duration = data.duration
    this.segments = data.routeSegments.map(function(segmentData) {
      return new RouteSegment(segmentData)
    })
    this.originalEndNode = data.originalEndNode
    this.originalStartNode = data.originalStartNode
    this.distance = data.distance
    this.firstSegment = this.segments[0]
    this.lastSegment = this.segments[this.segments.length - 1]
  }

  startLonLat() {
    return this.firstSegment.startLonLat()
  }

  endLonLat() {
    return this.lastSegment.endLonLat()
  }
}
