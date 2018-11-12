import './mocks/createObjectURL.mock'
import routeData from './fixtures/route.json'
import Route from '../src/route'
import RoutePresenter from '../src/routePresenter'

describe('RoutePresenter', () => {
  const route = new Route(routeData)
  const map = {}

  it('returns the expected object', () => {
    let routePresenter = new RoutePresenter(map)
    expect(
      Object.keys(routePresenter.buildPoints(route))
    ).toEqual(['type', 'features'])
  })

  it('returns the expected features', () => {
    let routePresenter = new RoutePresenter(map)
    expect(routePresenter.buildPoints(route).features.length).toEqual(442)
  })

  it('returns the expected line colors', () => {
    let routePresenter = new RoutePresenter(map)
    let points = routePresenter.buildPoints(route)
    let lineColors = routePresenter.assignLineColors(points)
    expect(lineColors.length).toEqual(441)
  })
})
