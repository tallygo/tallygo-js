/**
 * A container for a sequence of geographic points.
 * @param {Object} data JSON containing the segment properties and an `Array` of `Point` objects
 * @param {number} data.distance The total travel distance in miles for this segment.
 * @param {number} data.duration Estimated travel time in minutes for this segment.
 * @param {string} data.originalStartNode Node ID of the edge that the start point for this segment lays on.
 * @param {string} data.originalEndNode Node ID of the edge that end point for this segment lays on.
 * @param {Array} data.points A sequence of every point necessary to navigate this segment.
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
