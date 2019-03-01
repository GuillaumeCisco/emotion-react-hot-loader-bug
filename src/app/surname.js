import React from 'react';
import Abstract from './abstract';

class Surname extends Abstract {
    displayName = () => {
        return `my surname is ${this.props.name}`;
    };
}

export default Surname;
