import path from 'path';
import fs from 'fs';
import webpack from 'webpack';
import chalk from 'chalk';
import { merge } from 'webpack-merge';
import { spawn, execSync } from 'child_process';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import HtmlWebpackHarddiskPlugin from 'html-webpack-harddisk-plugin';
import baseConfig from './webpack.config.base';
import CheckNodeEnv from '../scripts/CheckNodeEnv';
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';

// When an ESLint server is running, we can't set the NODE_ENV so we'll check if it's
// at the dev webpack config is not accidentally run in a production environment
if (process.env.NODE_ENV === 'production') {
  CheckNodeEnv('development');
}

const port = process.env.PORT || 1212;
const publicPath = `http://localhost:${port}/dist`;
const dllDir = path.join(__dirname, '../dll');
const manifest = path.resolve(dllDir, 'renderer.json');
const requiredByDLLConfig = module.parent.filename.includes(
  'webpack.config.renderer.dev.dll'
);

/**
 * Warn if the DLL is not built
 */
if (
  !requiredByDLLConfig &&
  !(fs.existsSync(dllDir) && fs.existsSync(manifest))
) {
  console.log(
    chalk.black.bgYellow.bold(
      'The DLL files are missing. Sit back while we build them for you with "yarn build-dll"'
    )
  );
  execSync('yarn build-dll');
}

export default merge(baseConfig, {
  devtool: 'inline-source-map',

  mode: 'development',

  target: 'electron-renderer',

  entry: {
    appMain: path.join(__dirname, '../../src/appMain/index.tsx'),
    appWin: path.join(__dirname, '../../src/appWin/index.tsx'),
    appLogin: path.join(__dirname, '../../src/appLogin/index.tsx'),
  },

  output: {
    publicPath: `http://localhost:${port}/dist/`,
    filename: 'renderer.[name].js',
  },

  module: {
    rules: [
      {
        test: /\.[jt]sx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: require.resolve('babel-loader'),
            options: {
              plugins: [require.resolve('react-refresh/babel')].filter(Boolean),
            },
          },
        ],
      },
      {
        test: /\.global\.css$/,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
            },
          },
        ],
      },
      {
        test: /^((?!\.global).)*\.css$/,
        use: [
          {
            loader: 'style-loader',
          },
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
        ],
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
            options: {
              sourceMap: true,
            },
          },
          {
            loader: 'sass-loader',
          },
          {
            loader: 'sass-resources-loader',
            options: {
              resources: [path.join(__dirname, '../../src/styles/mixin.scss')],
            },
          },
        ],
      },
      {
        test: /\.less$/,
        use: [
          { loader: 'style-loader' },
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
  plugins: [
    requiredByDLLConfig
      ? null
      : new webpack.DllReferencePlugin({
          context: path.join(__dirname, '../dll'),
          manifest: require(manifest),
          sourceType: 'var',
        }),

    new webpack.NoEmitOnErrorsPlugin(),

    new HtmlWebpackPlugin({
      filename: 'pages/index.html',
      template: path.resolve(__dirname, '../../templates/index.html'),
      chunks: ['appMain'],
      alwaysWriteToDisk: true, // 配合html-webpack-harddisk-plugin插件始终将生成的文件输出到指定目录
    }),

    new HtmlWebpackPlugin({
      filename: 'pages/window.html',
      template: path.resolve(__dirname, '../../templates/window.html'),
      chunks: ['appWin'],
      alwaysWriteToDisk: true, // 配合html-webpack-harddisk-plugin插件始终将生成的文件输出到指定目录
    }),

    new HtmlWebpackPlugin({
      filename: 'pages/login.html',
      template: path.resolve(__dirname, '../../templates/login.html'),
      chunks: ['appLogin'],
      alwaysWriteToDisk: true, // 配合html-webpack-harddisk-plugin插件始终将生成的文件输出到指定目录
    }),

    new HtmlWebpackHarddiskPlugin(),

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

    new ReactRefreshWebpackPlugin(),
  ],

  node: {
    __dirname: false,
    __filename: false,
  },

  stats: 'errors-only',
  watchOptions: {
    aggregateTimeout: 600,
    ignored: /node_modules/,
  },

  devServer: {
    port,
    compress: true,
    hot: true,
    headers: { 'Access-Control-Allow-Origin': '*' },
    devMiddleware: {
      publicPath,
    },
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    client: {
      webSocketURL: `ws://localhost:${port}/ws`,
    },
    historyApiFallback: {
      verbose: true,
      disableDotRule: false,
    },
    // before() {
    //   console.log('Starting Main Process...');
    //   spawn('npm', ['run', 'start:main'], {
    //     shell: true,
    //     env: process.env,
    //     stdio: 'inherit',
    //   })
    //     .on('close', (code) => process.exit(code))
    //     .on('error', (spawnError) => console.error(spawnError));
    // },
  },
});
