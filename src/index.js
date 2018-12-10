// @flow

import { version } from '../package.json'
import Map from './map'
import Request from './request'
import Route from './route'
import VehicleAnimation from './vehicleAnimation'
import { loadJSON, extend, getStyle, objectFetch } from './utils'
import { MAP_DEFAULTS, REQUEST_DEFAULTS } from './constants'

/**
 * The `configure` function is used to set the TallyGo Api Key
 * and provide other options to the `Map` and `Request` objects
 *
 * @param {Object} options
 * @param {string} options.apiKey The api key to be used for all API requests and map tile requests.
 * @param {Object} options.map The JSON object specifying options that will be passed to the TallyGo.Map constructor
 *   See the TallyGo.Map documentation for valid Request configuration properties.
 * @param {Object} options.request The JSON object specifying options that will be passed to the TallyGo.Request constructor
 *   See the TallyGo.Request documentation for valid Request configuration properties.
 * @returns {Object}
 * @example
 * var tallygo = TallyGo.configure({
 *   apiKey: '<Client Api Key>',
 *   map: { navPosition: 'top-left' },
 *   request: { apiUrl: 'https://api.tallygo.com/v1/route' }
 * });
 * @see [Configure the API](https://www.tallygo.com/tallygo-kit-js/examples/)
 */

function configure (options) {
  let style = getStyle(objectFetch(options.map, 'style'), options.apiKey)
  const mapOptions = extend(
    {style: style}, MAP_DEFAULTS, options['map']
  )
  const requestOptions = extend(
    {apiKey: options['apiKey']}, REQUEST_DEFAULTS, options['request']
  )
  const api = {
    map: new Map(mapOptions),
    request: new Request(requestOptions),
    newRoute: (data) => new Route(data),
    version: version
  }

  return api
}

const exported = { configure, loadJSON, Map, Request, VehicleAnimation }
export default exported
