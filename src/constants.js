const MAP_DEFAULTS = {
  center: [-95.84, 37.78],
  container: 'tallygo-map',
  hash: true,
  styleHost: 'maptiles.tallygo.com',
  traffic: 0,
  zoom: 4
}
const REQUEST_DEFAULTS = {
  // TODO: These aren't currently used
  course: 0,
  speed: 0,
  partitionHeuristic: false,
  requestType: 'DepartureTime',
  minimizeDifficultLeftTurns: false,
  useCarpoolLanes: false,
  useExpressLanes: false,
  staticWeights: false
}
const permittedParams = {
  requestType: 'string',
  startPoint: 'array', // TODO: make Point Type
  endPoint: 'array', // TODO: make Point Type
  course: 'number',
  speed: 'number',
  time: 'string', // TODO: enforce type
  useCarpoolLanes: 'boolean',
  useExpressLanes: 'boolean',
  staticWeights: 'boolean',
  minimizeDifficultLeftTurns: 'boolean'
}

export { MAP_DEFAULTS, REQUEST_DEFAULTS, permittedParams }
