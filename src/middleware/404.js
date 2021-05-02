const response = require('../utils/response')

const notFoundHandler = (req, res) => {
  response.error(req, res, 'Resource not found', 404)
}

module.exports = notFoundHandler