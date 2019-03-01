import React from 'react';

import Surname from './surname';
import SurnameWithabstract from './surnameWithAbstract';

// will trigger error if update console.log in abstract.js
export default () => <Surname name="bar" />;

// will trigger no errors
//export default () => <SurnameWithabstract name="bar" />;
