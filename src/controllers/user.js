/* eslint-disable consistent-return */
// const { sendWelcomeEmail, sendCancelEmail } = require('../utils/emails/accounts')

const sharp = require('sharp')
const response = require('../utils/response')
const User = require('../models/user')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')
const { verifyToken } = require('../middleware/validateToken')

exports.uploadAvatar = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('A file must be provided', 400))
  }
  const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
  req.user.avatar = buffer
  await req.user.save()
  response.success(req, res, 'File saved correctly', 200)
})

exports.deleteAvatar = async (req, res, next) => {
  req.user.avatar = undefined
  await req.user.save()
  response.success(req, res, 'File deleted correctly', 200)
}

exports.getAvatar = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id)
  if (!user || !user.avatar) {
    return next(new AppError('Resource not Found', 404))
  }

  response.success(req, res, user.avatar, '', 'image')
})

exports.postUser = catchAsync(async (req, res, next) => {
  const user = new User(req.body)
  await user.save()
  // sendWelcomeEmail(user.email, user.name)
  const token = await user.generateAuthToken()
  response.success(req, res, { user, token }, 201)
})

exports.loginUser = catchAsync(async (req, res, next) => {
  const user = await User.findByCredentials(req.body.email, req.body.password)
  const token = await user.generateAuthToken()
  response.success(req, res, { user, token }, 201)
})

exports.validateToken = catchAsync(async (req, res, next) => {
  const token = req.header('Authorization').replace('Bearer', '').trim()
  verifyToken(token, req, res)
})

exports.userMe = async (req, res, next) => {
  response.success(req, res, req.user, 200)
}

exports.patchUser = catchAsync(async (req, res, next) => {
  const updates = Object.keys(req.body)
  const allowedUpdates = ['name', 'email', 'password', 'age']
  const validOp = updates.every((update) => allowedUpdates.includes(update))
  if (!validOp) {
    return next(new AppError('Invalid parameters to update', 400))
  }
  updates.forEach((update) => req.user[update] = req.body[update])
  await req.user.save()
  response.success(req, res, req.user, 200)
})

exports.deleteUser = catchAsync(async (req, res, next) => {
  await req.user.remove()
  // sendCancelEmail(req.user.email, req.user.name)
  response.success(req, res, req.user, 200)
})
