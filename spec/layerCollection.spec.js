import routeData from './fixtures/route.json'
import Route from '../src/route'
import LayerCollection from '../src/layerCollection'

describe('LayerCollection', () => {
  const route = new Route(routeData)
  const layerCollection = new LayerCollection(route)

  it('contains the expected layers', () => {
    let acc = []
    layerCollection.forEach(function(layer) {
      acc.push(layer.id)
    })
    expect(acc).toEqual([
      'startEnd',
      'points',
      'line-#000000',
      'line-#cc0000',
      'line-#ff0000',
      'line-#ff8800',
      'line-#dddd00',
      'line-#B2EE0D',
      'line-#00ff00',
      'line-#33FFCC',
      'points-say',
      'points-turn'
    ])
  })
})
