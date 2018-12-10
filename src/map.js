// @flow
/* eslint valid-jsdoc: ["error", { "requireParamDescription": false }] */

import mapboxgl from 'mapbox-gl'
import LayerCollection from './layerCollection'
import { getElement, setHeightStyle } from './utils'

/**
 * The `Map` object represents the map on the page. It is thin
 * wrapper around a mapbox-gl js Map object
 *
 * You create a `Map` by specifying a `container` and other options. See the mapboxgl-js API for a list of complete options:
 * [https://www.mapbox.com/mapbox-gl-js/api/#map](https://www.mapbox.com/mapbox-gl-js/api/#map)
 *
 * @param {Object} options
 * @param {HTMLElement|string} options.container The HTML element in which the map will be rendered, or the element's string `id`. The specified element must have no children.
 * @param {Object|string} [options.style] The map's Mapbox style. This must be an a JSON object conforming to the schema described in the Mapbox Style Specification , or a URL to such JSON
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
 *   zoom: 4
 * })
 */
export default class Map {
  constructor(options) {
    setHeightStyle(getElement(options.container))

    this.glMap = new mapboxgl.Map(options)
    if (options.navPosition !== undefined) {
      let nav = new mapboxgl.NavigationControl()
      this.glMap.addControl(nav, options.navPosition)
    }
    this.geojson = {}
  }

  resetLayers() {
    Object.keys(this.geojson).forEach(function (id, i) {
      this.removeLayer(id)
      this.removeSource(id)
    })
    this.geojson = {}
  }

  removeLayer(id) {
    if (!this.geojson.hasOwnProperty(id)) { return }
    delete this.geojson[id]

    if (this.glMap.getLayer(id) !== undefined) { this.glMap.removeLayer(id) }

    // Remove the resource associated with the layer.
    this.glMap.removeSource(id)
  }

  addLayer(layer) {
    // addLayer adds layer and registers its ID, which is then used by
    // resetLayers. It assumes that layer's source data is of type geojson.
    // capture data here to eventually store it later; Map.addLayer mutates
    // layer object
    let data = layer.source.data

    if (data.type === 'FeatureCollection') {
      data.features.forEach(function (f, i) {
        f.properties.featureIndex = i
        f.properties.layer = layer.id
      })
    }

    if (this.glMap.getLayer('startEnd') === undefined) {
      this.glMap.addLayer(layer)
    } else {
      this.glMap.addLayer(layer, 'startEnd')
    }

    this.geojson[layer.id] = data
  }

  boundsFor(coordinates) {
    return coordinates.reduce(
      (bounds, coord) => { return bounds.extend(coord) },
      new mapboxgl.LngLatBounds(coordinates[0], coordinates[0])
    )
  }

  zoom(coordinates, options) {
    this.glMap.fitBounds(
      this.boundsFor(coordinates), options
    )
  }

  /**
   * Draw routes on this map.
   * Waits for the mapboxgl.Map 'load' event to fire.
   *
   * @param {Array} routes sequence of Route objects: [Route]
   * @returns {Map} this
   */
  draw(routes) {
    this.resetLayers()
    let route = routes[0]
    let self = this
    let layers = new LayerCollection(route)

    this.glMap.on('load', function() {
      layers.forEach((layer) => { self.addLayer(layer) })
      self.zoom(route.coordinates(), {padding: 20})
    })
    return this
  }
}
