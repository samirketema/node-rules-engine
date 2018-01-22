var handleRouteError = require('../utils').handleRouteError;
var _ = require('underscore');
var lodash = require('lodash');
var ExternalOperators = require('./external-operators');

//Operators is private to this module.
let operators = {
  /* 
    Returns the length of a string or collection (object/array)
  */
  LENGTH: {
    name: 'LENGTH',
    numParameters: 1,
    apply: function (valueArr) {
      return lodash.size(valueArr[0]);
    }
  },
  /* 
    Returns the result of applying an input regular expression against the input.
  */
  REGEX_MATCH: {
    name: 'REGEX_MATCH',
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
    name: 'EQUAL_TO',
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
    name: 'GREATER_THAN',
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
    name: 'OR',
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
    name: 'AND',
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

const FIVE_MINS_IN_MS = 1000;

function loadExternalOperators() {
  let externalOperators = ExternalOperators.retrieveExternalOperators();
  _.each(externalOperators, function (operator) {
    operators[operator.name] = operator;
  });
};

setInterval(loadExternalOperators, FIVE_MINS_IN_MS);

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
  //Convert Functions to Strings
  let jsonFriendlyResponse = {};
  _.each(exports.retrieveOperators(), function (o, name) {
    var resOperator = {};
    resOperator.numParameters = o.numParameters;
    resOperator.apply = o.apply.toString().replace(/(\\r)|(\\n)/g,"\n");
    jsonFriendlyResponse[name] = resOperator;
  });
  return res.status(200).json(jsonFriendlyResponse);
};
