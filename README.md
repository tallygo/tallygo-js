TallyGo-JS [![Build Status](https://travis-ci.org/tallygo/tallygo-js.svg?branch=master)](https://travis-ci.org/tallygo/tallygo-js)
======

TallyGo navigation API wrapper in Javascript. Also features component to animate iOS and Android client location updates on a map.

Quick start
----

Install via npm:

    npm install tallygo-js
    yarn add tallygo-js

Or as a script tag:

```html
<script src="https://unpkg.com/tallygo-js@1.0.3/dist/tallygo.min.js"></script>
```

See the examples directory for browser usage.


API
---
```js
const TallyGo = require('tallygo-js');
const tallygo = TallyGo.configure({apiKey: '<YOUR API KEY>'})

const requestOptions = {
  startPoint: [34.76151710, -112.05714849],
  endPoint: [34.76260434, -112.01666952],
  time: '2018-11-13T01:31:51-0800'
  course: 0,
  speed: 0,
  requestType: 'DepartureTime',
  useCarpoolLanes: false,
  useExpressLanes: false
}

tallygo.request.get(requestOptions).then(
  function(json) { console.log(json) }
)
```

The JSON response object has the following structure:

* `distance` (number) - the total travel distance in miles
* `duration` (number) - estimated travel time in minutes. Will always be a sum of `points.t`
* `originalStartNode` - start node ID of the edge that start point lays on
* `originalEndNode` - end node ID of the edge that end point lays on
* `routeSegments` ([_RouteSegment_]) - 1 or more legs for this route.
  * `distance` (number) - the total travel distance in miles for this leg
  * `duration` (number) - estimated travel time in minutes for this leg.
  * `originalStartNode` - start node ID of the edge that start point lays on, for this leg
  * `originalEndNode` - end node ID of the edge that end point lays on, for this leg
  * `points` ([_Point_]) - every point in the route in sequence
    * `lat` (number) - latitude
    * `lon` (number) - longitude
    * `t` (number) - estimated travel time in seconds from the previous point
    * `d` (number) - the distance in miles from the previous point
    * `say` _optional_ ([string]) - the instructions to be spoken at or near this point
    * `notify` _optional_ (string) - the out-of-app notification to be displayed at or near this point
    * `turn` _optional_ (_Turn_) - the turn at this point
      * `dir` (_TurnDirection enum_) - the direction of turn (or destination, when applicable)
      * `st` (_Street_) - the street being turned onto
        * `name` (string) - The name of this street
        * `func` ({_highway, localhighway, arterial, localarterial, residential, service_}) - the function of the street
        * `connection` _optional_ ({_origin, offramp, onramp, interchange, connector, destination_})
        * `dir` _optional_ ({_north, south, east, west_}) - the directionality of the street
        * `hwy` _optional_ (_HighwayId_) - more information about this street if it is a highway
          * `number` (number) - the number of the highway
          * `type` (string) - ({_CA, US, I, Hwy, CR, SR_}) - the type of highway
      * `instruct` _optional_ (string) - The text describing the turn instruction for the turn-by-turn list
    * `node` _optional_ (number) - OSM node id associated with the point
    * `edge` _optional_ (number) - OSM way id which starts with this point


The library provides a convenience class for working with [`Route`](http://localhost:9966/documentation/#route) objects.

```js
tallygo.request.get(requestOptions).then(
  function(json) {
  let route = tallygo.newRoute(json)
  // do something with the Route object
  }
)
```


Development
---


#### Set up:

```
yarn install
```

#### Test:

```
yarn test
```

#### Build development bundles

```
yarn build:dev
```
generates javascript bundles in the `/dist` directory.

#### Build documentation

```
yarn build:docs
```
generates html documentation in the `/documentation` directory.

#### Run the development Server
```
yarn start
```

With development server running see the examples: [http://localhost:9966/examples/](http://localhost:9966/examples/)

Documentation is available here: [http://localhost:9966/documentation/](http://localhost:9966/documentation/)
