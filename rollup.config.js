import json from 'rollup-plugin-json'
import commonjs from 'rollup-plugin-commonjs'
import babel from 'rollup-plugin-babel'
import resolve from 'rollup-plugin-node-resolve'
import uglify from 'rollup-plugin-uglify'
import flowRemoveTypes from '@mapbox/flow-remove-types';
import pkg from './package.json'

const production = process.env.BUILD === 'production';

// Using this instead of rollup-plugin-flow due to
// https://github.com/leebyron/rollup-plugin-flow/issues/5
function flow() {
  return {
    name: 'flow-remove-types',
    transform: (code) => ({
      code: flowRemoveTypes(code).toString(),
      map: null
    })
  }
}

export default [
  // browser-friendly umd build
  {
    input: 'src/index.js',
    external: ['mapbox-gl', 'isomorphic-ws'],
    output: {
      globals: {
        'mapbox-gl': 'mapboxgl',
        'isomorphic-ws': 'WebSocket'
      },
      name: 'TallyGo',
      file: pkg.browser,
      format: 'iife',
      sourcemap: production ? true : 'inline'
    },
    plugins: [
      json({
        exclude: [ 'node_modules/**' ]
      }),
      flow(),
      babel({
        exclude: ['node_modules/**', '*.json']
      }),
      resolve(),
      commonjs(),
      production ? uglify() : false
    ]
  },
  {
    input: 'src/index.js',
    external: [
      'mapbox-gl',
      'isomorphic-ws',
      'ws',
      '@turf/helpers',
      '@turf/along',
      '@turf/bearing',
      '@turf/distance'
    ],
    output: [
      // node friendly commonjs build
      { file: pkg.main, format: 'cjs' },
      // bundler friendly module build
      { file: pkg.module, format: 'es' }
    ],
    plugins: [
      resolve({
        customResolveOptions: { moduleDirectory: 'node_modules' }
      }),
      json({
        exclude: ['node_modules/**']
      })
    ]
  }
].filter(Boolean)
