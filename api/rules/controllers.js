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
  Stack that keeps track of operators & operands through validation
*/
let operandStack = [];

/*
  Stack that keeps track of values only through validation 
*/
let valueStack = [];

/* 
  Return rules kept in the rules registry.
*/
function retrieveRules () {
  return rulesRegistry;
}


function retrieveRule (name) {
  return rulesRegistry[name];
}

/* 
  GET /rules 
  Return all rules that are currently in the system.
*/
exports.getRules = function (req, res) {
  return res.status(200).json(retrieveRules());
};

/*
  GET /rule/name/:name
  Return a rule with the key 'name' if it exists.
*/
exports.getRule = function (req, res) {
  //If the request doesn't have the name param, send 400
  if (!req.params.name) {
    return res.status(400).json({
      'message': 'No name provided in request parameters.'
    });
  }
  //Check if the rule was found
  let rule = retrieveRule(req.params.name);
  //If found, return the rule.
  if (rule) {
    return res.status(200).json(rule);
  }
  //Otherwise, return a 404 since the resource was not found
  return res.status(404).json({
    'message': 'Rule \'' + req.params.name + '\' not found in rules registry.'
  });
};

/* 
  POST /rules
  Add a new rule. If there is an rule with the same name,
  overwrite that rule.
  Req: JSON representing a new rule to add to the rules registry
*/
// exports.addRule = function (req, res) {
//   if (!req.body) {
//     return res.status(400).json({
//       'message': 'No body provided in request.'
//     });
//   }
//   let rule = req.body;

//   //Validate top level of rule structure
//   if (_.isString(rule.name) || _.isObject(rule.rule)) {
//     return res.status(400).json({
//       'message': 'rule structure invalid'
//     });
//   }

//   //Add the rule

//   //Still in progress!
// };

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
  Output: Boolean value

  This utilizes two stacks, one to keep operands as they are evaluated (similar to polish notation),
  and another to keep values which are determined from operands. This iterative approach uses less 
  memory for deeply nested rules as it will not add more frames to the call stack when evaluating
  different levels of rules.
*/
function evaluateRuleIterative (rule, userInput) {
  let operators = Operator.retrieveOperators();
  operandStack.push(rule);
  
  //Keep evaluating operands while we have them.
  while (!_.isEmpty(operandStack)) {
    //Get the current operand
    let currElement = operandStack.pop();

    //If the current operand is a rule, then push the operator and each of the operands onto the stack.
    if (currElement.hasOwnProperty('operator') && currElement.hasOwnProperty('operands')) {
      operandStack.push({
        operator: currElement.operator,
        size: currElement.operands.length
      });
      currElement.operands.forEach(function (o) {
        operandStack.push(o);
      });

    //If the current operand is a value, push the value to the value stack.
    } else if (currElement.hasOwnProperty('value')) {
      if (!_.isString(currElement.value)) {
        throw new Error ('Rule Structure invalid: value is not a string. value=' + currElement.value);
      }
      valueStack.push(currElement.value);

    //If the current operand is a field, push the field to the value stack if found.
    } else if (currElement.hasOwnProperty('field')) {
      let field = lodash.get(userInput, currElement.field, false);
      if (field === false) {
        throw new Error('Field ' + currElement.field + ' not found in user input JSON');
      }
      valueStack.push(field);

    //If the current operand is an operator, evaluate the operator against values in the value stack.
    } else if (currElement.hasOwnProperty('operator')) {
      if (valueStack.length < currElement.size) {
        throw new Error('Rule structure invalid: not enough values for operator ' + currElement.operator);
      }
      let numParameters = operators[currElement.operator].numParameters;

      // -1 denotes a flexible amount of parameters for the operator (e.g. OR)
      if (numParameters !== -1 && numParameters !== currElement.size) {
        throw new Error('Rule structure invalid: number of params !== number of. values=' + currElement.size + ', ' + currElement.operator +'=' + numParameters);
      }
      //Pop the desired number of values from value stack.
      let values = [];
      for (let i = 0; i < currElement.size; i++) {
        values.push(valueStack.pop());
      }
      //push the result
      valueStack.push(operators[currElement.operator].apply(values));
    } else {
      throw new Error('Rule structure invalid: incorrect operand structure');
    }
  }

  //When the operand stack is empty, there should just be a single boolean value of whether or not the rule passed:
  if (valueStack.length !== 1) {
    throw new Error('Rule structure invalid: did not reduce down to single boolean value.')
  }

  let result = valueStack.pop();
  if (!_.isBoolean(result)) {
    throw new Error ('Rule validation error: Final value not a boolean. value=' + value);
  }
  
  return result;
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
      operandStack = [];
      valueStack = [];
      let result = evaluateRuleIterative(rule.rule, userInput);
      if (!_.isBoolean(result) || !result) {
        failures.push(rule.name);
      }
    });
  return failures;
  } catch (e) {
    throw e;
  }
};