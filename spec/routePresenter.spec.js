import './mocks/createObjectURL.mock'
import routeData from './fixtures/route.json'
import Map from '../src/map'
import Route from '../src/route'
import RoutePresenter from '../src/routePresenter'

describe('RoutePresenter', () => {
  const options = {
    container: 'map', apiToken: 'foo', center: [-95.84, 37.78]
  }
  const route = new Route(routeData)

  beforeAll(() => {
    document.body.innerHTML = '<div id="map"></div>'
  })

  it('returns the expected object', () => {
    let map = new Map(options)
    let routePresenter = new RoutePresenter(map, route)
    expect(
      Object.keys(routePresenter.buildPoints())
    ).toEqual(['type', 'features'])
  })

  it('returns the expected features', () => {
    let map = new Map(options)
    let routePresenter = new RoutePresenter(map, route)
    expect(routePresenter.buildPoints().features.length).toEqual(442)
  })

  it('returns the expected line colors', () => {
    let map = new Map(options)
    let routePresenter = new RoutePresenter(map, route)
    let points = routePresenter.buildPoints()
    let lineColors = routePresenter.assignLineColors(points)
    expect(lineColors.length).toEqual(441)
  })
})
