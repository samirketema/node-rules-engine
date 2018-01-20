var express = require('express');
var router = express.Router();

/* Include various REST resources of the rules engine */
var Validation = require('../api/validations/controllers');
var Rule = require('../api/rules/controllers');

/* Make controller mapping from resource path to functions */
router.get('/validation', Validation.getValidation);

module.exports = router;