var handleRouteError = require('../utils').handleRouteError;
var _ = require('underscore');
var lodash = require('lodash');

//Operators is private to this module.
let operators = {
  /* 
    Returns the length of a string or collection (object/array)
  */
  LENGTH: {
    numParameters: 1,
    apply: function (valueArr) {
      return lodash.size(valueArr[0]);
    }
  },
  /* 
    Returns the result of applying an input regular expression against the input.
  */
  REGEX_MATCH: {
    numParameters: 2,
    apply: function (valueArr) {
      return new RegExp(valueArr[0]).test(valueArr[1]);
    }
  },
  /* 
    Performs an equality check between two items. 
    If the first parameter is a string or number, the second parameter will be converted as such. 
    As a fallback, it performs a strict equality (===)
  */
  EQUAL_TO: {
    numParameters: 2,
    apply: function (valueArr) {
      let left = valueArr[0];
      let right = valueArr[1];
      if (_.isString(left)) {
        right = String(right);
      } else if (_.isNumber(left)) {
        right = Number(right);
      }
      return left === right;
    }
  },
  /*
    Performs a greater than check between two numbers.
  */
  GREATER_THAN: {
    numParameters: 2,
    apply: function (valueArr) {
      return Number(valueArr[0]) > Number(valueArr[1]);
    }
  },
  /*
    Performs a logical OR amongst items in an array.
    Does not semantically continue evaluation once true is found.
  */
  OR: {
    numParameters: -1,
    apply: function (valueArr) {
      for (let i = 0; i < valueArr.length; i++) {
        if (_.isBoolean(valueArr[i]) && valueArr[i]) {
          return true;
        }
      }
      return false;
    }
  },
  /*
    Performs a logical AND amongst items in an array.
    Does not senamtically continue evaluation once false is found.
  */
  AND: {
    numParameters: -1,
    apply: function (valueArr) {
      for (let i = 0; i < valueArr.length; i++) {
        if (_.isBoolean(valueArr[i]) && !valueArr[i]) {
          return false;
        }
      }
      return true;
    }
  }
};

/* 
  Get all operators currently insite operator registry
*/
exports.retrieveOperators = function () {
  return operators;
};

/*  
  GET /operators 
  Retrieve all operators currently inside the operators registry.
*/
exports.getOperators = function (req, res) {
  return res.status(200).json(retrieveOperators());
};
