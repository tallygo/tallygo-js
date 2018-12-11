TallyGo-JS [![Build Status](https://travis-ci.org/tallygo/tallygo-js.svg?branch=master)](https://travis-ci.org/tallygo/tallygo-js)
======

TallyGo navigation API wrapper in Javascript. Also features component to animate iOS and Android client location updates on a map.

Quick start
----

Install via npm:

    npm install tallygo-js
    yarn install tallygo-js

Or as a script tag:

```html
<script src="https://unpkg.com/tallygo-js@1.0.1/dist/tallygo.min.js"></script>
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
}

tallygo.request.get(requestOptions).then(
  function(json) { console.log(json) }
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

