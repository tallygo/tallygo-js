/**
 * Creates a container for a sequence of geographic points.
 * @param {Object} data JSON containing properties and an `Array` of `Point` objects
 */
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

  /**
   * Gets the longitude and latitude of the first point in the sequence of points
   *
   * @returns {Array} LngLat pair
   */
  startLonLat() {
    return [this.firstPoint.lon, this.firstPoint.lat]
  }

  /**
   * Gets the longitude and latitude of the last point in the sequence of points
   *
   * @returns {Array} LngLat pair
   */
  endLonLat() {
    return [this.lastPoint.lon, this.lastPoint.lat]
  }
}
