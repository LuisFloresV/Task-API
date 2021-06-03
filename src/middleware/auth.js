/* eslint-disable no-unused-expressions */
const jwt = require('jsonwebtoken')
const User = require('../models/user')
const response = require('../utils/response')

const AppError = require('../utils/appError.js')

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer', '').trim()
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        err.name === 'TokenExpiredError' ? next(new AppError('Token Expired', 401)) : next(new AppError('Invalid Token', 401))
      } else {
        const user = await User.findOne({ _id: decoded._id, token })
        if (!user) {
          return next(new AppError('User Not Found', 404))
        }
        req.token = token
        req.user = user
        next()
      }
    })
  } catch (error) {
    next(new AppError('Please authenticate', 401))
  }
}

module.exports = auth
