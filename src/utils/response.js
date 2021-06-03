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

const error = (req, res, message = 'Internal Server Error', status = 500) => {
  res.status(status).send({
    error: true,
    response: message,
    status,
  })
}

module.exports = { error, success }
