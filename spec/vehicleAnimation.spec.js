import './mocks/createObjectURL.mock'
import mapboxgl from 'mapbox-gl'
import Map from '../src/map'
import VehicleAnimation from '../src/vehicleAnimation'
import WebSocket from 'isomorphic-ws'
jest.mock('isomorphic-ws')
jest.mock('../src/utils', () => ({
  ...require.requireActual('../src/utils'),
  getElement: jest.fn(() => 'HTMLElement'),
  setHeightStyle: jest.fn(() => true)
}))

describe('VehicleAnimation', () => {
  beforeEach(() => { mapboxgl.Map.mockClear() })

  const map = new Map({
    container: 'tallygo-map',
    style: 'https://localhost/map-style.json'
  })
  const vehicleAnimation = new VehicleAnimation(
    map, { wsUrl: 'ws://localhost:3200' }
  )

  it('initializes the WebSocket', () => {
    expect(WebSocket).toHaveBeenCalledWith('ws://localhost:3200')
  })

  describe('updateMapCenter', () => {
    beforeEach(() => {
      vehicleAnimation.map.glMap.flyTo.mockClear()
      vehicleAnimation.collection.splice(0, (vehicleAnimation.collection.length - 1))
    })
    const coordinates = [-118, 34]

    it('calls mapboxgl.Map.flyTo with the expected values when the map zoom is less than 6', () => {
      vehicleAnimation.map.glMap.getZoom = jest.fn(() => 5)
      vehicleAnimation.updateMapCenter(coordinates)

      expect(vehicleAnimation.map.glMap.getZoom).toHaveBeenCalledTimes(1)
      expect(vehicleAnimation.map.glMap.flyTo).toHaveBeenCalledWith(
        {center: coordinates, speed: 1, zoom: 15}
      )
    })

    it('does not call mapboxgl.Map.flyTo when panMap is false', () => {
      vehicleAnimation.panMap = false

      vehicleAnimation.updateMapCenter(coordinates)
      expect(vehicleAnimation.map.glMap.flyTo).not.toHaveBeenCalled()
      vehicleAnimation.panMap = true
    })

    it('does not call mapboxgl.Map.flyTo when there is more than 1 vehicle in the collection', () => {
      vehicleAnimation.collection.push({})
      vehicleAnimation.collection.push({})

      vehicleAnimation.updateMapCenter(coordinates)
      expect(vehicleAnimation.map.glMap.flyTo).not.toHaveBeenCalled()
    })

    it('calls mapboxgl.Map.flyTo with the expected values when the map zoom more than 5', () => {
      vehicleAnimation.map.glMap.getZoom = jest.fn(() => 8)
      vehicleAnimation.updateMapCenter(coordinates)

      expect(vehicleAnimation.map.glMap.getZoom).toHaveBeenCalledTimes(1)
      expect(vehicleAnimation.map.glMap.flyTo).toHaveBeenCalledWith(
        {center: coordinates, speed: 0.2, zoom: 8}
      )
    })
  })
})
