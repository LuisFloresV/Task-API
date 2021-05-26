// const { sendWelcomeEmail, sendCancelEmail } = require('../utils/emails/accounts')
const jwt = require('jsonwebtoken')
const response = require('../utils/response')
const sharp = require('sharp')
const User = require('../models/user')

exports.uploadAvatar = async (req, res, next) => {
  try {
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    response.success(req, res, 'File saved correctly', 200)
  } catch (error) {
    next(error)
  }
}

exports.deleteAvatar = async (req, res, next) => {
  try {
    req.user.avatar = undefined
    await req.user.save()
    response.success(req, res, 'File deleted correctly', 200)
  } catch (error) {
    next(error)
  }
}

exports.getAvatar = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
    if (!user || !user.avatar) {
      throw new Error('Not Found')
    }
    response.success(req, res, user.avatar, '', 'image')
  } catch (error) {
    next(error)
  }
}

exports.postUser = async (req, res, next) => {
  const user = new User(req.body)
  try {
    await user.save()
    // sendWelcomeEmail(user.email, user.name)
    const token = await user.generateAuthToken()
    response.success(req, res, { user, token }, 201)
  } catch (error) {
    next(error)
  }
}

exports.loginUser = async (req, res, next) => {
  try {
    const user = await User.findByCredentials(req.body.email, req.body.password)
    const token = await user.generateAuthToken()
    response.success(req, res, { user, token }, 201)
  } catch (error) {
    next(error)
  }
}

exports.validateToken = async (req, res, next) => {
  const token = req.header('Authorization').replace('Bearer', '').trim()
  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      if (err.name == "TokenExpiredError") {
        const user = await User.findOne({ 'token': token })
        const refreshedToken = await user.generateAuthToken()
        response.success(req, res, { status: 'New Token', token: refreshedToken }, 201)
      }
    }
    else {
      response.success(req, res, { tokenValid: 'true' }, 200)
    }
  })
}

exports.userMe = async (req, res, next) => {
  response.success(req, res, req.user, 200)
}

exports.patchUser = async (req, res, next) => {
  const updates = Object.keys(req.body)
  if (updates.length > 0) {
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const validOp = updates.every(update => allowedUpdates.includes(update))
    if (!validOp) {
      return response.error(req, res, 'Invalid opts', 400)
    }
    try {
      updates.forEach(update => req.user[update] = req.body[update])
      await req.user.save()
      response.success(req, res, req.user, 200)
    } catch (error) {
      next(error)
    }
  }
  else {
    response.error(req, res, 'No opts!', 400)
  }
}

exports.deleteUser = async (req, res, next) => {
  try {
    await req.user.remove()
    // sendCancelEmail(req.user.email, req.user.name)
    response.success(req, res, req.user, 200)
  } catch (error) {
    next(error)
  }
}