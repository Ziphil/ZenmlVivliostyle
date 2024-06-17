//

import path from "path";
import externals from "webpack-node-externals";


let config = {
  entry: {
    index: ["./source/index.ts"]
  },
  output: {
    path: path.join(__dirname, "dist"),
    filename: "[name].js",
    library: {
      type: "commonjs"
    }
  },
  devtool: "inline-source-map",
  mode: "development",
  target: "node",
  externals: [externals()],
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: {
          loader: "ts-loader"
        }
      },
      {
        test: /\.js$/,
        enforce: "pre",
        use: {
          loader: "source-map-loader"
        }
      },
      {
        test: /\.scss$/,
        use: [
          {
            loader: "raw-loader"
          },
          {
            loader: "sass-loader"
          }
        ]
      },
      {
        test: /\.html$/,
        use: {
          loader: "raw-loader"
        }
      }
    ]
  },
  resolve: {
    extensions: [".ts", ".js", ".scss", ".html"]
  },
  cache: true
};

export default config;