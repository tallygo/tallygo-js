import RouteSegment from './routeSegment'

/**
 * The `Route` object wraps the `Request` response JSON
 *
 * @param {Object} data JSON containing the route properties and data.
 * @param {number} data.distance The total travel distance in miles
 * @param {number} data.duration Estimated travel time in minutes.
 * @param {string} data.originalStartNode Node ID of the edge that start point lays on
 * @param {string} data.originalEndNode Node ID of the edge that end point lays on
 * @param {Array} data.routeSegments All the legs for this route, corresponding to the requested coords
 */
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

  coordinates() {
    return this.segments.reduce(
      (acc, segment) => {
        return acc.concat(
          segment.points.map(
            (point) => { return [point.lon, point.lat] }
          )
        )
      }, []
    )
  }

  startLonLat() {
    return this.firstSegment.startLonLat()
  }

  endLonLat() {
    return this.lastSegment.endLonLat()
  }
}
