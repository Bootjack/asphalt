const {Readable} = require('stream');
const formatters = require('../../src/formatters');
const moment = require('moment');

describe('Formatters', () => {
  const elements = [{
    name: 'Rey',
    alignment: 'Light',
    born: moment('1990-07-31')
  }, {
    name: 'Kylo',
    alignment: 'Dark',
    born: moment('1990-08-02')
  }];

  const schema = {
    name: 'String',
    alignment: 'String',
    born: 'Date'
  };

  describe('itemDetails', () => {
    it('lists all properties for an element', () => {
      const formatter = formatters.itemDetailFormatter(undefined, schema);
      formatter.write(elements[0]);
      expect(String(formatter.read())).toBe('name: Rey\nalignment: Light\nborn: 1990-07-31\n');
    });
    it('lists only specified keys for an element', () => {
      const formatter = formatters.itemDetailFormatter(['alignment'], schema);
      formatter.write(elements[0]);
      expect(String(formatter.read())).toBe('alignment: Light\n');
    });
    it('respects formatting configuration', () => {
      const formatter = formatters.itemDetailFormatter([{key: 'born', format: 'MM-DD'}], schema);
      formatter.write(elements[0]);
      expect(String(formatter.read())).toBe('born: 07-31\n');
    });
  });

  describe('itemSummary', () => {
    it('lists items in tab-delimited rows', () => {
      const formatter = formatters.itemSummaryFormatter(undefined, schema);
      formatter.write(elements[1]);
      expect(String(formatter.read())).toBe('Kylo\tDark\t1990-08-02\n');
    });
    it('lists only specified keys for each element', () => {
      const formatter = formatters.itemSummaryFormatter(['name'], schema);
      formatter.write(elements[1]);
      expect(String(formatter.read())).toBe('Kylo\n');
    });
  });
});
