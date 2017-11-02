// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

/** SAME AS STAGING FOR NOW **/

export const environment = {
  production: false,
  envName: 'staging',
  url: "https://staging.oevent.com",
  firebaseConfig: {
    apiKey: "AIzaSyDP_CeXVzS-0p46Rb6Q2g6N0CIi8H3LCB0",
    authDomain: "oevent-staging.firebaseapp.com",
    databaseURL: "https://oevent-staging.firebaseio.com",
    projectId: "oevent-staging",
    storageBucket: "oevent-staging.appspot.com",
    messagingSenderId: "617317956709"
  },
  SEARCH_LIVE_EVENTS: {
    url:"dori-us-east-1.searchly.com",
    index:"live-events",
    key:"kzv8ntali8iffhfvcxhk1noqhwfigccp",
    access_key_name:"read_only"
  },
  EVENT_INDEXING: {
    url:"https://site:ace82d6d57b82045c502c884e524cb6e@nori-us-east-1.searchly.com"
  },

};
