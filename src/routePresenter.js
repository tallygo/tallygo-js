import mapboxgl from 'mapbox-gl'
import LayerCollection from './layerCollection'

export default class RoutePresenter {
  constructor(map) {
    this.map = map
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
    // Mapboxgl.Map used
    //
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
    // Mapboxgl.Map used
    //
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

  drawStartEnd(route) {
    this.removeLayer('startEnd')

    const points = {
      'type': 'FeatureCollection',
      'features': []
    }

    points.features.push({
      'type': 'Feature',
      'geometry': {
        'type': 'Point',
        'coordinates': route.startLonLat()
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
        'coordinates': route.endLonLat()
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

  _draw(route) {
    // Mapboxgl.Map used
    // TallygoRoute used
    //
    this.resetLayers()
    this.drawStartEnd(route)

    const layerCollection = new LayerCollection(route)

    // add lines layers
    for (let color in layerCollection.multiLines) {
      let line = layerCollection.multiLines[color]
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
        'data': layerCollection.points
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
        'data': layerCollection.sayPoints
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
        'data': layerCollection.turnPoints
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

    this.zoom(layerCollection.points)

    // update the summary
    // const minutes = Math.round(route.duration / 6) / 10 + ' mins'
    // const miles = Math.round(route.distance / 160.9344) / 10 + ' miles'
    // TODO: remove jquery dependency and extract function
    // const routeInfo = $('#route-info')
    // routeInfo.find('.server' + (serverID + 1)).show()
    // routeInfo.find('.server' + (serverID + 1) + ' .travel-time').text(minutes)
    // routeInfo.find('.server' + (serverID + 1) + ' .travel-distance').text(miles)
  }

  zoom(points) {
    // Zoom map to the route.
    // https://www.mapbox.com/mapbox-gl-js/example/zoomto-linestring/
    const coordinates = points.features.map(
      (p) => { return p.geometry.coordinates }
    )
    const bounds = coordinates.reduce(
      (bounds, coord) => { return bounds.extend(coord) },
      new mapboxgl.LngLatBounds(coordinates[0], coordinates[0])
    )

    this.map.fitBounds(bounds, {padding: 20})
  }

  draw(route) {
    this._draw(route)
  }
}
