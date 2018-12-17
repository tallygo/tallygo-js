import routeData from './fixtures/route.json'
import Route from '../src/route'
import * as layerUtils from '../src/layerUtils'

describe('layerUtils', () => {
  const route = new Route(routeData)

  describe('pointCollection', () => {
    it('transforms the route points into a geoJSON collection', () => {
      let points = layerUtils.pointCollection(route.firstSegment.points)
      expect(points.features.length).toEqual(442)
    })
  })
})
