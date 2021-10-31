const path = require('path');

// Creates an overview of bundle sizes and automatically opens it in your browser
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

// Generates a nice visualization of bundle sizes in dist/statistics.html
const Visualizer = require('webpack-visualizer-plugin2');

const basePath = path.dirname(__dirname);

module.exports = {
  entry: './src/index.js',
  module: {
    rules: [
      {
        test: /\.(js)$/,
        exclude: /node_modules/,
        use: ['babel-loader']
      }
    ]
  },
  resolve: {
    extensions: ['*', '.js'],
    modules: [
      path.join(basePath, 'src'),
      'node_modules',
    ],
    alias: {
      immutable: path.resolve(basePath),
    },
  },
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
  },
  plugins: [
    new BundleAnalyzerPlugin(),
    new Visualizer({
      filename: './statistics.html',
    }),
  ],
  // for testing the output
  mode: "production",
  //mode: "development",
  optimization: {
    usedExports: true,
    innerGraph: true,
    sideEffects: true,
  },
  devtool: false,
};
