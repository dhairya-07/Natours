module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'Error';
  return res
    .status(err.statusCode)
    .json({ status: err.status, msg: err.message });
};
