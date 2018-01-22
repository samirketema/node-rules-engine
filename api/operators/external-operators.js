let externalOperators = {
  /*
    Performs a less than check between two numbers.
  */
  LESS_THAN: {
    name: 'LESS_THAN',
    numParameters: 2,
    apply: function (valueArr) {
      return Number(valueArr[0]) < Number(valueArr[1]);
    }
  },
};

exports.retrieveExternalOperators = function () {
  return externalOperators;
};