// @flow
/* eslint valid-jsdoc: ["error", { "requireParamDescription": false }] */

import mapboxgl from 'mapbox-gl'
import RoutePresenter from './routePresenter'

import {
  getElement,
  setHeightStyle,
  styleUrl
} from './utils'

/**
 * The `Map` object represents the map on the page. It is thin
 * wrapper around a mapbox-gl js Map object
 *
 * You create a `Map` by specifying a `container` and other options.
 *
 * @param {Object} options
 * @param {HTMLElement|string} options.container The HTML element in which the map will be rendered, or the element's string `id`. The specified element must have no children.
 * @param {Object|string} [options.styleHost] The hostname where the style Object spec can be accessed.
 *
 * @param {boolean} [options.hash=true] If `true`, the map's position (zoom, center latitude, center longitude, bearing, and pitch) will be synced with the hash fragment of the page's URL.
 *   For example, `http://path/to/my/page.html#2.59/39.26/53.07/-24.1/60`.
 * @param {LngLatLike} [options.center=[0, 0]] The inital geographical centerpoint of the map. If `center` is not specified in the constructor options, Mapbox GL JS will look for it in the map's style object. If it is not specified in the style, either, it will default to `[0, 0]` Note: Mapbox GL uses longitude, latitude coordinate order (as opposed to latitude, longitude) to match GeoJSON.
 * @param {number} [options.zoom=0] The initial zoom level of the map. If `zoom` is not specified in the constructor options, Mapbox GL JS will look for it in the map's style object. If it is not specified in the style, either, it will default to `0`.
 *
 * @example
 * var map = new TallyGo.Map({
 *   container: 'map',
 *   center: [-95.84, 37.78],
 *   hash: true,
 *   styleHost: 'maptiles.tallygo.com',
 *   traffic: 0,
 *   zoom: 4
 * })
 */
export default class Map {
  constructor(options) {
    options['container'] = getElement(options.container)
    options['style'] = styleUrl(options)
    setHeightStyle(options.container)

    this.glMap = new mapboxgl.Map(options)
    if (options.navPosition !== undefined) {
      let nav = new mapboxgl.NavigationControl()
      this.glMap.addControl(nav, options.navPosition)
    }
    this.routePresenter = new RoutePresenter(this.glMap)
  }

  /**
   * Draws routes on this map.
   * Waits for the mapboxgl.Map 'load' event to fire.
   *
   * @param {Array} routes sequence of Route objects: [Route]
   * @returns {Map} this
   */
  draw(routes) {
    let routePresenter = this.routePresenter
    this.glMap.on('load', function() {
      routePresenter.draw(routes[0])
    })
    return this
  }
}
