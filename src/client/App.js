import React from 'react';
import {hot} from 'react-hot-loader';

import Root from './root';
import store from './store';

const App = () => <Root store={store} />;

export default hot(module)(App);
