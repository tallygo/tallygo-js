/**
 * Given a destination object and optionally many source objects,
 * copy all properties from the source objects into the destination.
 * The last source object given overrides properties from previous
 * source objects.
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

export function styleUrl(options) {
  return `https://${options.styleHost}/map-style.json?traffic=${options.traffic}&apiKey=${options.apiToken}`
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

export function setHeightStyle(container) {
  document.documentElement.style.height = '100%'
  document.body.style.height = '100%'
  document.body.style.margin = 0
  container.style.height = '100%'
}
