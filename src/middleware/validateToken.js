const jwt = require('jsonwebtoken')
const response = require('../utils/response')
const User = require('../models/user')

exports.verifyToken = (token, req, res) => {
  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        const user = await User.findOne({ token })
        const refreshedToken = await user.generateAuthToken()
        response.success(req, res, { status: 'New Token', token: refreshedToken }, 201)
      }
    } else {
      response.success(req, res, { tokenValid: 'true' }, 200)
    }
  })
}
