const path = require("path");
const webpack = require("webpack");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");

module.exports = {
  entry: "./resources/modules/customizer/src/index.js",
  mode: "development",
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /(node_modules|bower_components).*/,
        loader: "babel-loader",
        options: {
        }
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /(node_modules|bower_components)/,
        loader: "babel-loader",
        options: {
          presets: ["@babel/env", "@babel/preset-react"],
          plugins: ["@babel/plugin-syntax-jsx", "inline-react-svg"]
        }
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          // Creates `style` nodes from JS strings
          "style-loader",
          // Translates CSS into CommonJS
          "css-loader",
          // Compiles Sass to CSS
          "sass-loader"
        ]
      },
      {
        test: /\.svg$/,
        exclude: /slick.svg$/,
        use: [
          {
            loader: "babel-loader"
          },
          {
            loader: "react-svg-loader",
            options: {
              //jsx: true, // true outputs JSX tags
            }
          }
        ]
      },
      {
        test: /(\.(woff|woff2|eot|ttf|otf)|slick.svg)$/,
        use: ["file-loader"]
      },
      {
        test: /\.(png|jpg|gif)$/,
        loader: "file-loader",
        options: {
          name: "[path][name].[ext]"
        }
      }
    ]
  },
  resolve: {
    extensions: ["*", ".js", ".jsx"]
  },
  output: {
    path: path.resolve(__dirname, "customizer/"),
    publicPath: "http://localhost:3007/src/",
    chunkFilename: "[chunkhash].bundle.js",
    filename: "bundle.js"
  },
  devServer: {
    contentBase: path.join(__dirname, "public/"),
    port: 3007,
    publicPath: "http://localhost:3007/admin/",
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers":
        "X-Requested-With, content-type, Authorization"
    },
    hotOnly: true
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),

    new webpack.DefinePlugin({
      "process.env": "{}",
      global: {}
    }),
    new CleanWebpackPlugin()]
};
