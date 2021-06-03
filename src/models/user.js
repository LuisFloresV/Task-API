/* eslint-disable func-names */
const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const Task = require('./task')
const AppError = require('../utils/appError')

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    validate: {
      validator(val) {
        return !/\d+/.test(val)
      },
      message: 'Username must contain only letters',
    },
  },
  email: {
    unique: true,
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    validate: [validator.isEmail, 'Email must follow the correct format'],
  },
  password: {
    type: String,
    minLength: [6, 'At least 6 characters'],
    required: true,
    trim: true,
    validate: {
      validator(val) {
        return !val.toLowerCase().includes('password')
      },
      message: 'Insecure password',
    },
  },
  token: {
    type: String,
  },
  avatar: {
    type: Buffer,
  },
}, {
  timestamps: true,
})

userSchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'owner',
})

// to JSON
userSchema.methods.toJSON = function () {
  const user = this
  const userObject = user.toObject()
  delete userObject.password
  delete userObject.token
  delete userObject.avatar
  return userObject
}

// Generate Authentication Token
userSchema.methods.generateAuthToken = async function () {
  const user = this
  const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: '24h' })
  user.token = token
  await user.save()
  return token
}

// Return user if correct credentials
userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email })
  if (!user) {
    throw new AppError('Unable to log in', 400)
  }
  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) {
    throw new AppError('Unable to log in', 400)
  }
  return user
}

// Hash password
userSchema.pre('save', async function (next) {
  const user = this
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8)
  }
  next()
})

// Delete user tasks when user is removed
userSchema.pre('remove', async function (next) {
  const user = this
  await Task.deleteMany({ owner: user._id })
  next()
})

const User = mongoose.model('User', userSchema)

module.exports = User
