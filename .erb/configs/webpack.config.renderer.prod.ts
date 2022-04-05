/**
 * Build config for electron renderer process
 */

import path from 'path';
import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import { merge } from 'webpack-merge';
import TerserPlugin from 'terser-webpack-plugin';
import baseConfig from './webpack.config.base';
import webpackPaths from './webpack.paths';
import checkNodeEnv from '../scripts/check-node-env';
import deleteSourceMaps from '../scripts/delete-source-maps';

checkNodeEnv('production');
deleteSourceMaps();

const devtoolsConfig =
  process.env.DEBUG_PROD === 'true'
    ? {
        devtool: 'source-map',
      }
    : {};

const configuration: webpack.Configuration = {
  ...devtoolsConfig,

  mode: 'production',

  target: ['web', 'electron-renderer'],

  entry: {
    main: path.join(webpackPaths.srcRendererPath, 'main/index.tsx'),
    login: path.join(webpackPaths.srcRendererPath, 'login/index.tsx'),
    window: path.join(webpackPaths.srcRendererPath, 'window/index.tsx'),
  },

  output: {
    path: webpackPaths.distRendererPath,
    publicPath: './',
    filename: '[name].bundle.js',
    library: {
      type: 'umd',
    },
  },

  module: {
    rules: [
      {
        test: /\.s?(a|c)ss$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              modules: {
                localIdentName: '[name]__[local]__[hash:base64:5]',
              },
              sourceMap: true,
              importLoaders: 1,
            },
          },
          'sass-loader',
          {
            loader: 'sass-resources-loader',
            options: {
              resources: [
                path.join(webpackPaths.srcRendererPath, 'styles/mixin.scss'),
              ],
            },
          },
        ],
        include: /\.module\.s?(c|a)ss$/,
      },
      {
        test: /\.s?(a|c)ss$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader',
          {
            loader: 'sass-resources-loader',
            options: {
              resources: [
                path.join(webpackPaths.srcRendererPath, 'styles/mixin.scss'),
              ],
            },
          },
        ],
        exclude: /\.module\.s?(c|a)ss$/,
      },
      // Fonts
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
      },
      // Images
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      },
    ],
  },

  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        parallel: true,
      }),
      new CssMinimizerPlugin(),
    ],
  },

  plugins: [
    /**
     * Create global constants which can be configured at compile time.
     *
     * Useful for allowing different behaviour between development builds and
     * release builds
     *
     * NODE_ENV should be production so that modules do not perform certain
     * development checks
     */
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'production',
      DEBUG_PROD: false,
    }),

    new MiniCssExtractPlugin({
      filename: '[name].[contenthash].css',
      chunkFilename: '[id].[contenthash].css',
    }),

    new BundleAnalyzerPlugin({
      analyzerMode: process.env.ANALYZE === 'true' ? 'server' : 'disabled',
    }),

    new HtmlWebpackPlugin({
      filename: 'main.html',
      template: path.join(webpackPaths.srcRendererPath, 'main/index.ejs'),
      minify: {
        collapseWhitespace: true,
        removeAttributeQuotes: true,
        removeComments: true,
      },
      chunks: ['main'],
      isBrowser: false,
      isDevelopment: process.env.NODE_ENV !== 'production',
    }),

    new HtmlWebpackPlugin({
      filename: 'login.html',
      template: path.join(webpackPaths.srcRendererPath, 'login/index.ejs'),
      minify: {
        collapseWhitespace: true,
        removeAttributeQuotes: true,
        removeComments: true,
      },
      chunks: ['login'],
      isBrowser: false,
      isDevelopment: process.env.NODE_ENV !== 'production',
    }),

    new HtmlWebpackPlugin({
      filename: 'window.html',
      template: path.join(webpackPaths.srcRendererPath, 'window/index.ejs'),
      minify: {
        collapseWhitespace: true,
        removeAttributeQuotes: true,
        removeComments: true,
      },
      chunks: ['window'],
      isBrowser: false,
      isDevelopment: process.env.NODE_ENV !== 'production',
    }),
  ],
};

export default merge(baseConfig, configuration);
