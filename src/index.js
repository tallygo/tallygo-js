// @flow

import { version } from '../package.json'
import Map from './map'
import Request from './request'
import Route from './route'
import VehicleAnimation from './vehicleAnimation'
import { loadJSON, extend } from './utils'
import { MAP_DEFAULTS, REQUEST_DEFAULTS } from './constants'

/**
 * The `configure` function is used to set the TallyGo Api Token
 * and provide other options to the `Map` and `Request` objects
 *
 * @param {Object} options
 * @param {string} options.apiToken The api token to be used for all API requests and map tile requests.
 * @param {Object} options.map The JSON object specifying options that will be passed to the TallyGoKit.Map constructor
 *   See the TallyGoKit.Map documentation for valid Request configuration properties.
 * @param {Object} options.request The JSON object specifying options that will be passed to the TallyGoKit.Request constructor
 *   See the TallyGoKit.Request documentation for valid Request configuration properties.
 * @returns {Object}
 * @example
 * var tallygo = TallyGo.configure({
 *   apiToken: '<Client Api Token>',
 *   map: { navPosition: 'top-left' },
 *   request: { apiUrl: 'https://api.tallygo.com/v1/route' }
 * });
 * @see [Configure the API](https://www.tallygo.com/tallygo-kit-js/examples/)
 */

function configure (options) {
  const mapOptions = extend(
    {apiToken: options['apiToken']}, MAP_DEFAULTS, options['map']
  )
  const requestOptions = extend(
    {apiKey: options['apiToken']}, REQUEST_DEFAULTS, options['request']
  )
  // console.log('mapOptions: ', mapOptions)
  // console.log('requestOptions: ', requestOptions)
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
