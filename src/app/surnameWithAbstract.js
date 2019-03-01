import React, {Component} from 'react';
import {css} from 'emotion';

class Abstract extends Component {

    displayName = () => {
        return `my name is ${this.props.name}`;
    };

    h1 = () => css`
        color: red;
    `;

    render () {
        console.log('update this console.log no error ');

        return <h1 className={this.h1()}>{this.displayName()}</h1>
    }
}

Abstract.defaultProps = {
    name: 'foo'
};

class Surname extends Abstract {
    displayName = () => {
        return `my surname is ${this.props.name}`;
    };
}

export default Surname;
