const _ = require('lodash');

function caseInsensitiveComparator(value, other, key) {
  if (_.isString(value) && _.isString(other)) {
    return value.toLowerCase() === other.toLowerCase();
  }
}

function isCaseInsensitiveEqual(object, other, excludedFields) {
  const filteredObject = _.omit(object, excludedFields);
  const filteredOther = _.omit(other, excludedFields);
  return _.isEqualWith(filteredObject, filteredOther, caseInsensitiveComparator);
}

module.exports = isCaseInsensitiveEqual;