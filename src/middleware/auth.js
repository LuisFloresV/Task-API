/* eslint-disable no-unused-expressions */
const jwt = require('jsonwebtoken')
const User = require('../models/user')
const response = require('../utils/response')

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer', '').trim()
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        err.name === 'TokenExpiredError' ? response.error(req, res, { tokenExpired: true }, 500) : response.error(req, res, err, 500)
      } else {
        const user = await User.findOne({ _id: decoded._id, token })
        if (!user) {
          const error = new Error('No user!')
          error.code = 404
          next(error)
        }
        req.token = token
        req.user = user
        next()
      }
    })
  } catch (error) {
    res.status(401).send({ error: 'Please Authenticate' })
  }
}

module.exports = auth
