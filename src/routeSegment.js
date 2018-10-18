
export default class RouteSegment {
  constructor(data) {
    this.duration = data.duration
    this.points = data.points
    this.originalEndNode = data.originalEndNode
    this.originalStartNode = data.originalStartNode
    this.distance = data.distance
    this.firstPoint = this.points[0]
    this.lastPoint = this.points[ this.points.length - 1 ]
  }

  startLonLat() {
    return [this.firstPoint.lon, this.firstPoint.lat]
  }

  endLonLat() {
    return [this.lastPoint.lon, this.lastPoint.lat]
  }
}
