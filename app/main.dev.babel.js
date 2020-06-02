const register = require('@babel/register').default;

register({
  plugins: ['@babel/plugin-syntax-dynamic-import'],
  presets: ['@babel/preset-env'],
  extensions: ['.ts', '.tsx', '.js', '.json'],
  cache: true
});

require('./main.dev.ts');
