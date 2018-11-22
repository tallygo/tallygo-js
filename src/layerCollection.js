import {
  coloredLineLayer,
  pointCollection,
  pointLayer,
  pointSayLayer,
  pointTurnLayer,
  startEndLayer
} from './layerUtils'

export default class LayerCollection extends Array {
  constructor(route) {
    super()
    const self = this
    const points = pointCollection(route.firstSegment.points)

    self.push(
      startEndLayer(route.startLonLat(), route.endLonLat())
    )
    self.push(
      pointLayer(points)
    )
    coloredLineLayer(points).forEach((layerData) => {
      self.push(layerData)
    })
    self.push(
      pointSayLayer(points)
    )
    self.push(
      pointTurnLayer(points)
    )
  }
}
