import { extend } from './utils'

const colorChart = [
  '#000000', '#cc0000',
  '#ff0000', '#ff8800',
  '#dddd00', '#B2EE0D',
  '#00ff00', '#00ff00',
  '#33FFCC'
]

const vehicleLayerDefaultOptions = {
  id: 'vehicle-point',
  iconImage: 'airport-15',
  initialCoordinates: [0, 0]
}

function calculateLastColor(mph) {
  return colorChart[Math.min(colorChart.length - 1, Math.round(mph / 10))]
}

export function vehiclePointLayer(options) {
  options = extend({}, vehicleLayerDefaultOptions, options)
  return {
    'id': options.id,
    'type': 'symbol',
    'source': {
      'type': 'geojson',
      'data': {
        'type': 'FeatureCollection',
        'features': [{
          'type': 'Feature',
          'properties': {},
          'geometry': {
            'type': 'Point',
            'coordinates': options.initialCoordinates
          }
        }]
      }
    },
    'layout': {
      'icon-image': options.iconImage,
      'icon-rotate': ['get', 'bearing'],
      'icon-rotation-alignment': 'map',
      'icon-allow-overlap': true,
      'icon-ignore-placement': true
    }
  }
}

export function startEndLayer(start, end) {
  return {
    'id': 'startEnd',
    'type': 'circle',
    'source': {
      'type': 'geojson',
      'data': {
        'type': 'FeatureCollection',
        'features': [
          {
            'type': 'Feature',
            'geometry': {'type': 'Point', 'coordinates': start},
            'properties': {'color': '#008000', 'text': 'Start'}
          },
          {
            'type': 'Feature',
            'geometry': {'type': 'Point', 'coordinates': end},
            'properties': {'color': '#FF0000', 'text': 'End'}
          }
        ]
      }
    },
    'paint': {
      'circle-radius': {
        'base': 6,
        'stops': [[7, 3], [10, 6], [22, 44]]
      },
      'circle-color': {type: 'identity', property: 'color'}
    }
  }
}

export function pointLayer(points) {
  return {
    'id': 'points',
    'type': 'circle',
    'source': {'type': 'geojson', 'data': points},
    'layout': {},
    'paint': {
      'circle-radius': 4,
      'circle-opacity': {'stops': [[15, 0], [15.0, 0.3]]}
    }
  }
}

export function buildRouteLine(points, lineColor) {
  return {
    'id': 'line-' + lineColor,
    'type': 'line',
    'source': {
      'type': 'geojson',
      'data': {
        'type': 'Feature',
        'properties': {},
        'geometry': {
          'type': 'LineString',
          'coordinates': points.features.map((point) => { return point.geometry.coordinates })
        }
      }
    },
    'layout': {
      'line-join': 'round',
      'line-cap': 'round'
    },
    'paint': {
      'line-color': lineColor,
      'line-width': {
        'base': 5,
        'stops': [[7, 3], [10, 5], [22, 44]]
      }
    }
  }
}

export function buildMultiLines(points) {
  let lastColor = '#000000'
  let lineColors = points.features.slice(1).map(function (p, i) {
    if (p.kilometers !== 0 && p.seconds !== 0) {
      let miles = p.properties.kilometers / 1609.34
      let hours = p.properties.seconds / 3600
      lastColor = calculateLastColor((miles / hours))
      if (lastColor === undefined) lastColor = '#000000'
    }
    return lastColor
  })
  // MultiLine strings are created per color to reduce amount of layers
  // created. This improves performance A LOT.
  let multiLines = {} // by color
  colorChart.forEach(function (c, i) {
    multiLines[c] = {
      'type': 'Feature',
      'geometry': {
        'type': 'MultiLineString',
        'coordinates': []
      },
      'properties': {
        'color': c
      }
    }
  })

  let coords = [points.features[0].geometry.coordinates]
  lastColor = lineColors[0]
  points.features.slice(1).forEach(function (p, i) {
    coords.push(p.geometry.coordinates)
    var currColor = lineColors[i + 1]
    if (lastColor !== currColor) {
      multiLines[lastColor].geometry.coordinates.push(coords)
      coords = [p.geometry.coordinates]
    }
    lastColor = currColor
  })
  return multiLines
}

