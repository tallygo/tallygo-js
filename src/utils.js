import { STYLE_DEFAULTS } from './constants'

/**
 * Given a destination object and optionally many source objects,
 * copy all properties from the source objects into the destination.
 * The last source object given overrides properties from previous
 * source objects. Undefined objects will be removed from the sources.
 *
 * @param {Object} dest destination object
 * @param {Array|Object} sources objects with properties that will be added to destination object
 * @return {Object} destination object
 * @private
 */
export function extend(dest, ...sources) {
  sources.filter((source) => {
    return source !== undefined
  }).forEach(function(src) {
    Object.keys(src).forEach(function(key) {
      dest[key] = src[key]
    })
  })
  return dest
}

/**
 * Enables the usage of custom Mapbox Style Specification objects with TallyGo-JS library.
 * Can accept a URL string, a Mapbox Style JSON object or a URL object along with an ApiKey
 * value that can be used to customize some or all parts of the TallyGo Mapbox Style object URL.
 * For more info see: https://www.mapbox.com/mapbox-gl-js/api/#map
 *
 * @param {string|Object} style The map's Mapbox style. Either a JSON object, or a URL given as a string, or a URL Object
 * @param {string} apiKey In the case where the 'style' param is a URL object this will be appended to the URL query string
 * @return {string|Object} Either a JSON object conforming to the Mapbox Style Specification, or a URL to such.
 * @private
 */
export function getStyle(style, apiKey) {
  if (typeof style === 'string') {
    return style // Style is a URL
  } else if (typeof style === 'object' && style.hasOwnProperty('sources')) {
    return style // Style is a JSON object conforming to Mapbox Style Spec
  }
  return getStyleUrl( // Style is a URL to a TallyGo hosted Mapbox Style Spec object
    extend({apiKey: apiKey}, STYLE_DEFAULTS, style)
  )
}

export function getStyleUrl(options) {
  return `${options.protocol}://${options.host}/${options.path}?traffic=${options.traffic}&apiKey=${options.apiKey}`
}

export function getElement(container) {
  let _container
  if (typeof container === 'string') {
    _container = window.document.getElementById(container)
    if (!_container) {
      throw new Error(`Container '${container}' not found.`)
    }
  } else if (container instanceof HTMLElement) {
    _container = container
  } else {
    throw new Error(`Invalid type: 'container' must be a String or HTMLElement.`)
  }
  return _container
}

export function objectFetch(object, key) {
  if (object !== undefined && object.hasOwnProperty(key)) return object[key]
  return undefined
}

export function loadJSON(path, callback) {
  var xobj = new XMLHttpRequest()
  xobj.overrideMimeType('application/json')
  xobj.open('GET', path, true)
  xobj.onreadystatechange = function () {
    if (xobj.readyState === 4 && xobj.status === 200) {
      callback(xobj.responseText)
    }
  }
  xobj.send(null)
}

export function setHeightStyle(container) {
  document.documentElement.style.height = '100%'
  document.body.style.height = '100%'
  document.body.style.margin = 0
  container.style.height = '100%'
}
