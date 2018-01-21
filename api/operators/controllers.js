var handleRouteError = require('../utils').handleRouteError;
var underscore = require('underscore');
var lodash = require('lodash');
var Rule = require('../rules/controllers');

//Operators is private to this module.
let operators = {
  /* 
    Returns the length of a string or collection (object/array)
  */
  LENGTH: function (rule, userInput) {
    if (rule.operands.length !== 1) {
      throw new Error('LENGTH requires 1 operand, number of operands: ' + rule.operands.length);
    }
    let field = Rule.evaluateOperand(rule.operands[0], userInput);
    return lodash.size(field);
  },
  /* 
    Returns the result of applying an input regular expression against the input.
  */
  REGEX_MATCH: function (rule, userInput) {
    if (rule.operands.length !== 2) {
      throw new Error('REGEX_MATCH requires 2 operands, number of operands: ' + rule.operands.length);
    }
    let expression = Rule.evaluateOperand(rule.operands[0], userInput);
    let field = Rule.evaluateOperand(rule.operands[1], userInput);
    return new RegExp(expression).test(field);
  },
  /* 
    Performs an equality check between two items. 
    If the first parameter is a string or number, the second parameter will be converted as such. 
    As a fallback, it performs a strict equality (===)
  */
  EQUAL_TO: function (rule, userInput) {
    if (rule.operands.length !== 2) {
      throw new Error('EQUAL_TO requires 2 operands, number of operands: ' + rule.operands.length);
    }
    let left = Rule.evaluateOperand(rule.operands[0], userInput);
    let right = Rule.evaluateOperand(rule.operands[1], userInput);
    if (typeof left === 'string') {
      right = String(right);
    } else if (typeof left === 'number') {
      right = Number(right);
    }
    return left === right;
  },
  /*
    Performs a greater than check between two numbers.
  */
  GREATER_THAN: function (rule, userInput) {
    if (rule.operands.length !== 2) {
      throw new Error('GREATER_THAN requires 2 operands, number of operands: ' + rule.operands.length);
    }
    let leftResult = Number(Rule.evaluateOperand(rule.operands[0], userInput));
    let rightResult = Number(Rule.evaluateOperand(rule.operands[1], userInput));
    return leftResult > rightResult;   
  },
  /*
    Performs a logical OR amongst items in an array.
    Does not semantically continue evaluation once true is found.
  */
  OR: function (rule, userInput) {
    if (rule.operands.length === 0) {
      throw new Error('OR requires at least 1 operand');
    }
    for (let i = 0; i < rule.operands.length; i++) {
      if (Rule.evaluateOperand(rule.operands[i], userInput)) {
        return true;
      }
    }
    return false;
  },
  /*
    Performs a logical AND amongst items in an array.
    Does not senamtically continue evaluation once false is found.
  */
  AND: function (rule, userInput) {
    if (rule.operands.length === 0) {
      throw new Error('AND requires at least 1 operand');
    }
    for (let i = 0; i < rule.operands.length; i++) {
      if (!Rule.evaluateOperand(rule.operands[i], userInput)) {
        return false;
      }
    }
    return true;
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
