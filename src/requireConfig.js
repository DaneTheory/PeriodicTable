require.config({
  paths: {
    famous: './src/',
    requirejs: './src/require.js',
    d3: '../../../lib/d3'
  }
});
require(['main']);
