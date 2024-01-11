// ./webpack.config.js
import nodeExternals from "webpack-node-externals";
import path from "path";

module.exports = {
    mode: "development",
    entry: {
        app: './index.js',
    },
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "main.js",
    },
    module: {
        rules: [
        {
            test: /\.js$/,
            use: {
            loader: "babel-loader",
            options: {
                presets: ["@babel/preset-env"],
            },
            },
            exclude: /node_modules/,
        },
        ],
    },
    target: "node",
    externalsPresets: {
        node: true,
    },
    externals: [nodeExternals()],
    };