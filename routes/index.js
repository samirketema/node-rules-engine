var express = require('express');
var router = express.Router();

/* Include various REST resources of the rules engine */
var Validation = require('../api/validations/controllers');
var Rule = require('../api/rules/controllers');
var Operator = require('../api/operators/controllers');

/* Make controller mapping from resource path to functions */
router.post('/api/validation', Validation.postValidation);

module.exports = router;