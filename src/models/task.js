const mongoose = require('mongoose')

const taskSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: [30, 'Task description must have less or equal than 30 characters'],
    minlength: [5, 'Task description must have more or equal than 5 characters'],
    validate: {
      validator(val) {
        return !/\d+/.test(val)
      },
      message: 'Task description must contain only letters',
    },
  },
  completed: {
    type: Boolean,
    default: false,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
}, {
  timestamps: true,
})

const Task = mongoose.model('Task', taskSchema)

module.exports = Task
