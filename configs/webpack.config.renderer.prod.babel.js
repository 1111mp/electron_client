/**
 * Build config for electron renderer process
 */

import path from 'path';
import webpack from 'webpack';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import HtmlWebpackHarddiskPlugin from 'html-webpack-harddisk-plugin';
import OptimizeCSSAssetsPlugin from 'optimize-css-assets-webpack-plugin';
import MomentLocalesPlugin from 'moment-locales-webpack-plugin';
// import CompressionWebpackPlugin from 'compression-webpack-plugin';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import { merge } from 'webpack-merge';
import TerserPlugin from 'terser-webpack-plugin';
import baseConfig from './webpack.config.base';
import CheckNodeEnv from '../internals/scripts/CheckNodeEnv';
import DeleteSourceMaps from '../internals/scripts/DeleteSourceMaps';

CheckNodeEnv('production');
DeleteSourceMaps();

export default merge(baseConfig, {
  devtool: process.env.DEBUG_PROD === 'true' ? 'source-map' : false,

  mode: 'production',

  target:
    process.env.E2E_BUILD || process.env.ERB_SECURE !== 'true'
      ? 'electron-renderer'
      : 'electron-preload',

  entry: {
    appMain: path.join(__dirname, '..', 'app/appMain/index.tsx'),
    appWin: path.join(__dirname, '..', 'app/appWin/index.tsx'),
    appLogin: path.join(__dirname, '..', 'app/appLogin/index.tsx'),
  },

  output: {
    path: path.join(__dirname, '..', 'app/dist'),
    publicPath: '../dist/',
    filename: 'renderer.prod.[name].js',
  },

  module: {
    rules: [
      // Extract all .global.css to style.css as is
      {
        test: /\.global\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              publicPath: './',
            },
          },
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
            },
          },
        ],
      },
      // Pipe other styles through css modules and append to style.css
      {
        test: /^((?!\.global).)*\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          {
            loader: 'css-loader',
            options: {
              modules: {
                localIdentName: '[name]__[local]__[hash:base64:5]',
              },
              sourceMap: true,
            },
          },
        ],
      },
      // Add SASS support  - compile all .global.scss files and pipe it to style.css
      {
        test: /\.s[ac]ss$/i,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
              importLoaders: 1,
            },
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true,
            },
          },
          {
            loader: 'sass-resources-loader',
            options: {
              resources: [path.join(__dirname, '../app/styles/mixin.scss')],
            },
          },
        ],
      },
      {
        test: /\.less$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          { loader: 'css-loader' },
          {
            loader: 'less-loader',
            options: {
              lessOptions: {
                javascriptEnabled: true,
              },
            },
          },
        ],
      },
      // WOFF Font
      {
        test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 10000,
            mimetype: 'application/font-woff',
          },
        },
      },
      // WOFF2 Font
      {
        test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 10000,
            mimetype: 'application/font-woff',
          },
        },
      },
      // TTF Font
      {
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 10000,
            mimetype: 'application/octet-stream',
          },
        },
      },
      // EOT Font
      {
        test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
        use: 'file-loader',
      },
      // SVG Font
      {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 10000,
            mimetype: 'image/svg+xml',
          },
        },
      },
      // Common Image Formats
      {
        test: /\.(?:ico|gif|png|jpg|jpeg|webp)$/,
        use: 'url-loader',
      },
    ],
  },

  optimization: {
    minimizer: process.env.E2E_BUILD
      ? []
      : [
          new TerserPlugin({
            parallel: true,
          }),
          new OptimizeCSSAssetsPlugin({
            cssProcessorOptions: {
              discardComments: {
                removeAll: true, // 移除注释
              },
              map: {
                inline: false,
                annotation: true,
              },
            },
          }),
        ],
    splitChunks: {
      chunks: 'all',
    },
    runtimeChunk: 'single',
  },

  plugins: [
    new CleanWebpackPlugin(),
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
      E2E_BUILD: false,
    }),

    new MiniCssExtractPlugin({
      filename: '[name].[contenthash].css',
      chunkFilename: '[id].[contenthash].css',
    }),

    new MomentLocalesPlugin({ localesToKeep: ['zh-cn'] }),

    new HtmlWebpackPlugin({
      filename: '../pages/index.html',
      template: path.resolve(__dirname, '../templates/index.html'),
      chunks: ['appMain'],
      alwaysWriteToDisk: true, // 配合html-webpack-harddisk-plugin插件始终将生成的文件输出到指定目录
    }),

    new HtmlWebpackPlugin({
      filename: '../pages/window.html',
      template: path.resolve(__dirname, '../templates/window.html'),
      chunks: ['appWin'],
      alwaysWriteToDisk: true, // 配合html-webpack-harddisk-plugin插件始终将生成的文件输出到指定目录
    }),

    new HtmlWebpackPlugin({
      filename: '../pages/login.html',
      template: path.resolve(__dirname, '../templates/login.html'),
      chunks: ['appLogin'],
      alwaysWriteToDisk: true, // 配合html-webpack-harddisk-plugin插件始终将生成的文件输出到指定目录
    }),

    new HtmlWebpackHarddiskPlugin(),

    // new CompressionWebpackPlugin({
    //   filename: '[path][base].gz',
    //   algorithm: 'gzip',
    //   compressionOptions: {
    //     level: 1,
    //   },
    //   test: new RegExp('\\.(' + ['js', 'css'].join('|') + ')$'),
    //   threshold: 10240,
    //   minRatio: 0.8,
    // }),

    new BundleAnalyzerPlugin({
      analyzerMode:
        process.env.OPEN_ANALYZER === 'true' ? 'server' : 'disabled',
      openAnalyzer: process.env.OPEN_ANALYZER === 'true',
    }),
  ],
});
