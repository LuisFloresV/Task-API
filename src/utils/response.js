const success = (req, res, message = '', status = 200, opts = '') => {
  if (opts === 'image') {
    res.set('Content-Type', 'image/png')
    return res.send(message)
  }
  res.status(status).send({
    error: false,
    response: message,
    status,
  })
}

const error = (res, err) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  })
}

module.exports = { error, success }
