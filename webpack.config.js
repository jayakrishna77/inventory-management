const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const webpack = require('webpack');

module.exports = {
    devtool: "inline-source-map",
    entry: ["webpack-hot-middleware/client", "./client/index.js"],
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "bundle.js",
        publicPath: "/"
    },
    resolve: {
        extensions: ["", ".js", ".jsx"],
    },
    module: {
        rules: [
            {
                test: /\.(js)$/,
                exclude: /node_modules/,
                use: {
                    loader: "babel-loader",
                    options: {
                        presets: [
                            ["@babel/preset-env", { targets: { node: "current" } }],
                            ["@babel/preset-react", { targets: { node: "current" } }],
                        ],
                    },
                }
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: "Your custom title",
            template: "./client/index.html",
        }),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.DefinePlugin({
            "process.env": {
                NODE_ENV: JSON.stringify("development"),
            },
        }),
    ],
}