export function coloredLineLayer(points) {
  let multiLines = buildMultiLines(points)
  return Object.entries(multiLines).map(
    ([color, line]) => {
      return {
        'id': 'line-' + color,
        'type': 'line',
        'source': {
          'type': 'geojson',
          'data': line
        },
        'layout': {
          'line-join': 'round',
          'line-cap': 'round'
        },
        'paint': {
          'line-color': color,
          'line-width': 10
        }
      }
    }
  )
}

export function pointSayLayer(points) {
  let sayPoints = {
    'type': 'FeatureCollection',
    'features': points.features.reduce(function (acc, f) {
      if (!f.properties.say) { return acc }
      f.properties.hoverHTML += '<br>Say: ' + f.properties.say
      acc.push(f)
      return acc
    }, [])
  }
  return {
    'id': 'points-say',
    'type': 'symbol',
    'source': {
      'type': 'geojson',
      'data': sayPoints
    },
    'layout': {
      'icon-image': 'speech',
      'icon-size': 1,
      'icon-allow-overlap': true,
      'icon-ignore-placement': true,
      'icon-padding': 0,
      'icon-offset': [12, -10],
      'text-field': '{text}',
      'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
      'text-offset': [0, 0.6],
      'text-anchor': 'top'
    }
  }
}

export function pointTurnLayer(points) {
  let turnPoints = {
    'type': 'FeatureCollection',
    'features': points.features.reduce(function (acc, f) {
      if (!f.properties.turn) { return acc }
      let html = '<br>Turn:<pre>' + JSON.stringify(f.properties.turn, null, 4) + '</pre>'
      // f.properties.popupHTML += html
      f.properties.hoverHTML += html
      acc.push(f)
      return acc
    }, [])
  }
  return {
    'id': 'points-turn',
    'type': 'symbol',
    'source': {
      'type': 'geojson',
      'data': turnPoints
    },
    'layout': {
      'icon-image': 'marker-blue',
      'icon-size': {
        'base': 0.7,
        'stops': [[12, 0.80], [22, 1]]
      },
      'icon-allow-overlap': true,
      'icon-ignore-placement': true,
      'icon-padding': 0,
      'icon-offset': [0, -16]
    }
  }
}

export function pointCollection(points) {
  return {
    'type': 'FeatureCollection',
    'features': points.map(function (d, i) {
      // bearing; not available for the last point
      // TODO: replace google.maps functions
      // let bearing
      // if (i + 1 < firstSegPoints.length) {
      //   let curr = new google.maps.LatLng(d.lat, d.lon)
      //   let next = firstSegPoints[i + 1]
      //   next = new google.maps.LatLng(next.lat, next.lon)
      //   bearing = google.maps.geometry.spherical.computeHeading(curr, next)
      //   bearing = Math.round(360.0 + bearing) % 360
      // }

      let locationHTML = '@ ' + d.lat + ',' + d.lon // + ' Bearing: ' + bearing + '°'
      if (d.edge) {
        locationHTML += ' Way: ' + d.edge
      }
      if (d.node) {
        locationHTML += ' Node: ' + d.node
      }

      // let streetViewUrl = 'https://maps.googleapis.com/maps/api/streetview?key=AIzaSyC9AjQpIuwBbCbKWbySueWK6XqX5_F57u0&size=640x480&location=' + d.lat + ',' + d.lon + '&heading=' + bearing
      // let popupHTML = '<img src=' + streetViewUrl + ' id="street-view-image"  width="640" height="480" referrerpolicy="no-referrer" />'
      // popupHTML += locationHTML

      return {
        'type': 'Feature',
        'geometry': {
          'type': 'Point',
          'coordinates': [d.lon, d.lat]
        },
        'properties': {
          'pointFeatureIndex': i,
          'icon': 'veterinary',
          'node': d.node,
          'edge': d.edge,
          // 'bearing': bearing,
          'say': d.say,
          'turn': d.turn,
          'kilometers': parseInt(d.d),
          'seconds': parseInt(d.t),
          // 'popupHTML': popupHTML,
          'hoverHTML': locationHTML
        }
      }
    })
  }
}
