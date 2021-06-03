const express = require('express')

const app = express()
const cors = require('cors')
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')
const db = require('./db/mongoose')
const globalErrorHandler = require('./middleware/error')
const notFoundHandler = require('./middleware/404')
// MongoDB connection
db()

// Cors
app.use(cors())

// Json parser
app.use(express.json())

// routes
app.use(userRouter)
app.use(taskRouter)
app.use(notFoundHandler)

// error Handling
app.use(globalErrorHandler)

module.exports = app
