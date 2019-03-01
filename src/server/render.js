import React from 'react';
import {parse} from 'url';
import {PassThrough} from 'stream';
import {Provider} from 'react-redux';
import {renderToNodeStream} from 'react-dom/server';
import {renderStylesToNodeStream} from 'emotion-server';
import flushChunks from 'webpack-flush-chunks';

import routesMap from './routesMap';

import App from '../app';
import configureStore from './configureStore';
import serviceWorker from './serviceWorker';


const paths = Object.keys(routesMap).map(o => routesMap[o].path);

const createApp = (App, store, chunkNames) => (
        <Provider store={store}>
            <App />
        </Provider>
);

const earlyChunk = (styles, stateJson) => `
    <!doctype html>
      <html lang="en">
        <head>
          <meta charset="utf-8">
          <title>test</title>
          <meta charset="utf-8" />
          <meta http-equiv="X-UA-Compatible" content="IE=edge" />
          <meta name="mobile-web-app-capable" content="yes">
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
          ${styles}          
        </head>
      <body>
          <noscript>
              <div>Please enable javascript in your browser for displaying this website.</div>
          </noscript>
          <script>window.REDUX_STATE = ${stateJson}</script>
          <div id="root">`,
    lateChunk = (cssHash, js) => `</div>
          ${cssHash}
          ${js}
          ${serviceWorker}
        </body>
    </html>
  `;

const renderStreamed = async (ctx, path, clientStats, outputPath) => {
    const store = await configureStore(ctx);

    if (!store) return; // no store means redirect was already served
    const stateJson = JSON.stringify(store.getState());

    const {css} = flushChunks(clientStats, {outputPath});

    const chunkNames = [];
    const app = createApp(App, store, chunkNames);

    const stream = renderToNodeStream(app).pipe(renderStylesToNodeStream());

    // flush the head with css & js resource tags first so the download starts immediately
    const early = earlyChunk(css, stateJson);


    // DO not use redis cache on dev
    let mainStream;
    if (process.env.NODE_ENV === 'development') {
        mainStream = ctx.body;
    }
    else {
        mainStream = createCacheStream(path);
        mainStream.pipe(ctx.body);
    }

    mainStream.write(early);

    stream.pipe(mainStream, {end: false});

    stream.on('end', () => {
        const {js, cssHash} = flushChunks(clientStats,
            {
                chunkNames,
                outputPath,
            });

        console.log('CHUNK NAMES', chunkNames);

        const late = lateChunk(cssHash, js);
        mainStream.end(late);
    });
};

export default ({clientStats, outputPath}) => async (ctx) => {
    ctx.body = new PassThrough(); // this is a stream
    ctx.status = 200;
    ctx.type = 'text/html';

    console.log('REQUESTED ORIGINAL PATH:', ctx.originalUrl);

    const url = parse(ctx.originalUrl);

    let path = ctx.originalUrl;
    // check if path is in our whitelist, else give 404 route
    if (!paths.includes(url.pathname)
        && !ctx.originalUrl.endsWith('.ico')
        && ctx.originalUrl !== 'service-worker.js'
        && !(process.env.NODE_ENV === 'development' && ctx.originalUrl.endsWith('.js.map'))) {
        path = '/404';
    }

    console.log('REQUESTED PARSED PATH:', path);

    renderStreamed(ctx, path, clientStats, outputPath);
};
