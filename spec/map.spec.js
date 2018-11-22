import './mocks/createObjectURL.mock'
import mapboxgl from 'mapbox-gl'
import Map from '../src/map'
import LayerCollection from '../src/layerCollection'
jest.mock('../src/layerCollection')

describe('Map', () => {
  beforeAll(() => {
    document.body.innerHTML = '<div id="tallygo-map"></div>'
  })

  beforeEach(() => { mapboxgl.Map.mockClear() })

  const options = { apiToken: 'foo', container: 'tallygo-map' }

  it('initializes a mapboxgl.Map', () => {
    let map = new Map(options)
    expect(mapboxgl.Map).toHaveBeenCalledTimes(1)
    expect(map.glMap).toBeDefined()
    expect(map.geojson).toBeDefined()
  })

  describe('draw', () => {
    beforeEach(() => { LayerCollection.mockClear() })

    it('waits for the mapboxgl.Map to load', () => {
      const map = new Map(options)
      const route = {
        coordinates: () => {
          return [[-118.494929, 34.101589], [-118.340944, 34.011441]]
        }
      }
      const mockLngLatBoundsInstance = {
        extend: (coord) => { return mockLngLatBoundsInstance }
      }
      mapboxgl.LngLatBounds.mockImplementation(() => {
        return mockLngLatBoundsInstance
      })

      map.draw([route])

      const mockLayerCollectionInstance = LayerCollection.mock.instances[0]
      const callback = map.glMap.on.mock.calls[0][1]
      expect(LayerCollection).toHaveBeenCalledWith(route)
      expect(map.glMap.on).toHaveBeenCalledWith('load', callback)
      expect(map.glMap.fitBounds).not.toHaveBeenCalled()

      callback()

      expect(mockLayerCollectionInstance.forEach).toHaveBeenCalledTimes(1)
      expect(mapboxgl.LngLatBounds).toHaveBeenCalledWith(
        [-118.494929, 34.101589], [-118.494929, 34.101589]
      )
      expect(map.glMap.fitBounds).toHaveBeenCalledWith(
        mockLngLatBoundsInstance, {padding: 20}
      )
    })
  })
})
