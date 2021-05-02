const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const User = require('../../src/models/user')
const Task = require('../../src/models/task')
const userOneId = new mongoose.Types.ObjectId()
const taskOneId = new mongoose.Types.ObjectId()

const userOne = {
  _id: userOneId,
  name: "Naoko",
  email: "naoko@test.com",
  password: "aprilfeb690.",
  tokens: [{
    token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET)
  }]
}

const userSecondId = new mongoose.Types.ObjectId()

const userSecond = {
  _id: userSecondId,
  name: "Naruto",
  email: "naruto@test.com",
  password: "aprieb600",
  tokens: [{
    token: jwt.sign({ _id: userSecondId }, process.env.JWT_SECRET)
  }]
}

const taskOne = {
  _id: taskOneId,
  description: 'Learn Js',
  completed: false,
  owner: userOne._id
}

const taskTwo = {
  _id: mongoose.Types.ObjectId(),
  description: 'Learn Ruby',
  completed: false,
  owner: userOne._id
}

const taskThree = {
  _id: mongoose.Types.ObjectId(),
  description: 'Learn Java',
  completed: false,
  owner: userSecond._id
}

const setupDb = async () => {
  await User.deleteMany()
  await Task.deleteMany()
  await new User(userOne).save()
  await new User(userSecond).save()
  await new Task(taskOne).save()
  await new Task(taskTwo).save()
  await new Task(taskThree).save()
}

module.exports = {
  userOneId,
  userOne,
  setupDb,
  taskOneId,
  userSecond
}