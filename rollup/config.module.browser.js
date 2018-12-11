import json from 'rollup-plugin-json'
import replace from 'rollup-plugin-replace'
import resolve from 'rollup-plugin-node-resolve'
import { config } from './config'

export default config({
  external: [
    'mapbox-gl',
    'isomorphic-ws',
    'isomorphic-unfetch',
    'ws',
    '@turf/helpers',
    '@turf/along',
    '@turf/bearing',
    '@turf/distance'
  ],
  output: [
    { file: 'lib/tallygo.browser.cjs.js', format: 'cjs' },
    { file: 'lib/tallygo.browser.es.js', format: 'es' }
  ],
  plugins: [
    replace({'process.browser': JSON.stringify(!!true)}),
    resolve({
      customResolveOptions: { moduleDirectory: 'node_modules' }
    }),
    json({ exclude: ['node_modules/**'] })
  ]
})
