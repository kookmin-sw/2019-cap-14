const path = require('path');
// eslint-disable-next-line import/no-unresolved
const slsw = require('serverless-webpack');
const nodeExternals = require('webpack-node-externals');


console.log(slsw.lib.entries)

module.exports = {
  entry: slsw.lib.entries,
  target: 'node',
  devtool: 'source-map',
  externals: [
    nodeExternals({
    whitelist: [
      'mysql', 
      'mysql2',
      'nodemailer',
      'mailgun-js',
      'knex',

      // 'knex', 
      // 'aws-sdk', 
      // 'nodemailer'
  ]})],
  module: {
    loaders: [{
      test: /\.js$/,
      loaders: ['babel-loader'],
      include: __dirname,
      exclude: /node_modules/,
    }],
  },
  output: {
    libraryTarget: 'commonjs',
    path: path.join(__dirname, '.webpack'),
    filename: '[name].js',
  },
};
