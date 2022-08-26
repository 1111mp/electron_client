import path from 'path';
import fs from 'fs-extra';
import webpack from 'webpack';
import { merge } from 'webpack-merge';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import CopyPlugin from 'copy-webpack-plugin';
import baseConfig from './webpack.config.base';
import webpackPaths from './webpack.paths';
import checkNodeEnv from '../scripts/check-node-env';

// When an ESLint server is running, we can't set the NODE_ENV so we'll check if it's
// at the dev webpack config is not accidentally run in a production environment
if (process.env.NODE_ENV === 'production') {
  checkNodeEnv('development');
}

const mainWorkerPath = path.join(webpackPaths.srcBDPath, 'mainWorker.ts');

const configuration: webpack.Configuration = {
  devtool: 'inline-source-map',

  mode: 'development',

  target: 'electron-main',

  entry: {
    mainWorker: mainWorkerPath,
  },

  output: {
    path: webpackPaths.dllPath,
    filename: '[name].js',
  },

  plugins: [
    new BundleAnalyzerPlugin({
      analyzerMode: process.env.ANALYZE === 'true' ? 'server' : 'disabled',
    }),

    /**
     * Create global constants which can be configured at compile time.
     *
     * Useful for allowing different behaviour between development builds and
     * release builds
     *
     * NODE_ENV should be production so that modules do not perform certain
     * development checks
     *
     * By default, use 'development' as NODE_ENV. This can be overriden with
     * 'staging', for example, by changing the ENV variables in the npm scripts
     */
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'development',
    }),

    new webpack.LoaderOptionsPlugin({
      debug: true,
    }),

    new CopyPlugin({
      patterns: [
        {
          from: path.join(
            webpackPaths.appNodeModulesPath,
            'better-sqlite3-multiple-ciphers'
          ),
          to: 'node_modules/better-sqlite3-multiple-ciphers', // still under node_modules directory so it could find this module
        },
        {
          from: path.join(webpackPaths.appNodeModulesPath, 'bindings'),
          to: 'node_modules/bindings', // still under node_modules directory so it could find this module
        },
        {
          from: path.join(webpackPaths.appNodeModulesPath, 'file-uri-to-path'),
          to: 'node_modules/file-uri-to-path', // still under node_modules directory so it could find this module
        },
      ],
    }),
  ],

  /**
   * Disables webpack processing of __dirname and __filename.
   * If you run the bundle in node.js it falls back to these values of node.js.
   * https://github.com/webpack/webpack/issues/2010
   */
  node: {
    __dirname: false,
    __filename: false,
  },

  watch: true,
};

export default merge(baseConfig, configuration);
