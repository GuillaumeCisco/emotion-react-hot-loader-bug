import {connectRoutes} from 'redux-first-router';
import {applyMiddleware, compose} from 'redux';
import {pick} from 'lodash';
import queryString from 'query-string';

import {createInjectSagasStore, sagaMiddleware} from 'redux-sagas-injector';

import routes from '../../server/routesMap';

const rootSaga =  function* () {
};

const configureStore = (initialState, initialEntries, opts) => {
    const {
        reducer, middleware, enhancer, thunk, initialDispatch,
    } = connectRoutes(routes, {
        initialDispatch: false,
        querySerializer: queryString,
        initialEntries,
        ...opts,
    }); // yes, 5 redux aspects

    const enhancers = [
        // create the saga middleware
        applyMiddleware(sagaMiddleware, middleware),
    ];

    const reducers = {location: reducer};
    const store = createInjectSagasStore({rootSaga}, reducers, initialState, compose(enhancer, ...enhancers));
    initialDispatch();

    return {store, thunk};
};

export default configureStore;
