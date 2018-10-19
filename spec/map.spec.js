import './mocks/createObjectURL.mock'
import mapboxgl from 'mapbox-gl'
import Map from '../src/map'

describe('Map', () => {
  beforeAll(() => {
    document.body.innerHTML = '<div id="map"></div>'
  })

  beforeEach(() => {
    mapboxgl.Map.mockClear()
  })

  const options = {
    container: 'map', apiToken: 'foo', center: [-95.84, 37.78]
  }

  it('initializes a mapboxgl.Map', () => {
    let map = new Map(options)

    expect(mapboxgl.Map).toHaveBeenCalledTimes(1)
    expect(map.glMap).toBeDefined()
  })
})
