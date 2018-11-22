const MAP_DEFAULTS = {
  center: [-95.84, 37.78],
  container: 'tallygo-map',
  hash: true,
  styleHost: 'maptiles-stg.tallygo.com',
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

const colorChart = [
  '#000000', '#cc0000',
  '#ff0000', '#ff8800',
  '#dddd00', '#B2EE0D',
  '#00ff00', '#00ff00',
  '#33FFCC'
]
export { MAP_DEFAULTS, REQUEST_DEFAULTS, colorChart, permittedParams }
