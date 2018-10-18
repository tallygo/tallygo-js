import './mocks/createObjectURL.mock'
import Map from '../src/map'

describe('Map', () => {
  let map = new Map({
    container: 'map',
    apiToken: '22a2db381ba59ca2b4be2d21cea456e7',
    center: [-95.84, 37.78]
  })

  it('works', () => {
    expect(map.geojson).toEqual({})
  })
})
