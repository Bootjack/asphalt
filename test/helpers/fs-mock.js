const errors = {
  'error.json': () => ({
    err: {code: 'OTHERERROR'}
  }),
  'other.error': () => ({
    err: {code: 'OTHERERROR'}
  }),
  'actual.error': () => {
    throw new Error('Totally Legit Error');
  }
};

const directoriesToMake = Object.assign({}, errors, {
  asphalt: () => ({
    err: undefined
  }),
  'asphalt.duplicate': () => ({
    err: {code: 'EEXIST'}
  })
});

const filesToRead = Object.assign({}, errors, {
  'asphalt.json': () => ({
    data: '{"foo": "bar"}'
  }),
  'feature.json': () => ({
    data: `[
      {"id": "alpha"},
      {"id": "bravo"}
    ]`
  }),
  'milestone.json': () => ({
    data: `[
      {"version": "0.1.0"},
      {"version": "0.1.1"}
    ]`
  }),
  'not.a.file': () => ({
    err: {code: 'ENOENT'}
  }),
  'not.valid.json': () => ({
    data: 'foo = bar(baz);'
  })
});

function mkdir(path, callback) {
  const {err} = directoriesToMake[path]();
  callback(err);
}

function readFile(path, callback) {
  const {err, data} = filesToRead[path]();
  callback(err, data);
}

module.exports = {
  mkdir,
  readFile
};
