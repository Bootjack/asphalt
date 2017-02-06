const moment = require('moment');
const types = require('../../src/types');

describe('Types', () => {
  describe('Boolean', () => {
    it('serializes to a boolean', () => {
      const {serialize} = types.Boolean;
      expect(serialize(true)).toBe(true);
      expect(serialize(false)).toBe(false);
    });
    it('deserializes to a boolean', () => {
      const {deserialize} = types.Boolean;
      expect(deserialize(true)).toBe(true);
      expect(deserialize(false)).toBe(false);
    });
    it('validates user input', () => {
      const {validate} = types.Boolean;
      expect(validate(true)).toBe(true);
      expect(validate(false)).toBe(true);
    });
  });
  describe('Date', () => {
    it('serializes to an ISO 8601 date string', () => {
      const {serialize} = types.Date;
      const isoRegex = /^\d{4}-\d{2}-\d{2}/;
      expect(serialize(moment())).toMatch(isoRegex);
    });
    it('deserializes to a moment', () => {
      const {deserialize} = types.Date;
      expect(deserialize('2017-01-01').isValid()).toBe(true);
      expect(deserialize('01/01/2017')).toBe('');
    });
    it('validates user input', () => {
      const {validate} = types.Date;
      expect(validate('2017-01-01')).toBe(true);
      expect(validate('January 1st')).toBe(false);
    });
  });
  describe('Number', () => {
    it('serializes to a number', () => {
      const {serialize} = types.Number;
      expect(serialize(12)).toBe(12);
    });
    it('deserializes to a number', () => {
      const {deserialize} = types.Number;
      expect(deserialize(12)).toBe(12);
    });
    it('validates user input', () => {
      const {validate} = types.Number;
      expect(validate(7)).toBe(true);
      expect(validate('7')).toBe(false);
    });
  });
  describe('Semver', () => {
    const release = {
      major: 1,
      minor: 2,
      patch: 3
    };
    it('serializes to a string', () => {
      const {serialize} = types.Semver;
      expect(serialize(release)).toBe('1.2.3');
    });
    it('deserializes from a string', () => {
      const {deserialize} = types.Semver;
      expect(deserialize('1.2.3')).toEqual(release);
    });
    it('validates user input', () => {
      const {validate} = types.Semver;
      expect(validate('1.2.3')).toBe(true);
      expect(validate('1.23.3456')).toBe(true);
      expect(validate('1.2.3-alpha.rc.2235')).toBe(true);
      expect(validate('1.23')).toBe(false);
      expect(validate('stable')).toBe(false);
    });
  });
  describe('String', () => {
    it('serializes to a string', () => {
      const {serialize} = types.String;
      expect(serialize('Turkey')).toBe('Turkey');
    });
    it('deserializes to a string', () => {
      const {deserialize} = types.String;
      expect(deserialize('Aardvark')).toBe('Aardvark');
    });
    it('validates user input', () => {
      const {validate} = types.String;
      expect(validate('Nineteen')).toBe(true);
      expect(validate(19)).toBe(false);
    });
  });
});
