const proc = require('../proc');

const initialize = require('../init');
const {genericErrorHandler} = require('../utils');

const boilerplate = `
USAGE
asphalt command [arguments...]

COMMANDS
create type     Create a new record of the given type. This will prompt for each field of the new record.
status type     Show the status of all records of the given type.
show type id    Show details about the record of the given type with the given id.
help            Display this message
`;

function createTypeList(store) {
  return Object.keys(store).reduce((acc, key) => `${acc}${key}\n`, '\nTYPES\n');
}

module.exports = function help(schema, args) {
  return initialize().then(init => {
    proc.stdout.write(boilerplate + createTypeList(init.store));
  }).catch(genericErrorHandler);
};
