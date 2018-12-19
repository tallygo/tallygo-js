import routeData from './fixtures/route.json'
import Route from '../src/route'
import LayerCollection from '../src/layerCollection'

describe('LayerCollection', () => {
  const route = new Route(routeData)
  const layerCollection = new LayerCollection(route, '#0183b2')

  it('contains the expected layers', () => {
    let acc = []
    layerCollection.forEach(function(layer) {
      acc.push(layer.id)
    })
    expect(acc).toEqual([
      'startEnd',
      'line-#0183b2'
    ])
  })
})
