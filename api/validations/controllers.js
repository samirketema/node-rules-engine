var handleRouteError = require('../utils').handleRouteError;
var _ = require('underscore');
var Rules = require('../rules/controllers');

/* 
  POST /validation  
  Retrieve results for an input validation
  Input: JSON that needs to be validated
  Response: 
  {
    //String indicating "success" or "failure"
    "result": "failure",
    //an array of failed validation rules (only present on failure)
    rules: ["username_length"]
  }
*/
exports.postValidation = function (req, res) {
  try {
    let failedRules = Rules.applyRules(req.body);
    //If input failed any rules, return failure.
    if (failedRules.length > 0) {
      return res.status(400).json({
        'result': 'failure',
        'rules': failedRules
      });
    }
    //Return success
    return res.status(200).json({
      'result': 'success'
    });
  } catch (e) {
    //There was an issue applying the input against the rules.
    return res.status(400).json({
      'result': 'failure',
      'message': 'Rules/Operators cannot be applied to input. ' + e
    });
  }
};