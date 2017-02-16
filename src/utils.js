// Core libraries
const fs = require('fs');
const path = require('path');

const proc = require('./proc');

// Asphalt modules
const {
  ARRAY_TYPE_REGEX,
  DEFAULT_CONFIG
} = require('./constants');
const types = require('./types');

function generateId() {
  return Math.random().toString(36).replace(/[\.\d]+/g, '').substring(0, 5);
}

function genericErrorHandler(err) {
  const message = Object.keys(err).reduce((acc, key) => `${acc}${key}: ${err[key]}\n`, '');
  proc.stdout.write(`
Asphalt has encountered an error.
The latest command may not have completed successfully.
`);
  throw new Error(message);
}

function getAsphaltConfig(configPath = 'asphalt.json') {
  return new Promise((resolve, reject) => {
    fs.readFile(configPath, (err, data) => {
      if (!err) {
        try {
          const parsed = JSON.parse(data);
          proc.stdout.write(`Using configuration found in ${configPath}\n`);
          resolve(parsed);
        } catch (e) {
          proc.stderr.write(`Unable to parse ${configPath}\n`);
          proc.stderr.write(`${String(e)}\n`);
          proc.stdout.write('Falling back to default configuration\n');
          resolve(DEFAULT_CONFIG);
        }
      } else if (err.code === 'ENOENT') {
        proc.stdout.write(`Using default configuration (Specify local configuration in ${configPath})\n`);
        resolve(DEFAULT_CONFIG);
      } else {
        reject(err);
      }
    });
  });
}

function makeAsphaltDirectory(config) {
  return new Promise((resolve, reject) => {
    fs.mkdir(config.basePath, err => {
      if (!err || err.code === 'EEXIST') {
        resolve(config);
      } else {
        reject(err);
      }
    });
  });
}

function serializePropType(type, value) {
  const isArrayType = ARRAY_TYPE_REGEX.test(type);
  const propType = isArrayType ? types[type.match(ARRAY_TYPE_REGEX)[1]] : types[type];
  const serialize = (propType && propType.serialize);

  if (isArrayType) {
    return value.map(val => serialize(val));
  }

  return serialize(value);
}

function assignPropType(type, value) {
  const isArrayType = ARRAY_TYPE_REGEX.test(type);
  const propType = isArrayType ? types[type.match(ARRAY_TYPE_REGEX)[1]] : types[type];
  const deserialize = (propType && propType.deserialize);

  if (isArrayType) {
    return [].concat(value)
      .map(val => (val.trim ? val.trim() : val))
      .map(val => deserialize(val))
      .filter(val => val);
  }

  return deserialize(value);
}

function assignElementPropTypes(schema, element) {
  return Object.keys(element).reduce((accumulator, prop) => {
    const next = {};
    next[prop] = assignPropType(schema[prop] || 'ID', element[prop]);
    return Object.assign({}, accumulator, next);
  }, {});
}

function getSavedElements(filepath, schema) {
  return new Promise((resolve, reject) => {
    fs.readFile(filepath, (readErr, content) => {
      if (readErr) {
        if (readErr.code === 'ENOENT') {
          resolve([]);
        } else {
          reject(readErr);
        }
      } else {
        try {
          const data = JSON.parse(content).map(assignElementPropTypes.bind(this, schema));
          resolve(data);
        } catch (parseErr) {
          reject(`Unable to parse saved data at ${filepath}\n`);
        }
      }
    });
  });
}

function populateElementStore(config) {
  const store = {};
  const promises = Object.keys(config.schema).map(name => {
    const filepath = path.resolve(config.basePath, `${name}.json`);
    return getSavedElements(filepath, config.schema[name]).then(elements => {
      store[name] = elements;
    });
  });
  return Promise.all(promises).catch(err => proc.stderr.write(err)).then(() => store);
}

module.exports = {
  assignElementPropTypes,
  assignPropType,
  generateId,
  genericErrorHandler,
  getAsphaltConfig,
  getSavedElements,
  makeAsphaltDirectory,
  populateElementStore,
  serializePropType
};
