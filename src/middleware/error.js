const response = require('../utils/response')

const errorHandler = (err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return response.error(req, res, err.message, 400)
  }
  if (err.code === 11000) {
    return response.error(req, res, 'Duplicate value', 400)
  }

  response.error(req, res, err.message, err.code)
}

module.exports = errorHandler
