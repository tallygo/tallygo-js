import mapboxgl from 'mapbox-gl'

const colorChart = [
  '#000000', '#cc0000',
  '#ff0000', '#ff8800',
  '#dddd00', '#B2EE0D',
  '#00ff00', '#00ff00',
  '#33FFCC'
]

export default class RoutePresenter {
  constructor(map, route) {
    this.map = map.glMap
    this.route = route
    this.geojson = {}
    this.popupLayers = []
  }

  resetLayers() {
    Object.keys(this.geojson).forEach(function (id, i) {
      this.removeLayer(id)
      this.removeSource(id)
    })
    this.geojson = {}
    this.popupLayers = []
  }

  removeLayer(id) {
    if (!this.geojson.hasOwnProperty(id)) { return }
    delete this.geojson[id]

    if (this.map.getLayer(id) !== undefined) { this.map.removeLayer(id) }

    // when layer is removed the resource associated with it remains
    this.map.removeSource(id)

    let index
    while ((index = this.popupLayers.indexOf(id)) >= 0) {
      this.popupLayers.splice(index, 1)
    }
  }

  // addLayer adds layer and registers its ID, which is then used by
  // resetLayers. It assumes that layer's source data is of type geojson.
  addLayer(layer) {
    // capture data here to eventually store it later; Map.addLayer mutates
    // layer object
    let data = layer.source.data

    if (data.type === 'FeatureCollection') {
      data.features.forEach(function (f, i) {
        f.properties.featureIndex = i
        f.properties.layer = layer.id
      })
    }

    if (this.map.getLayer('startEnd') === undefined) {
      this.map.addLayer(layer)
    } else {
      this.map.addLayer(layer, 'startEnd')
    }

    this.geojson[layer.id] = data
    if (layer.id.startsWith('points-')) {
      this.popupLayers.push(layer.id)
    }
  }

  drawStartEnd() {
    this.removeLayer('startEnd')

    const points = {
      'type': 'FeatureCollection',
      'features': []
    }

    points.features.push({
      'type': 'Feature',
      'geometry': {
        'type': 'Point',
        'coordinates': this.route.startLonLat()
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
        'coordinates': this.route.endLonLat()
      },
      'properties': {
        'icon': 'marker-red',
        'text': 'End'
      }
    })

    this.addLayer({
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

  buildPoints() {
    return {
      'type': 'FeatureCollection',
      'features': this.route.firstSegment.points.map(function (d, i) {
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

  buildSayPoints(points) {
    return {
      'type': 'FeatureCollection',
      'features': points.features.reduce(function (acc, f) {
        if (!f.properties.say) { return acc }
        // f.properties.popupHTML += '<br>Say: ' + f.properties.say
        f.properties.hoverHTML += '<br>Say: ' + f.properties.say
        acc.push(f)
        return acc
      }, [])
    }
  }

  buildTurnPoints(points) {
    return {
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
  }

  assignLineColors(points) {
    let lastColor = '#000000'
    return points.features.slice(1).map(function (p, i) {
      if (p.kilometers !== 0 && p.seconds !== 0) {
        let miles = p.properties.kilometers / 1609.34
        let hours = p.properties.seconds / 3600
        let mph = miles / hours
        lastColor = colorChart[Math.min(colorChart.length - 1, Math.round(mph / 10))]
        if (lastColor === undefined) lastColor = '#000000'
      }
      return lastColor
    })
  }

  assignMultiLines(points, lineColors) {
    // MultiLine strings are created per color to reduce amount of layers
    // created. This improves performance A LOT.
    const multiLines = {} // by color
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

  draw() {
    this.resetLayers()
    this.drawStartEnd()

    const points = this.buildPoints(this.route.routeSegments[0].points)
    const sayPoints = this.buildSayPoints(points)
    const turnPoints = this.buildTurnPoints(points)
    const lineColors = this.assignLineColors(points)
    const multiLines = this.assignMultiLines(points, lineColors)

    // add lines layers
    for (let color in multiLines) {
      let line = multiLines[color]
      this.addLayer({
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

    this.addLayer({
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

    this.addLayer({
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

    this.addLayer({
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
    const coordinates = points.features.map(function (p) {
      return p.geometry.coordinates
    })
    const bounds = coordinates.reduce(function(bounds, coord) {
      return bounds.extend(coord)
    }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]))
    this.map.fitBounds(bounds, {
      padding: 20
    })

    // update the summary
    // const minutes = Math.round(route.duration / 6) / 10 + ' mins'
    // const miles = Math.round(route.distance / 160.9344) / 10 + ' miles'
    // TODO: remove jquery dependency and extract function
    // const routeInfo = $('#route-info')
    // routeInfo.find('.server' + (serverID + 1)).show()
    // routeInfo.find('.server' + (serverID + 1) + ' .travel-time').text(minutes)
    // routeInfo.find('.server' + (serverID + 1) + ' .travel-distance').text(miles)
  }
}
