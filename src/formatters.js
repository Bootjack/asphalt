// Core libraries
const {Transform} = require('stream');

const types = require('./types');
const {ARRAY_TYPE_REGEX} = require('./constants');

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
  const isArrayType = ARRAY_TYPE_REGEX.test(type);
  const propType = isArrayType ? types[type.match(ARRAY_TYPE_REGEX)[1]] : types[type];

  const formatter = propType.formats[prop.format || 'default'];
  const arrayFormatter = propType.formats[prop.arrayFormat || 'array'];
  const value = item[key];

  if (isArrayType) {
    return arrayFormatter(value.map(val => formatter(val)).filter(val => !!val));
  }

  const val = formatter(value);
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
