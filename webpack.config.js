const path = require("path");
const HtmlWebPackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");

const OptimizeCssAssetWebpackPlugin = require("optimize-css-assets-webpack-plugin");
const TerserWebpackPlugin = require("terser-webpack-plugin");

const ESlintPlugin = require("eslint-webpack-plugin");

const isDev = process.env.NODE_ENV === "development";
const isProd = !isDev;
const filename = (ext) =>
  isDev ? `[name].${ext}` : `[name].[contenthash].${ext}`;

const optimization = () => {
  const config = {
    splitChunks: {
      chunks: "all",
    },
  };

  if (isProd) {
    config.minimizer = [
      new OptimizeCssAssetWebpackPlugin(),
      new TerserWebpackPlugin(),
    ];
  }

  return config;
};

const plugins = () => {
  const base = [
    new HtmlWebPackPlugin({
      template: "./src/index.html",
      minify: {
        collapseWhitespace: isProd,
      },
    }),
    new MiniCssExtractPlugin({
      filename: filename("css"),
    }),
    new CopyPlugin({
      patterns: [{ from: "./public", to: "public" }],
    }),
    new CleanWebpackPlugin({ cleanStaleWebpackAssets: false }),
    new ESlintPlugin({ extensions: ["ts", "js"] }),
  ];

  if (isProd) {
    base.push(new BundleAnalyzerPlugin());
    base.push(new ESlintPlugin());
  }

  return base;
};

module.exports = {
  target: "web",
  devtool: isDev ? "inline-source-map" : false,
  entry: {
    main: "./src/index.ts",
  },
  output: {
    filename: filename("js"),
    path: path.resolve(__dirname, "dist"),
    assetModuleFilename: "assets/[contenthash][ext]",
  },
  module: {
    rules: [
      {
        test: /\.[tj]s$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.(?:ico|gif|png|jpg|jpeg|svg)$/i,
        type: "asset/resource",
      },
      {
        test: /\.(woff(2)?|eot|ttf|otf)$/i,
        type: "asset/inline",
      },
      { test: /\.css$/i, use: [MiniCssExtractPlugin.loader, "css-loader"] },
      {
        test: /\.s[ac]ss$/i,
        use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
      },
    ],
  },
  optimization: optimization(),

  devServer: {
    contentBase: path.join(__dirname, "/"),
    hot: isDev,
    port: 4200,
    historyApiFallback: true,
  },
  resolve: {
    extensions: [".ts", ".js"],
  },

  plugins: plugins(),
};
