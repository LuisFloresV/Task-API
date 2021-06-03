const AppError = require('../utils/appError')

const notFoundHandler = (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl}`, 404))
}

module.exports = notFoundHandler
