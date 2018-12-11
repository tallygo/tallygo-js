import json from 'rollup-plugin-json'
import commonjs from 'rollup-plugin-commonjs'
import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'
import replace from 'rollup-plugin-replace'
import uglify from 'rollup-plugin-uglify'
import { config, production, flow } from './config'

export default config({
  external: ['mapbox-gl', 'isomorphic-ws', 'isomorphic-unfetch', 'es6-promise'],
  output: {
    globals: {
      'mapbox-gl': 'mapboxgl',
      'isomorphic-ws': 'WebSocket',
      'isomorphic-unfetch': 'fetch'
    },
    name: 'TallyGo',
    file: production ? 'dist/tallygo.min.js' : 'dist/tallygo.js',
    format: 'iife',
    sourcemap: production ? true : 'inline'
  },
  plugins: [
    json({
      exclude: [ 'node_modules/**' ]
    }),
    replace({'process.browser': JSON.stringify(!!true)}),
    flow(),
    babel({
      exclude: ['node_modules/**', '*.json']
    }),
    resolve(),
    commonjs(),
    production ? uglify() : false
  ]
})
