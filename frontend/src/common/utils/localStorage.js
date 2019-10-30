if (typeof localStorage === 'undefined' || localStorage === null) {
  /* eslint no-native-reassign: "off" */
  const LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('./localStorage');
}

export default localStorage;
