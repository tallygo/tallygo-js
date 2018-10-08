const tallygo = require('../dist/index.cjs')

describe('MapGeometry', () => {
  let mapGeometry

  it('creates a MapGeometry', () => {
    mapGeometry = new tallygo.MapGeometry(5)
    expect(mapGeometry.tileSize).toEqual(256)
  })
})
