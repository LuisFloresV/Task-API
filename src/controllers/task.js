const response = require('../utils/response')
const Task = require('../models/task')

exports.postTask = async (req, res, next) => {
  try {
    const task = new Task({
      ...req.body,
      owner: req.user._id,
    })
    await task.save()
    response.success(req, res, task, 201)
  } catch (error) {
    next(error)
  }
}

// GET /tasks?completed=true
// GET /tasks?limit=10&skip=10
// GET /tasks?sortBy=createdAt:asc
exports.getTask = async (req, res, next) => {
  try {
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
  } catch (error) {
    next(error)
  }
}

exports.getTaskId = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, owner: req.user._id })
    task ? response.success(req, res, task, 200) : response.error(req, res, 'Not Found', 404)
  } catch (error) {
    next(error)
  }
}

exports.patchTask = async (req, res, next) => {
  const updates = Object.keys(req.body)
  const allowedUpdates = ['description', 'completed']
  const validOp = updates.every((update) => allowedUpdates.includes(update))
  if (!validOp) {
    return response.error(req, res, 'Invalid updates', 404)
  }
  try {
    const task = await Task.findOne({ _id: req.params.id, owner: req.user._id })
    if (!task) {
      return response.error(req, res, 'Task Not Found', 404)
    }
    updates.forEach((update) => task[update] = req.body[update])
    await task.save()
    response.success(req, res, task, 200)
  } catch (error) {
    next(error)
  }
}

exports.deleteAllTasks = async (req, res, next) => {
  try {
    const task = await Task.deleteMany({ owner: req.user._id, completed: true })
    task ? response.success(req, res, task, 200) : response.error(req, res, 'Task Not Found', 404)
  } catch (error) {
    next(error)
  }
}

exports.deleteTaskId = async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id })
    task ? response.success(req, res, task, 200) : response.error(req, res, 'Task Not Found', 404)
  } catch (error) {
    next(error)
  }
}
