// @flow
/* eslint valid-jsdoc: ["error", { "requireParamDescription": false }] */

// FIXME: doesn't work with jest-fetch-mock
// import fetch from 'unfetch'
import { permittedParams } from './constants'

/**
 * The `Request` object holds the default request parameters as well as the
 * apiToken
 *
 * You create a `Request` by specifying at least an `apiToken`.
 *
 * @param {Object} options
 * @param {HTMLElement|string} options.apiToken The client's apiToken.
 * @returns {Request} request object
 *
 * @example
 * let request = new Tallygo.Request({
 *   apiToken: '<Client Api Token>'
 * })
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
   * @param {Object} params set of request params
   * @returns {Promise} returns a promise
   */
  get(params) {
    return fetch(this.buildUrl(params)).then(response => response.json())
  }

  buildUrl(params) {
    let urlParams = {
      apiKey: this.apiKey,
      coords: this._toCoordsString(params),
      partitionHeuristic: false
    }

    Object.keys(permittedParams).forEach((key) => {
      urlParams[key] = params[key]
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
