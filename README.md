# emotion-react-hot-loader-bug

## Installation

This project use yarn and the experimental yarn workspaces for package.json splitting and convenience.

Please install the last version of yarn and run:<br/>
`yarn config set workspaces-experimental true`

Then run:<br/>
`yarn install`


For testing and developing on the projet with true hot module replacement, run  
`yarn start`

Now explore `src/app` files.
If you modify the console.log in `abstract.js` you will trigger an error.

Change the call in `index.js` for exporting with `SurnameWithabstract`, there will be no errors.
