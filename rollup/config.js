import flowRemoveTypes from '@mapbox/flow-remove-types';
export const production = process.env.BUILD === 'production';

// Using this instead of rollup-plugin-flow due to
// https://github.com/leebyron/rollup-plugin-flow/issues/5
export function flow() {
  return {
    name: 'flow-remove-types',
    transform: (code) => ({
      code: flowRemoveTypes(code).toString(),
      map: null
    })
  }
}

export function config(config) {
  return {
    input: 'src/index.js',
    external: config.external,
    output: config.output,
    treeshake: config.treeshake,
    plugins: config.plugins
  }
}
