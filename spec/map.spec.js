import './mocks/createObjectURL.mock'
import mapboxgl from 'mapbox-gl'
import Map from '../src/map'
import RoutePresenter from '../src/routePresenter'
jest.mock('../src/routePresenter')

describe('Map', () => {
  beforeAll(() => {
    document.body.innerHTML = '<div id="tallygo-map"></div>'
  })

  beforeEach(() => { mapboxgl.Map.mockClear() })

  const options = { apiToken: 'foo', container: 'tallygo-map' }

  it('initializes a mapboxgl.Map', () => {
    let map = new Map(options)
    expect(mapboxgl.Map).toHaveBeenCalledTimes(1)
    expect(RoutePresenter).toHaveBeenCalledTimes(1)
    expect(map.glMap).toBeDefined()
    expect(map.routePresenter).toBeDefined()
  })

  describe('draw', () => {
    beforeEach(() => { RoutePresenter.mockClear() })

    it('waits for the mapboxgl.Map to load', () => {
      let map = new Map(options)
      let route = {}

      map.draw([route])

      let callback = map.glMap.on.mock.calls[0][1]
      expect(map.glMap.on).toHaveBeenCalledWith('load', callback)

      callback()
      expect(map.routePresenter.draw).toHaveBeenCalledWith(route)
    })
  })
})
