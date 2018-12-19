export const STYLE_DEFAULTS = {
  host: 'maptiles.tallygo.com',
  traffic: 0,
  path: 'map-style.json',
  protocol: 'https'
}

export const MAP_DEFAULTS = {
  center: [-95.84, 37.78],
  container: 'tallygo-map',
  hash: true,
  navPosition: 'top-left',
  routeLineColor: '#6495ED',
  zoom: 4
}
export const REQUEST_DEFAULTS = {
  apiUrl: 'https://api.tallygo.com/v1/route'
}
export const RequestDefaultParams = {
  course: 0,
  speed: 0,
  requestType: 'DepartureTime',
  useCarpoolLanes: false,
  useExpressLanes: false
}
export const RequestPermittedParams = {
  requestType: 'string',
  startPoint: 'array', // TODO: make Point Type
  endPoint: 'array', // TODO: make Point Type
  course: 'number',
  speed: 'number',
  time: 'string', // TODO: enforce type
  useCarpoolLanes: 'boolean',
  useExpressLanes: 'boolean'
}
