import webpack from 'webpack';
import ExtractCssChunks from 'extract-css-chunks-webpack-plugin';
import LodashModuleReplacementPlugin from 'lodash-webpack-plugin';
import HappyPack from 'happypack';
import WriteFilePlugin from 'write-file-webpack-plugin';

import definePlugin from './definePlugin';

export default env => [
    new WriteFilePlugin(),
    definePlugin(),
    new LodashModuleReplacementPlugin({
        shorthands: true,
    }),
    new HappyPack({
        id: 'babel',
        loaders: [{
            path: 'babel-loader', // Options to configure babel with
            query: {
                // ignore babelrc
                babelrc: false,
                plugins: [
                    ['universal-import', {
                        disableWarnings: true,
                    }],
                    'lodash',
                    '@babel/plugin-transform-runtime',
                    // Stage 0
                    '@babel/plugin-proposal-function-bind',

                    // Stage 1
                    '@babel/plugin-proposal-export-default-from',
                    '@babel/plugin-proposal-logical-assignment-operators',
                    ['@babel/plugin-proposal-optional-chaining', {loose: false}],
                    ['@babel/plugin-proposal-pipeline-operator', {proposal: 'minimal'}],
                    ['@babel/plugin-proposal-nullish-coalescing-operator', {loose: false}],
                    '@babel/plugin-proposal-do-expressions',

                    // Stage 2
                    ['@babel/plugin-proposal-decorators', {legacy: true}],
                    '@babel/plugin-proposal-function-sent',
                    '@babel/plugin-proposal-export-namespace-from',
                    '@babel/plugin-proposal-numeric-separator',
                    '@babel/plugin-proposal-throw-expressions',

                    // Stage 3
                    '@babel/plugin-syntax-dynamic-import',
                    '@babel/plugin-syntax-import-meta',
                    ['@babel/plugin-proposal-class-properties', {loose: true}],
                    '@babel/plugin-proposal-json-strings',

                    'react-hot-loader/babel',
                    'babel-plugin-redux-saga',
                ],
                presets: [
                    // do not transpil es6 import into require, webpack needs to see the import and exports statements to do tree-shaking
                    ['@babel/preset-env', {modules: false}],
                    '@babel/preset-react',
                    '@emotion/babel-preset-css-prop',
                ],
            },
        }],
        threads: 4,
    }),
    new ExtractCssChunks({
        filename: '[name].css',
        allChunks: false,
    }),
    new webpack.NamedModulesPlugin()
];
