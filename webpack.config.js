const path = require('path');

const PACKAGE = require('./package.json');
const webpack = require('webpack');
const banner = 'noodel-search - v' + PACKAGE.version + '\n' +
    '(c) 2019-' + new Date().getFullYear() + ' ' + PACKAGE.author + '\n' +
    PACKAGE.license + ' License' + '\n' + PACKAGE.homepage;

function baseConfig() {
    return {
        mode: 'production',
        entry: './NoodelSearch.ts',
        resolve: {
            extensions: ['.ts', '.js', '.json'],
        },
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    loader: 'ts-loader',
                    exclude: /node_modules/,
                },
            ],
        },
        plugins: [
            new webpack.BannerPlugin(banner)
        ],
        output: {
            path: path.resolve(__dirname, 'dist'),
            library: 'NoodelSearch',
            libraryExport: 'default',
            libraryTarget: 'umd'
        }, 
        stats: 'minimal'
    };
}

function umdConfig() {
    let config = baseConfig();

    config.output.filename = 'noodel-search.umd.js';
    config.optimization = {
        minimize: false,
    };

    return config;
}

function umdMinConfig() {
    let config = baseConfig();

    config.output.filename = 'noodel-search.umd.min.js';
 
    return config;
}

module.exports = [
    umdConfig(),
    umdMinConfig()
]
