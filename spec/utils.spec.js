import { getStyle } from '../src/utils'

describe('utility functions', () => {
  describe('getStyle', () => {
    it('returns the string argument when one is given', () => {
      expect(getStyle('http://stylehost.tld')).toEqual('http://stylehost.tld')
    })

    it('returns a default URL when no style argument is given', () => {
      expect(
        getStyle(undefined, undefined)
      ).toEqual('https://maptiles.tallygo.com/map-style.json?traffic=0&apiKey=undefined')
    })

    it('returns a default URL with the apiKey argument when no style argument is given', () => {
      expect(
        getStyle(undefined, 'foo')
      ).toEqual('https://maptiles.tallygo.com/map-style.json?traffic=0&apiKey=foo')
    })

    it('returns the expected URL when an options object argument is given', () => {
      expect(
        getStyle({
          protocol: 'http',
          host: 'localhost',
          traffic: 1
        }, 'foo')
      ).toEqual('http://localhost/map-style.json?traffic=1&apiKey=foo')
    })
  })
})
