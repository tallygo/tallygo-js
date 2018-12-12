// @flow
/* eslint valid-jsdoc: ["error", { "requireParamDescription": false }] */

import fetch from 'isomorphic-unfetch'
import { RequestDefaultParams, RequestPermittedParams } from './constants'
import { extend, ISODateString } from './utils'

/**
 * The `Request` object holds the default request parameters as well as the
 * apiKey
 *
 * You create a `Request` by specifying at least an `apiKey`.
 *
 * @param {Object} options
 * @param {string} options.apiKey The client's apiKey.
 *
 * @example
 * let request = new TallyGo.Request({apiKey: '<Client Api Key>'})
 *
 * request.get({
 *   startPoint: [34.761517109, -112.057148498],
 *   endPoint: [34.762604342, -112.016669520]
 * }).then(
 *   function(response) { console.log(response) }
 * )
 */
export default class Request {
  constructor(options) {
    this.apiKey = options['apiKey']
    this.apiUrl = options['apiUrl']
  }

  /**
   * Makes an asynchronous API call to TallyGo's Navigation Service
   *
   * @param {Object} params set of request parameters
   * @param {Array} params.startPoint Latitude, longitude pair: [33.05,-188.04].
   * @param {Array} params.endPoint Latitude, longitude pair: [33.25,-188.93].
   * @param {string} [params.requestType=DepartureTime] One of {ArrivalTime, DepartureTime}.
   * @param {string} [params.time=Date.now()] The desired arrival or departure time. If no parameter is given, the current time will be used.
   *    The string must be formatted as yyyy-mm-ddThh:mm:ss[[-+][0-9]{2-4}]?
   *    Examples: UTC: 2018-12-12T12:10:34Z or with UTC offset: 2018-12-12T04:10:34-0800
   * @param {number} [params.course=0] Compass bearing travelled by the user.
   * @param {number} [params.speed=0] The speed of the client in meters per second.
   * @param {boolean} [params.useCarpoolLanes=false] Whether the route may include carpool lanes.
   * @param {boolean} [params.useExpressLanes=false] Whether the route may include express lanes.
   * @returns {Promise} Will return a response when the Promise is resolved.
   */
  get(params) {
    return fetch(this.buildUrl(params)).then(response => response.json())
  }

  getTime(params) {
    if (params['time'] !== undefined) return params['time']
    let date = new Date(Date.now())
    return ISODateString(date)
  }

  buildUrl(params) {
    let timeParam = this.getTime(params)
    let extendedParams = extend({time: timeParam}, RequestDefaultParams, params)
    let urlParams = {
      apiKey: this.apiKey,
      coords: this._toCoordsString(extendedParams)
    }

    Object.keys(RequestPermittedParams).forEach((key) => {
      urlParams[key] = extendedParams[key]
    })

    return this.apiUrl + '?' + this._toQueryString(urlParams)
  }

  _toQueryString(params) {
    return Object.keys(params).map((key) => {
      return encodeURIComponent(key) + '=' + encodeURIComponent(params[key])
    }).join('&')
  }

  _toCoordsString(params) {
    return params.startPoint.join(',') + ';' + params.endPoint.join(',')
  }
}
