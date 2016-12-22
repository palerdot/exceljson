var webpack = require("webpack");

module.exports = {
    entry: './index.js',
    output: {
        filename: 'bundle.js'
    },
    module: {
        loaders: [{
            test: /\.js$/,
            exclude: /(node_modules|bower_components)/,
            loader: 'babel-loader',
            query: {
                presets: ['es2015']
            }
        }]
    },
    // plugins: [
    //     new webpack.ProvidePlugin({
    //         $: 'jquery'
    //     })
    // ],
    resolve: {
        // regarding vue confusion
        // ref: https://vuejs.org/v2/guide/installation.html#Standalone-vs-Runtime-only-Build
        alias: {
            'vue$': 'vue/dist/vue.common.js'
        }
    }
}
