const mock = require('mock-require');
const {defaultSchema} = require('../helpers/schema-fixtures');
const {DEFAULT_CONFIG} = require('../../src/constants');

let utils;

describe('Utilities', () => {
  beforeAll(() => {
    mock('../../src/proc', '../helpers/process-mock');
    mock('fs', '../helpers/fs-mock');
    mock('path', '../helpers/path-mock');
    utils = require('../../src/utils');
  });

  describe('assignElementPropTypes()', () => {
    beforeEach(() => {
      spyOn(utils, 'assignPropType');
    });

    it('returns a new object', () => {
      const element = {
        name: 'George'
      };
      const typedElement = utils.assignElementPropTypes(defaultSchema, element);
      expect(typedElement).not.toBe(element);
    });
  });

  describe('assignPropType', () => {
    it('deserializes a value', () => {
      const string = utils.assignPropType('String', 'William');
      expect(string).toBe('William');
    });
    it('deserializes an array of values', () => {
      const strings = utils.assignPropType('[String]', ['William', 'Jefferson']);
      expect(strings).toEqual(['William', 'Jefferson']);
      const numbers = utils.assignPropType('[Number]', [1, 2]);
      expect(numbers).toEqual([1, 2]);
    });
  });

  describe('generateId()', () => {
    it('generates a five-character identifier', () => {
      expect(utils.generateId()).toMatch(/[a-z]{5}/);
    });
  });

  describe('genericErrorHandler', () => {
    it('includes the error text', () => {
      function triggerErrorHandler() {
        utils.genericErrorHandler({key: 'val'});
      }
      expect(triggerErrorHandler).toThrowError(/key: val/);
    });
  });

  describe('getAsphaltConfig', () => {
    it('returns a promise with the parsed configuration', done => {
      utils.getAsphaltConfig().then(config => {
        expect(config.foo).toBe('bar');
        done();
      });
    });
    describe('falls back to default configuration', () => {
      it('when a parse error occurs', done => {
        utils.getAsphaltConfig('not.valid.json').then(data => {
          expect(data).toEqual(DEFAULT_CONFIG);
          done();
        });
      });
      it('when no configuration file is present', done => {
        utils.getAsphaltConfig('not.a.file').then(data => {
          expect(data).toEqual(DEFAULT_CONFIG);
          done();
        });
      });
    });
    it('rejects the promise on error while loading the configuration', done => {
      const failSpy = jasmine.createSpy('failSpy');
      utils.getAsphaltConfig('other.error').catch(failSpy).then(() => {
        expect(failSpy).toHaveBeenCalled();
        done();
      });
    });
  });

  describe('getSavedElements', () => {
    const schema = {id: 'String'};
    it('returns a promise that resolves with saved items array', done => {
      utils.getSavedElements('feature.json', schema).then(elements => {
        expect(elements instanceof Array).toBe(true);
        expect(elements.length).toBe(2);
        expect(elements[0]).toEqual({id: 'alpha'});
        done();
      });
    });
    it('resolves with an empy array if no file exists', done => {
      utils.getSavedElements('not.a.file', schema).then(elements => {
        expect(elements instanceof Array).toBe(true);
        expect(elements.length).toBe(0);
        done();
      });
    });
    it('rejects the promise on any other error', done => {
      const failSpy = jasmine.createSpy('failSpy');
      return utils.getSavedElements('other.error', schema).catch(failSpy).then(() => {
        expect(failSpy).toHaveBeenCalled();
        done();
      });
    });
  });

  describe('makeAsphaltDirectory', () => {
    it('returns a promise that resolves with the given configuration', done => {
      const config = {basePath: 'asphalt'};
      utils.makeAsphaltDirectory(config).then(conf => {
        expect(conf.basePath).toBe('asphalt');
        done();
      });
    });
    it('resolves correctly even if the directory already exists', done => {
      const config = {basePath: 'asphalt.duplicate'};
      utils.makeAsphaltDirectory(config).then(conf => {
        expect(conf).toBe(config);
        done();
      });
    });
    it('rejects the promise if any other error occurs', done => {
      const failSpy = jasmine.createSpy('failSpy');
      const config = {basePath: 'other.error'};
      return utils.makeAsphaltDirectory(config).catch(failSpy).then(() => {
        expect(failSpy).toHaveBeenCalled();
        done();
      });
    });
  });

  describe('populateElementStore', () => {
    it('returns a promise that resolves with a populated store', done => {
      const config = {
        schema: {
          feature: {
            id: 'String'
          }
        }
      };
      utils.populateElementStore(config).then(store => {
        expect(store.feature instanceof Array).toBe(true);
        expect(store.feature.length).toBe(2);
        expect(store.feature[0]).toEqual({id: 'alpha'});
        done();
      });
    });
    it('resolves even when an error occurs while reading saved elements', done => {
      const proc = require('../../src/proc');
      const stderrSpy = spyOn(proc.stderr, 'write');
      const config = {
        schema: {
          error: {
            id: 'String'
          }
        }
      };
      utils.populateElementStore(config).then(store => {
        expect(stderrSpy).toHaveBeenCalled();
        expect(store).toBeDefined();
        done();
      });
    });
  });

  describe('serializePropType', () => {
    it('serializes a value', () => {
      const serial = utils.serializePropType('String', 'Marty');
      expect(serial).toBe('Marty');
    });
    it('serializes an array of values', () => {
      const serialStrings = utils.serializePropType('[String]', ['Ron', 'Harry', 'Hermione']);
      expect(serialStrings).toEqual(['Ron', 'Harry', 'Hermione']);
      const serialNumbers = utils.serializePropType('[Number]', [5, 4, 3]);
      expect(serialNumbers).toEqual([5, 4, 3]);
    });
  });

  afterAll(() => {
    mock.stop('fs');
    mock.stop('path');
    mock.stop('../../src/proc');
  });
});
