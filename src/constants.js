const ARRAY_TYPE_REGEX = /^\[(\w+)\]$/;
const ID_REGEX = /^[a-z]{5}$/;
const ISO_8601_REGEX = /^\d{4}-\d{2}-\d{2}/;
const SEMVER_REGEX = /^(\d+)\.(\d+)\.(\d+)/;

/*
* The configuration object needs to specify the following things related to saved data:
*  1. √ the schema of each property data type
*  2. √ which properties to display in which context
*  3. √ and what string format to use on each property (in each context).
*  4. _ how to sort the items results
* TODO Revise the format config to suit the needs stated above
*/

const DEFAULT_CONFIG = {
  basePath: '.asphalt',
  indent: 2,
  schema: {
    feature: {
      title: 'String',
      description: 'String',
      acceptance: '[String]',
      started: 'Date',
      completed: 'Date'
    },
    milestone: {
      version: 'Semver',
      title: 'String',
      description: 'String'
    }
  },
  format: {
    feature: {
      status: [
        'id',
        'title',
        {key: 'started', format: 'YYYY-MM-DD'},
        {key: 'completed', format: 'YYYY-MM-DD'}
      ]
    }
  }
};

module.exports = {
  ARRAY_TYPE_REGEX,
  DEFAULT_CONFIG,
  ID_REGEX,
  ISO_8601_REGEX,
  SEMVER_REGEX
};
