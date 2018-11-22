import { colorChart } from './constants'

export default class LayerCollection extends Array {
  constructor(route) {
    super()
    let calculateLastColor = (mph) => {
      return colorChart[Math.min(colorChart.length - 1, Math.round(mph / 10))]
    }
    this.points = {
      'type': 'FeatureCollection',
      'features': route.firstSegment.points.map(function (d, i) {
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
    this.sayPoints = {
      'type': 'FeatureCollection',
      'features': this.points.features.reduce(function (acc, f) {
        if (!f.properties.say) { return acc }
        f.properties.hoverHTML += '<br>Say: ' + f.properties.say
        acc.push(f)
        return acc
      }, [])
    }
    this.turnPoints = {
      'type': 'FeatureCollection',
      'features': this.points.features.reduce(function (acc, f) {
        if (!f.properties.turn) { return acc }
        let html = '<br>Turn:<pre>' + JSON.stringify(f.properties.turn, null, 4) + '</pre>'
        // f.properties.popupHTML += html
        f.properties.hoverHTML += html
        acc.push(f)
        return acc
      }, [])
    }
    let lastColor = '#000000'
    let lineColors = this.points.features.slice(1).map(function (p, i) {
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

    let coords = [this.points.features[0].geometry.coordinates]
    lastColor = lineColors[0]
    this.points.features.slice(1).forEach(function (p, i) {
      coords.push(p.geometry.coordinates)
      var currColor = lineColors[i + 1]
      if (lastColor !== currColor) {
        multiLines[lastColor].geometry.coordinates.push(coords)
        coords = [p.geometry.coordinates]
      }
      lastColor = currColor
    })
    this.multiLines = multiLines
  }
}
