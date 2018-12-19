import './mocks/createObjectURL.mock'
import mapboxgl from 'mapbox-gl'
import Map from '../src/map'
import LayerCollection from '../src/layerCollection'
import { getElement, setHeightStyle } from '../src/utils'
jest.mock('../src/layerCollection')
jest.mock('../src/utils', () => ({
  getElement: jest.fn(() => 'HTMLElement'),
  setHeightStyle: jest.fn(() => true)
}))

describe('Map', () => {
  beforeEach(() => { mapboxgl.Map.mockClear() })

  const options = {
    container: 'tallygo-map',
    routeLineColor: '#6495ED',
    style: 'https://localhost/map-style.json'
  }

  it('initializes a mapboxgl.Map', () => {
    let map = new Map(options)
    expect(mapboxgl.Map).toHaveBeenCalledWith(options)
    expect(getElement).toHaveBeenCalledWith(options.container)
    expect(setHeightStyle).toHaveBeenCalledWith('HTMLElement')
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
      expect(LayerCollection).toHaveBeenCalledWith(route, '#6495ED')
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
