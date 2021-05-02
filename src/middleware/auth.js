const jwt = require('jsonwebtoken')
const User = require('../models/user')

const auth = async function (req, res, next) {
  try {
    const token = req.header('Authorization').replace('Bearer', '').trim()
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findOne({ _id: decoded._id, 'tokens.token': token })
    if (!user) {
      throw new Error('No user!')
    }
    req.token = token
    req.user = user
    next()
  } catch (error) {
    res.status(401).send({ error: 'Please Authenticate' })
  }
}

module.exports = auth