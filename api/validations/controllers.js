var handleRouteError = require('../utils').handleRouteError;

/*  GET /validation 
    Retrieve results for an input validation
    Input: JSON that needs to be validated
    Response: an array of th
*/
exports.getValidation = function (req, res) {
    return res.status(200).json({yo: 'dude'});
}