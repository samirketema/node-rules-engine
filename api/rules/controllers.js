var handleRouteError = require('../utils').handleRouteError;

/* 
  Made rules private to this module.
  Initialized to the 4 sample rules provided
*/
var rules = require('./rules.json');

/* 
  GET /rules 
  Return all rules that are currently in the system.
*/
exports.getRules = function (req, res) {
};


/* 
  POST /rules
  Add a new rule. If there is an rule with the same name,
  overwrite that rule.
  Req: JSON representing a new rule to add
*/
exports.addRule = function (req, res) {
};

/*
  DELETE /rule
  Delete a rule if one with the provided name exists.
  Req: contains name of the rule to delete
*/
exports.deleteRule = function (req, res) {
};