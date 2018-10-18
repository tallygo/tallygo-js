// @flow

import * as mapboxgl from 'mapbox-gl'

import {
  extend,
  getElement,
  setHeightStyle,
  styleUrl
} from './utils'

const defaultOptions = {
  center: [-95.84, 37.78],
  hash: true,
  styleHost: 'maptiles-stg.tallygo.com',
  traffic: 0,
  zoom: 4
}

/**
 * The `Map` object represents the map on your page. It is thin
 * wrapper around a mapbox-gl js Map object
 *
 * You create a `Map` by specifying a `container` and other options.
 *
 * @extends mapboxgl Map
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
 * var map = new tallyGoKit.Map({
 *   container: 'map',
 *   center: [-95.84, 37.78],
 *   hash: true,
 *   styleHost: 'maptiles-stg.tallygo.com',
 *   traffic: 0,
 *   zoom: 4
 * })
 */

export default class Map extends mapboxgl.Map {
  constructor(options) {
    options = extend({}, defaultOptions, options)
    options['container'] = getElement(options.container)
    options['style'] = styleUrl(options)
    setHeightStyle(options.container)

    super(options)
    this.geojson = {}
    this.popupLayers = []
  }

  // clear clears all layers and sources added by addLayer
  resetLayers() {
    // Object.keys(this.geojson).forEach(function (id, i) {
    //   this.removeLayer(id)
    //   this.removeSource(id)
    // })
    this.geojson = {}
    this.popupLayers = []
  }

  // addLayer adds layer and registers its ID, which is then used by
  // resetLayers. It assumes that layer's source data is of type geojson.
  addLayer(layer) {
    // capture data here to eventually store it later; Map.addLayer mutates
    // layer object
    var data = layer.source.data

    if (data.type === 'FeatureCollection') {
      // data.features.forEach(function (f, i) {
      //   f.properties.featureIndex = i
      //   f.properties.layer = layer.id
      // })
    }

    if (this.getLayer('startEnd') === undefined) {
      // TODO: resolve conflict with mapboxgl.Map function with same name
      // TODO: Otherwise this will result in a recursive call :(
      this.addLayer(layer)
    } else {
      this.addLayer(layer, 'startEnd')
    }

    this.geojson[layer.id] = data
    if (layer.id.startsWith('points-')) {
      this.popupLayers.push(layer.id)
    }
  }

  removeLayer(id) {
    if (!this.geojson.hasOwnProperty(id)) {
      return
    }
    delete this.geojson[id]

    if (this.getLayer(id) !== undefined) {
      // TODO: resolve conflict with mapboxgl.Map function with same name
      // TODO: Otherwise this will result in a recursive call :(
      this.removeLayer(id)
    }

    // when layer is removed the resource associated with it remains
    this.removeSource(id)

    let i
    while ((i = this.popupLayers.indexOf(id)) >= 0) {
      this.popupLayers.splice(i, 1)
    }
  }
}
