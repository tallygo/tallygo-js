import {
  buildRouteLine,
  pointCollection,
  startEndLayer
} from './layerUtils'

export default class LayerCollection extends Array {
  constructor(route, routeLineColor) {
    super()
    const self = this
    const points = pointCollection(route.firstSegment.points)
    self.push(
      startEndLayer(route.startLonLat(), route.endLonLat())
    )
    self.push(
      buildRouteLine(points, routeLineColor)
    )
  }
}
