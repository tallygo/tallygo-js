import buble from 'rollup-plugin-buble'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
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
    external: ['mapbox-gl'],
		output: {
			name: 'tallyGoKit',
			file: pkg.browser,
      format: 'umd',
      sourcemap: production ? true : 'inline'
		},
		plugins: [
      flow(),
      buble({transforms: {dangerousForOf: true}, objectAssign: "Object.assign"}),
			resolve(),
			commonjs(),
      production ? uglify() : false
		]
	},
	{
		input: 'src/index.js',
		external: ['mapbox-gl'],
		output: [
      // node friendly commonjs build
			{ file: pkg.main, format: 'cjs' },
      // bundler friendly module build
			{ file: pkg.module, format: 'es' }
		]
	}
].filter(Boolean)
