import path from 'path';

import rules from '../utils/rules';
import resolve from '../utils/resolve';
import plugins from '../utils/plugins';

const DEBUG = !(['production', 'development', 'staging'].includes(process.env.NODE_ENV)),
    DEVELOPMENT = (['development', 'staging'].includes(process.env.NODE_ENV)),
    PRODUCTION = (['production'].includes(process.env.NODE_ENV));

export default {
    mode: process.env.NODE_ENV,
    name: 'client',
    target: 'web',
    devtool: 'cheap-module-source-map',
    entry: {
        main: [
            'fetch-everywhere',
            path.resolve(__dirname, '../../src/client/index.js'),
        ],
    },
    module: {
        rules: rules(),
    },
    stats: {
        colors: true,
        reasons: DEBUG,
        hash: DEVELOPMENT,
        version: DEVELOPMENT,
        timings: true,
        chunks: DEVELOPMENT,
        chunkModules: DEVELOPMENT,
        cached: DEVELOPMENT,
        cachedAssets: DEVELOPMENT,
    },
    output: {
        filename: `[name]${PRODUCTION ? '-[hash:6]' : ''}.js`,
        chunkFilename: `[name]${PRODUCTION ? '-[chunkhash:6]' : ''}.js`,
        path: path.resolve(__dirname, '../../build/ssr/client'),
        publicPath: '/',
    },
    plugins: plugins('client'),
    resolve: resolve(),
    ...(DEVELOPMENT ? {
        devServer: {
            historyApiFallback: true,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Credentials': 'true',
                'Access-Control-Allow-Methods': 'GET,HEAD,OPTIONS,POST,PUT,PATCH',
                'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization, authorization',
            },
        },
        watch: true,
        cache: true,
    } : {}),
};
