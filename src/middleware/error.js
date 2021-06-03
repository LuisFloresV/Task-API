/* eslint-disable no-param-reassign */

const AppError = require('../utils/appError')
const response = require('../utils/response')

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`
  return new AppError(message, 400)
}

const handleDuplicateFieldsDB = (err) => {
  const value = err.message.match(/(["'])(\\?.)*?\1/)[0]
  const message = `Duplicate field value: ${value} Please use another value!`
  return new AppError(message, 400)
}

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message)
  const message = `Invalid input data. ${errors.join('. ')}`
  return new AppError(message, 400)
}

const handleLimitFileSizeError = (err) => {
  const message = 'File size must be 1 Megabyte max'
  return new AppError(message, 400)
}

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  })
}

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    response.error(res, err)
  } else {
    console.error('ERROR', err)
    response.error(res, 'Something went wrong')
  }
}

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500
  err.status = err.status || 'error'
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res)
  } else if (process.env.NODE_ENV === 'production') {
    let error = Object.create(err)
    if (error.name === 'CastError') error = handleCastErrorDB(error)
    if (error.code === 11000) error = handleDuplicateFieldsDB(error)
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error)
    if (error.message === 'ValidationError') error = handleValidationErrorDB(error)
    if (error.code === 'LIMIT_FILE_SIZE') error = handleLimitFileSizeError(error)
    sendErrorProd(error, res)
  }
}
