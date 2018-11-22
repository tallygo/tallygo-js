import './mocks/createObjectURL.mock'
import routeData from './fixtures/route.json'
import Route from '../src/route'
import LayerCollection from '../src/layerCollection'

describe('LayerCollection', () => {
  const route = new Route(routeData)
  let layerCollection = new LayerCollection(route)

  it('returns the expected object', () => {
    expect(
      Object.keys(layerCollection.points)
    ).toEqual(['type', 'features'])
  })

  it('returns the expected features', () => {
    expect(layerCollection.points.features.length).toEqual(442)
  })

  it('returns the expected multiLines', () => {
    const colorChart = [
      '#000000', '#cc0000',
      '#ff0000', '#ff8800',
      '#dddd00', '#B2EE0D',
      '#00ff00', '#33FFCC'
    ]
    expect(
      Object.keys(layerCollection.multiLines)
    ).toEqual(colorChart)
  })
})
