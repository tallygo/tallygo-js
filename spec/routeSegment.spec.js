import RouteSegment from '../src/routeSegment'
import routeData from './fixtures/route.json'

describe('RouteSegment', () => {
  let routeSegment = new RouteSegment(routeData.routeSegments[0])

  it('has the expected duration', () => {
    expect(routeSegment.duration).toEqual(2344)
  })

  it('has the expected distance', () => {
    expect(routeSegment.distance).toEqual(33596.0)
  })

  it('has the expected number of points', () => {
    expect(routeSegment.points.length).toEqual(442)
  })

  it('returns the expected value for startLonLat', () => {
    expect(routeSegment.startLonLat()).toEqual([-112.056714, 34.761876])
  })

  it('returns the expected value for endLonLat', () => {
    expect(routeSegment.endLonLat()).toEqual([-111.816391, 34.825415])
  })
})
