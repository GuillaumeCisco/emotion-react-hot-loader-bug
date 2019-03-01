/* global document */

import React from 'react';
import {hydrate, render} from 'react-dom';
import FastClick from 'fastclick';

import App from './App';

FastClick.attach(document.body);

const root = document.getElementById('root');

hydrate(<App />, root);

