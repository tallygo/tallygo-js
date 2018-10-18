import * as mapboxgl from 'mapbox-gl'

import RouteSegment from './routeSegment'

const colorChart = [
  '#000000', '#cc0000',
  '#ff0000', '#ff8800',
  '#dddd00', '#B2EE0D',
  '#00ff00', '#00ff00',
  '#33FFCC'
]

export default class Route {
  constructor(data) {
    this.duration = data.duration
    this.segments = data.routeSegments.map(function(segmentData) {
      return new RouteSegment(segmentData)
    })
    this.originalEndNode = data.originalEndNode
    this.originalStartNode = data.originalStartNode
    this.distance = data.distance
    this.firstSegment = this.segments[0]
    this.lastSegment = this.segments[this.segments.length - 1]
  }

  startLonLat() {
    return this.firstSegment.startLonLat()
  }

  endLonLat() {
    return this.lastSegment.endLonLat()
  }

  buildPoints(firstSegPoints) {
    let points = {
      'type': 'FeatureCollection',
      'features': []
    }
    // firstSegPoints.forEach(function (d, i) {
    /// / bearing; not available for the last point
    // var bearing
    // if (i + 1 < firstSegPoints.length) {
    // var curr = new google.maps.LatLng(d.lat, d.lon)
    // var next = firstSegPoints[i + 1]
    // next = new google.maps.LatLng(next.lat, next.lon)
    // bearing = google.maps.geometry.spherical.computeHeading(curr, next)
    // bearing = Math.round(360.0 + bearing) % 360
    // }

    // var locationHTML = '@ ' + d.lat + ',' + d.lon + ' Bearing: ' + bearing + '°'
    // if (d.edge) {
    // locationHTML += ' Way: ' + d.edge
    // }
    // if (d.node) {
    // locationHTML += ' Node: ' + d.node
    // }

    // var streetViewUrl = 'https://maps.googleapis.com/maps/api/streetview?key=AIzaSyC9AjQpIuwBbCbKWbySueWK6XqX5_F57u0&size=640x480&location=' + d.lat + ',' + d.lon + '&heading=' + bearing
    // var popupHTML = '<img src=' + streetViewUrl + ' id="street-view-image"  width="640" height="480" referrerpolicy="no-referrer" />'
    // popupHTML += locationHTML

    // var p = {
    // 'type': 'Feature',
    // 'geometry': {
    // 'type': 'Point',
    // 'coordinates': [d.lon, d.lat]
    // },
    // 'properties': {
    /// / sayPoints and turnPoints should have the same value
    /// / here; unlike in featureIndex set by self.addLayer; this
    /// / is to navigate trough points with j/k keys
    // 'pointFeatureIndex': i,
    // 'icon': 'veterinary',
    // 'node': d.node,
    // 'edge': d.edge,
    // 'bearing': bearing,
    // 'say': d.say,
    // 'turn': d.turn,
    // 'kilometers': parseInt(d.d),
    // 'seconds': parseInt(d.t),
    // 'popupHTML': popupHTML,
    // 'hoverHTML': locationHTML
    // }
    // }
    // points.features.push(p)
    // })
    return points
  }

  buildSayPoints(points) {
    let sayPoints = {
      'type': 'FeatureCollection',
      'features': []
    }

    sayPoints.features = points.features.reduce(function (acc, f) {
      if (!f.properties.say) {
        return acc
      }
      f.properties.popupHTML += '<br>Say: ' + f.properties.say
      f.properties.hoverHTML += '<br>Say: ' + f.properties.say
      acc.push(f)
      return acc
    }, [])

    return sayPoints
  }

  buildTurnPoints(points) {
    let turnPoints = {
      'type': 'FeatureCollection',
      'features': []
    }

    turnPoints.features = points.features.reduce(function (acc, f) {
      if (!f.properties.turn) {
        return acc
      }
      var html = '<br>Turn:<pre>' + JSON.stringify(f.properties.turn, null, 4) + '</pre>'
      f.properties.popupHTML += html
      f.properties.hoverHTML += html
      acc.push(f)
      return acc
    }, [])

    return turnPoints
  }

  assignLineColors(points) {
    let lineColors = []
    let lastColor
    lastColor = '#000000'
    points.features.slice(1).forEach(function (p, i) {
      if (p.kilometers !== 0 && p.seconds !== 0) {
        var miles = p.properties.kilometers / 1609.34
        var hours = p.properties.seconds / 3600
        var mph = miles / hours
        lastColor = colorChart[Math.min(colorChart.length - 1, Math.round(mph / 10))]
        if (lastColor === undefined) lastColor = '#000000'
      }
      lineColors.push(lastColor)
    })
    return lineColors
  }

  assignMultiLines(points, lineColors) {
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
    let lastColor = lineColors[0]
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

  drawStartEnd(map) {
    map.removeLayer('startEnd')

    let points = {
      'type': 'FeatureCollection',
      'features': []
    }

    points.features.push({
      'type': 'Feature',
      'geometry': {
        'type': 'Point',
        'coordinates': this.startLonLat()
      },
      'properties': {
        'icon': 'marker-green',
        'text': 'Start'
      }
    })

    points.features.push({
      'type': 'Feature',
      'geometry': {
        'type': 'Point',
        'coordinates': this.endLonLat
      },
      'properties': {
        'icon': 'marker-red',
        'text': 'End'
      }
    })

    map.addLayer({
      'id': 'startEnd',
      'type': 'symbol',
      'source': {
        'type': 'geojson',
        'data': points
      },
      'layout': {
        'icon-image': '{icon}',
        'icon-offset': [0, -16]
      }
    })
  }

  drawTallyGoRoute(map) {
    map.resetLayers()
    this.drawStartEnd(map)

    let points = this.buildPoints(this.routeSegments[0].points)
    let sayPoints = this.buildSayPoints(points)
    let turnPoints = this.buildTurnPoints(points)
    let lineColors = this.assignLineColors(points)
    let multiLines = this.assignMultiLines(points, lineColors)

    // add lines layers
    for (let color in multiLines) {
      var line = multiLines[color]
      map.addLayer({
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
      })
    }

    // add points layer
    map.addLayer({
      'id': 'points',
      'type': 'circle',
      'source': {
        'type': 'geojson',
        'data': points
      },
      'layout': {},
      'paint': {
        'circle-radius': 4,
        'circle-opacity': {
          'stops': [
            [15, 0],
            [15.0, 0.3]
          ]
        }
      }
    })

    // add sayPoints
    map.addLayer({
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
    })

    // add turnPoints
    map.addLayer({
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
    })

    // Zoom map to the route.
    // https://www.mapbox.com/mapbox-gl-js/example/zoomto-linestring/
    var coordinates = points.features.map(function (p) {
      return p.geometry.coordinates
    })
    var bounds = coordinates.reduce(function(bounds, coord) {
      return bounds.extend(coord)
    }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]))
    map.fitBounds(bounds, {
      padding: 20
    })

    // update the summary
    // let minutes = Math.round(route.duration / 6) / 10 + ' mins'
    // let miles = Math.round(route.distance / 160.9344) / 10 + ' miles'
    // TODO: remove jquery dependency and extract function
    // let routeInfo = $('#route-info')
    // routeInfo.find('.server' + (serverID + 1)).show()
    // routeInfo.find('.server' + (serverID + 1) + ' .travel-time').text(minutes)
    // routeInfo.find('.server' + (serverID + 1) + ' .travel-distance').text(miles)
  }
}
