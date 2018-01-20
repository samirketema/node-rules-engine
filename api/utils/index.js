/* Handle errors */
exports.handleRouteError = function (err, res) {
  if (err.type === 'custom' && err.code === 400) {
    return res.status(err.code).json(err.messages);
  }
  if (err.type === 'custom') {
    return res.status(err.code).json(err);
  }
  return res.status(500).json(err);
};

/* Handles node errors */
exports.systemError = function () {
  return {
    type: 'custom',
    msg: 'A system error occurred',
    code: 500
  };
};