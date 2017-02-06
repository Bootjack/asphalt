// Core libraries
const {Transform} = require('stream');

const types = require('./types');

function formatterFactory(format) {
  return function formatter(props, schema = {}) {
    return new Transform({
      readableObjectMode: false,
      writableObjectMode: true,
      transform(chunk, enc, next) {
        format(props, schema, chunk, line => this.push(`${line}\n`));
        next();
      }
    });
  };
}

function getPropKey(prop) {
  return ('object' === typeof prop ? prop.key : prop);
}

function getPropValue(prop, key, type = 'String', item) {
  let formatter = val => val;
  if ('object' === typeof prop) {
    formatter = types[type].formats[prop.format] || formatter;
  }
  const val = formatter(item[key]);
  return (undefined === val ? '' : val);
}

function itemDetails(keys, schema, item, push) {
  const props = keys || Object.keys(item);
  props.forEach(prop => {
    const key = getPropKey(prop);
    const val = getPropValue(prop, key, schema[key], item);
    push(`${key}: ${val}`);
  });
}

function itemSummary(keys, schema, item, push) {
  const props = keys || Object.keys(item);
  const summary = props.map(prop => {
    const key = getPropKey(prop);
    return getPropValue(prop, key, schema[key], item);
  }).join('\t');
  push(summary);
}

module.exports = {
  itemDetailFormatter: formatterFactory(itemDetails),
  itemSummaryFormatter: formatterFactory(itemSummary)
};
