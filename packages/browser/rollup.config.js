import { terser } from 'rollup-plugin-terser'
import typescript from 'rollup-plugin-typescript2'
import license from 'rollup-plugin-license'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'

const commitHash = require('child_process')
  .execSync('git rev-parse --short HEAD', { encoding: 'utf-8' })
  .trim()

const terserInstance = terser({
  mangle: {
    reserved: ['write', 'audit'],
    properties: {
      regex: /^_[^_]/
    }
  }
})

const paths = {
  '@indent/core': ['../core/src'],
  '@indent/types': ['../types/src']
}

const plugins = [
  typescript({
    tsconfig: 'tsconfig.build.json',
    tsconfigOverride: {
      compilerOptions: {
        declaration: false,
        declarationMap: false,
        module: 'ES2015',
        paths
      }
    },
    include: ['*.ts+(|x)', '**/*.ts+(|x)', '../**/*.ts+(|x)']
  }),
  resolve({
    mainFields: ['module']
  }),
  commonjs()
]

const bundleConfig = {
  input: 'src/index.ts',
  output: {
    format: 'iife',
    name: 'Indent',
    sourcemap: true,
    strict: false
  },
  context: 'window',
  plugins: [
    ...plugins,
    license({
      sourcemap: true,
      banner: `/*! @indent/browser <%= pkg.version %> (${commitHash}) | https://github.com/indentapis/sdk-js */`
    })
  ]
}

export default [
  {
    ...bundleConfig,
    output: {
      ...bundleConfig.output,
      file: 'build/bundle.js'
    }
  },
  {
    ...bundleConfig,
    output: {
      ...bundleConfig.output,
      file: 'build/bundle.min.js'
    },
    plugins: bundleConfig.plugins
      .slice(0, -1)
      .concat(terserInstance)
      .concat(bundleConfig.plugins.slice(-1))
  },
  {
    ...bundleConfig,
    output: {
      ...bundleConfig.output,
      file: 'build/bundle.es6.js'
    },
    plugins: [
      typescript({
        tsconfig: 'tsconfig.build.json',
        tsconfigOverride: {
          compilerOptions: {
            declaration: false,
            declarationMap: false,
            module: 'ES2015',
            paths,
            target: 'es6'
          }
        },
        include: ['*.ts+(|x)', '**/*.ts+(|x)', '../**/*.ts+(|x)']
      }),
      ...plugins.slice(1)
    ]
  },
  {
    ...bundleConfig,
    output: {
      ...bundleConfig.output,
      file: 'build/bundle.es6.min.js'
    },
    plugins: [
      typescript({
        tsconfig: 'tsconfig.build.json',
        tsconfigOverride: {
          compilerOptions: {
            declaration: false,
            declarationMap: false,
            module: 'ES2015',
            paths,
            target: 'es6'
          }
        },
        include: ['*.ts+(|x)', '**/*.ts+(|x)', '../**/*.ts+(|x)']
      }),
      ...plugins
        .slice(1)
        .slice(0, -1)
        .concat(terserInstance)
        .concat(bundleConfig.plugins.slice(-1))
    ]
  }
]
