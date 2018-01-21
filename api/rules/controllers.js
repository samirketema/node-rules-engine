var handleRouteError = require('../utils').handleRouteError;
var _ = require('underscore');
var lodash = require('lodash');
var Operator = require('../operators/controllers');

/* 
  Made rules private to this module.
  Initialized to the 4 sample rules provided
*/
let rulesRegistry = require('./rules.json');

/* 
  Return rules kept in the rules registry.
*/
function retrieveRules () {
  return rulesRegistry;
}

/* 
  GET /rules 
  Return all rules that are currently in the system.
*/
exports.getRules = function (req, res) {
  return res.status(200).json(retrieveRules());
};


/* 
  POST /rules
  Add a new rule. If there is an rule with the same name,
  overwrite that rule.
  Req: JSON representing a new rule to add to the rules registry
*/
exports.addRule = function (req, res) {
  res.status(400);
};

/*
  DELETE /rule
  Delete a rule if one with the provided name exists.
  Req: contains name of the rule to delete
*/
exports.deleteRule = function (req, res) {
};

/*
  Checks if a Operand is a rule (whether top-level or nested)
  Input: Operand 
  Output: boolean detailing if the operand is a rule.
*/
function isRule(obj) {
  return _.isObject(obj) && obj.hasOwnProperty('operator') && obj.hasOwnProperty('operands');
}

/*
  Evaluates an operand. A operand is a token that is either a rule, value, or field.
  Input: Operand
  Output: 
  For the different types, this function returns different values:
  - Rule
    returns result of applying operator against internal operands
  - Value
    returns literal value from JSON
  - Field
    returns field from userInput
  - None of the above
    returns false to stop processing of this operand.
*/
exports.evaluateOperand = function (operand, userInput) {
  if (isRule(operand)) {
    try {
      return Operator.retrieveOperators()[operand.operator](operand, userInput);
    } catch (e) {
      throw e;
    }
  }

  //return value
  if (operand.hasOwnProperty('value')) {
    return operand.value;
  }

  //return field
  if (operand.hasOwnProperty('field')) {
    let field = lodash.get(userInput, operand.field, false);
    if (field === false) {
      throw new Error('field ' + operand.field + ' not found in input');
    }
    return lodash.get(userInput, operand.field, false);
  }
  throw new Error('invalid operand structure');
}

/*
  This function applies all rules in the rules registry against the user's input.
  Input: userInput
  Output: a list of failed rules
*/
exports.applyRules = function (userInput) {
  /* Iterates through rules and applies each to userInput
    Realistically, this work can be done in parallel, but we're limited by the
    single-threaded nature of node.js if our rules registry grows very large (say thousands of rules).
    This is where an environment like Golang or Java could help us as we could 
    utilize multithreading (or goroutines in go).
  */
  let failures = [];
  let rules = retrieveRules();
  try {
    _.each(rules, function (rule) {
      let result = exports.evaluateOperand(rule.rule, userInput);
      if (typeof result !== 'boolean' || !result) {
        failures.push(rule.name);
      }
    });
  return failures;
  } catch (e) {
    throw e;
  }
};