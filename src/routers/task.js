const express = require('express')

const router = express.Router()
const auth = require('../middleware/auth')
const {
  postTask, getTask, getTaskId, patchTask, deleteAllTasks, deleteTaskId,
} = require('../controllers/task')

router.route('/tasks')
  .get(auth, getTask)
  .post(auth, postTask)
  .delete(auth, deleteAllTasks)

router.route('/tasks/:id')
  .get(auth, getTaskId)
  .patch(auth, patchTask)
  .delete(auth, deleteTaskId)

module.exports = router
