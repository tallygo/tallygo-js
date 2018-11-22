import './mocks/createObjectURL.mock'
import RoutePresenter from '../src/routePresenter'

describe('RoutePresenter', () => {
  const map = {}

  it('returns the expected object', () => {
    let routePresenter = new RoutePresenter(map)
    expect(routePresenter.map).toEqual(map)
  })
})
