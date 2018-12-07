import Route from '../src/route'
import routeData from './fixtures/route.json'

describe('Route', () => {
  let route = new Route(routeData)

  it('has the expected duration', () => {
    expect(route.duration).toEqual(2344)
  })

  it('has the expected distance', () => {
    expect(route.distance).toEqual(33596.0)
  })

  it('has the expected originalStartNode', () => {
    expect(route.originalStartNode).toEqual(1794679258)
  })

  it('has the expected originalEndNode', () => {
    expect(route.originalEndNode).toEqual(175992557)
  })

  it('has the expected segments', () => {
    expect(route.segments.length).toEqual(1)
  })

  it('returns the expected startLonLat', () => {
    expect(route.startLonLat()).toEqual([-112.056714, 34.761876])
  })

  it('returns the expected endLonLat', () => {
    expect(route.endLonLat()).toEqual([-111.816391, 34.825415])
  })

  it('returns the expected coordinates', () => {
    let coordinates = route.coordinates()
    expect(coordinates[0]).toEqual([-112.056714, 34.761876])
    expect(coordinates[coordinates.length - 1]).toEqual([-111.816391, 34.825415])
  })
})
