const request = require('supertest')
const Task = require('../src/models/task')
const { setupDb, userOne, userSecond, taskOneId } = require('./fixtures/db')
const app = require('../src/app')

beforeEach(setupDb)

test('Should create task for user', async () => {
  const response = await request(app)
    .post('/tasks')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
      description: "Learn Js"
    })
    .expect(201)
  const task = await Task.findById(response.body.response._id)
  expect(task).not.toBeNull()
  expect(task.description).toEqual(response.body.response.description)
  expect(task.completed).toEqual(false)
})

test('Should get all tasks for user', async () => {
  const response = await request(app)
    .get('/tasks')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200)
  expect(response.body.response.length).toBe(2)
})

test('Should not delete task if not owner', async () => {
  await request(app)
    .delete(`/tasks/${taskOneId}`)
    .set('Authorization', `Bearer ${userSecond.tokens[0].token}`)
    .send()
    .expect(404)
  const task = Task.findById(taskOneId)
  expect(task).not.toBeNull()
})