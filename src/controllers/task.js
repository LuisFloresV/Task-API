/* eslint-disable consistent-return */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-return-assign */
/* eslint-disable no-unused-expressions */

const response = require('../utils/response')
const Task = require('../models/task')
const catchAsync = require('../utils/catchAsync')
const AppError = require('../utils/appError')

exports.postTask = catchAsync(async (req, res, next) => {
  const task = new Task({
    ...req.body,
    owner: req.user._id,
  })
  await task.save()
  response.success(req, res, task, 201)
})

// GET /tasks?completed=true
// GET /tasks?limit=10&skip=10
// GET /tasks?sortBy=createdAt:asc
exports.getTasks = catchAsync(async (req, res, next) => {
  const match = {}
  const sort = {}
  if (req.query.completed) match.completed = req.query.completed === 'true'
  if (req.query.sortBy) {
    const parts = req.query.sortBy.split(':')
    sort[parts[0]] = parts[1]
  }
  await req.user.populate({
    path: 'tasks',
    match,
    options: {
      limit: parseInt(req.query.limit),
      skip: parseInt(req.query.skip),
      sort,
    },
  }).execPopulate()
  response.success(req, res, req.user.tasks, 200)
})

exports.getTaskId = catchAsync(async (req, res, next) => {
  const task = await Task.findOne({ _id: req.params.id, owner: req.user._id })
  if (!task) {
    return next(new AppError('No task found with that ID', 404))
  }
  response.success(req, res, task, 200)
})

exports.patchTask = catchAsync(async (req, res, next) => {
  const updates = Object.keys(req.body)
  const allowedUpdates = ['description', 'completed']
  const validOp = updates.every((update) => allowedUpdates.includes(update))

  if (!validOp) {
    return next(new AppError('Invalid parameters to update', 400))
  }

  const task = await Task.findOne({ _id: req.params.id, owner: req.user._id })
  if (!task) {
    return next(new AppError('No task found with that ID', 404))
  }

  updates.forEach((update) => task[update] = req.body[update])
  await task.save()
  response.success(req, res, task, 200)
})

exports.deleteAllTasks = catchAsync(async (req, res, next) => {
  await Task.deleteMany({ owner: req.user._id, completed: true })
  response.success(req, res, 'All tasks deleted', 200)
})

exports.deleteTaskId = catchAsync(async (req, res, next) => {
  const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id })
  if (!task) {
    return next(new AppError('No task found with that ID', 404))
  }
  response.success(req, res, 'Resource Deleted', 200)
})
