// Core libraries
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const {
  Readable,
  Transform,
  Writable
} = require('stream');

const proc = require('../proc');

// Asphalt libraries
const {ARRAY_TYPE_REGEX} = require('../constants');
const initialize = require('../init');
const {
  assignPropType,
  generateId,
  genericErrorHandler,
  serializePropType
} = require('../utils');

// Convert schema into a stream of [name, type] pairs
function createSchemaDefinitionStream(schema) {
  const schemaPairs = Object.keys(schema).map(name => ({name, type: schema[name]}));
  if (!schemaPairs.some(pair => 'id' === pair.name)) {
    schemaPairs.unshift({name: 'id', type: 'ID'});
  }
  return new Readable({
    objectMode: true,
    read() {
      this.push(schemaPairs.shift() || null);
    }
  });
}

// Consume schema stream and prompt user for input
function createSchemaPromptStream() {
  function ask(push, next, chunk, accumulator) {
    const {name, type} = chunk;
    const rl = readline.createInterface({
      input: proc.stdin,
      output: proc.stdout
    });

    rl.question(`${name} (${type}): `, value => {
      rl.close();
      const trimmed = value.trim();
      let parsed;
      try {
        parsed = JSON.parse(trimmed);
      } catch (err) {
        parsed = trimmed;
      }
      const typed = assignPropType(type, parsed);
      const forward = accumulator ? [].concat(accumulator, typed) : typed;
      if (ARRAY_TYPE_REGEX.test(type) && typed.length) {
        ask(push, next, chunk, forward);
      } else {
        const result = Object.assign({}, chunk, {value: forward});
        push(result);
        next();
      }
    });
  }

  return new Transform({
    objectMode: true,
    transform(chunk, enc, next) {
      const {type} = chunk;
      if ('ID' === type) {
        const result = Object.assign({}, chunk, {value: generateId()});
        this.push(result);
        next();
      } else {
        ask(this.push.bind(this), next, chunk);
      }
    }
  });
}

// Consume user input and write created object stream
function createElementConsumer() {
  const result = {};
  return new Transform({
    objectMode: true,
    transform(chunk, enc, next) {
      const {name, type, value} = chunk;
      result[name] = serializePropType(type, value);
      this.push(result);
      next();
    }
  });
}

// Handle the resulting created object
function saveElement(config, name, branch) {
  const filepath = path.resolve(config.basePath, `${name}.json`);
  let latest;

  return new Writable({
    objectMode: true,
    write(chunk, enc, next) {
      latest = chunk;
      next();
    }
  }).on('finish', () => {
    const modifiedBranch = branch.concat(latest);
    const stringifiedBranch = JSON.stringify(modifiedBranch, null, config.indent);
    fs.writeFile(filepath, `${stringifiedBranch}\n`, err => {
      if (err) {
        proc.stderr.write(`An error occurred saving your ${name} change: ${err}`);
      } else {
        proc.stdout.write(`\nCreated ${name} ${latest.id}\n`);
      }
    });
  });
}

module.exports = function create(schema, args) {
  initialize().then(init => {
    const {config, store} = init;
    createSchemaDefinitionStream(config.schema[schema])
      .pipe(createSchemaPromptStream())
      .pipe(createElementConsumer())
      .pipe(saveElement(config, schema, store[schema]));
  }).catch(genericErrorHandler);
};
