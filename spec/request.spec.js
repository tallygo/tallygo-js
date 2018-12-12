import Request from '../src/request'
import routeJSON from './fixtures/route.json'

describe('Request', () => {
  const options = { apiKey: 'fakeApiKey', apiUrl: 'https://api.example.com/v1/route' }
  const requestParams = {
    requestType: 'DepartureTime',
    startPoint: [34.76151710977818, -112.0571484988772],
    endPoint: [34.76260434283671, -112.01666952034871],
    course: 180,
    speed: 6,
    time: '2018-11-13T01:31:51-0800',
    useCarpoolLanes: true,
    useExpressLanes: true
  }
  const expectedUrl = 'https://api.example.com/v1/route?apiKey=fakeApiKey&' +
    'coords=34.76151710977818%2C-112.0571484988772%3B34.76260434283671%2C-112.01666952034871&' +
    'requestType=DepartureTime&startPoint=34.76151710977818%2C-112.0571484988772&' +
    'endPoint=34.76260434283671%2C-112.01666952034871&course=180&speed=6&' +
    'time=2018-11-13T01%3A31%3A51-0800&useCarpoolLanes=true&useExpressLanes=true'
  const request = new Request(options)

  it('sets the apiKey', () => {
    expect(request.apiKey).toEqual('fakeApiKey')
  })

  describe('buildUrl', () => {
    it('builds the expected url', () => {
      expect(
        request.buildUrl(requestParams)
      ).toEqual(expectedUrl)
    })
  })

  describe('get', () => {
    beforeEach(() => { fetch.resetMocks() })

    it('fetches with the given parameters', async () => {
      fetch.mockResponseOnce(JSON.stringify(routeJSON))

      await request.get(requestParams).then(json => {
        expect(json.duration).toEqual(2344)
        expect(json.distance).toEqual(33596.0)
        expect(json.routeSegments[0].points.length).toEqual(442)
      })

      expect(fetch).toHaveBeenCalledWith(expectedUrl)
    })
  })
})
