const AppError = require('../utils/AppError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.keyValue;
  const message = `Duplicate value for the ${Object.keys(
    value,
  )}: "${Object.values(value)}". Please use another value`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError('Invalid token! Please login again', 401);

const handleJWTExpiredError = () =>
  new AppError('Your token has expired! Please login again', 401);

const sendErrorDev = (err, res) => {
  console.log(err.errors);
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  // Operational Error
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }
  // Generic Error
  console.log('Error 💥', err);
  return res.status(err.statusCode).json({
    status: 'Error',
    message: 'Something wen very wrong!',
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'Error';

  if (process.env.NODE_ENV.trim() === 'development') {
    sendErrorDev(err, res);
  }
  if (process.env.NODE_ENV.trim() === 'production') {
    let error = { ...err };

    if (err.name === 'CastError') error = handleCastErrorDB(error);

    if (err.name === 'ValidationError') error = handleValidationErrorDB(error);

    if (err.name === 'JsonWebTokenError') error = handleJWTError();

    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

    if (err.code === 11000) error = handleDuplicateFieldsDB(error);

    sendErrorProd(error, res);
  }
};
