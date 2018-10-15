export default class Route {
  constructor(data) {
    this.duration = data.duration
    this.routeSegments = data.routeSegments
    this.originalEndNode = data.originalEndNode
    this.originalStartNode = data.originalStartNode
    this.distance = data.distance
  }
}
