import path from 'path';

import http from 'http';
import webpack from 'webpack';

import Koa from 'koa';
import serve from 'koa-static';
import mount from 'koa-mount';
import cookie from 'koa-cookie';
import compress from 'koa-compress';
import helmet from 'koa-helmet';

import hotClient from 'webpack-hot-client';
import webpackDevMiddleware from 'koa-webpack-dev-middleware';
import webpackHotServerMiddleware from 'webpack-hot-server-middleware';

// Must be imported in that way to be include in prod
import clientConfig from '../../webpack/ssr/client';
import serverConfig from '../../webpack/ssr/server';


const DEBUG = !(['production', 'development', 'staging'].includes(process.env.NODE_ENV));
const DEVELOPMENT = (['development', 'staging'].includes(process.env.NODE_ENV));


// Redefined publicPath and outputPath instead of import clientConfig to solve
// prod importation problems
const publicPath = '/';
const outputPath = path.resolve(__dirname, '../../build/ssr/client');

const app = new Koa();
app.use(helmet());
app.use(cookie());
app.use(compress());

// let's encrypt config
const resolve = p => path.resolve(__dirname, p);
app.use(mount('/.well-known', serve(resolve('../../.well-known'))));

// UNIVERSAL HMR + STATS HANDLING GOODNESS:
if (DEVELOPMENT) {
    const multiCompiler = webpack([clientConfig, serverConfig]);
    const clientCompiler = multiCompiler.compilers[0];

    // First we fire up Webpack an pass in the configuration we
    // created
    let bundleStart = null;
    // We give notice in the terminal when it starts bundling and
    // set the time it started
    clientCompiler.plugin('compile', () => {
        console.log('Bundling...');
        bundleStart = Date.now();
    });
    // We also give notice when it is done compiling, including the
    // time it took. Nice to have
    clientCompiler.plugin('done', () => {
        console.log(`Bundled in ${(Date.now() - bundleStart)}ms!`);
    });

    // support hot module with websocket, not event-stream
    hotClient(clientCompiler);
    app.use(webpackDevMiddleware(multiCompiler, {
        publicPath,
        watchOptions: {
            aggregateTimeout: 300,
            poll: 1000,
        },
        quiet: false,
        noInfo: false,
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
        headers: clientConfig.devServer.headers,
    }));

    // keeps serverRender updated with arg: { clientStats, outputPath }
    app.use(webpackHotServerMiddleware(multiCompiler, {
        serverRendererOptions: {outputPath},
        createHandler: webpackHotServerMiddleware.createKoaHandler,
    }));

    http.createServer(app.callback()).listen(3000, () => console.log(`Listening @ http://localhost:3000/`));
}
