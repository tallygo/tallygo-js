// const mapboxgl = require('mapbox-gl')
const mapboxgl = jest.genMockFromModule('mapbox-gl')
module.exports = mapboxgl
//const utils = jest.genMockFromModule('../utils').default;
//utils.isAuthorized = jest.fn(secret => secret === 'not wizard');
