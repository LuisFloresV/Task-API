const jwt = require('jsonwebtoken')
const User = require('../models/user')
const response = require('../utils/response')
const auth = async function (req, res, next) {
  try {
    const token = req.header('Authorization').replace('Bearer', '').trim()
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        if (err.name == "TokenExpiredError") {
          response.error(req, res, { tokenExpired: true }, 500)
        }
        else {
          response.error(req, res, err, 500)
        }
      } else {
        const user = await User.findOne({ _id: decoded._id, 'token': token })
        if (!user) {
          next(new Error('No user!'))
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