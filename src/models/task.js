const mongoose = require('mongoose')

const taskSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
    trim: true,
    validate(value) {
      if (/\d+/.test(value)) {
        throw new Error('No numbers accepted')
      }
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
