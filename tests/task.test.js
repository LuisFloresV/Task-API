const request = require('supertest')
const Task = require('../src/models/task')
const { setupDb, userOne, userSecond, taskOneId } = require('./fixtures/db')
const app = require('../src/app')

beforeEach(setupDb)

test('Should create task for user', async () => {
  const response = await request(app)
    .post('/tasks')
    .set('Authorization', `Bearer ${userOne.token}`)
    .send({
      description: "Learn Js"
    })
    .expect(201)
  const task = await Task.findById(response.body.response._id)
  expect(task).not.toBeNull()
  expect(task.description).toEqual(response.body.response.description)
  expect(task.completed).toEqual(false)
})

test('Should not create task with invalid description', async () => {
  const response = await request(app)
    .post('/tasks')
    .set('Authorization', `Bearer ${userOne.token}`)
    .send({
      description: ""
    })
    .expect(500)
  expect(response.body.error).toBe(true)
})

test('Should not create task with invalid completed status', async () => {
  const response = await request(app)
    .post('/tasks')
    .set('Authorization', `Bearer ${userOne.token}`)
    .send({
      completed: ""
    })
    .expect(500)
  expect(response.body.error).toBe(true)
})


test('Should not update task with invalid description', async () => {
  const response = await request(app)
    .patch(`/tasks/${taskOneId}`)
    .set('Authorization', `Bearer ${userOne.token}`)
    .send({
      description: ""
    })
    .expect(500)
  expect(response.body.error).toBe(true)
})

test('Should not update task if not owner', async () => {
  const response = await request(app)
    .patch(`/tasks/${taskOneId}`)
    .set('Authorization', `Bearer ${userSecond.token}`)
    .send({
      description: "Learn JavaScript"
    })
    .expect(404)
  expect(response.body.error).toBe(true)
})

test('Should not update task with invalid completed status', async () => {
  const response = await request(app)
    .patch(`/tasks/${taskOneId}`)
    .set('Authorization', `Bearer ${userOne.token}`)
    .send({
      completed: ""
    })
    .expect(500)
  expect(response.body.error).toBe(true)
})

test('Should get all tasks for user', async () => {
  const response = await request(app)
    .get('/tasks')
    .set('Authorization', `Bearer ${userOne.token}`)
    .send()
    .expect(200)
  expect(response.body.response.length).toBe(3)
})

test('Should fetch all completed tasks for user', async () => {
  const response = await request(app)
    .get('/tasks?completed=true')
    .set('Authorization', `Bearer ${userOne.token}`)
    .send()
    .expect(200)
  expect(response.body.response.length).toBe(1)
})

test('Should fetch tasks for user with limit', async () => {
  const response = await request(app)
    .get('/tasks?limit=2')
    .set('Authorization', `Bearer ${userOne.token}`)
    .send()
    .expect(200)
  expect(response.body.response.length).toBe(2)
})

test('Should fetch tasks for user with skip and limit', async () => {
  const response = await request(app)
    .get('/tasks?skip=2&limit=1')
    .set('Authorization', `Bearer ${userOne.token}`)
    .send()
    .expect(200)
  expect(response.body.response[0].description).toBe('Learn Spanish')
})

test('Should fetch tasks for user sorted by creation time asc', async () => {
  const response = await request(app)
    .get('/tasks?sortBy=createdAt:asc')
    .set('Authorization', `Bearer ${userOne.token}`)
    .send()
    .expect(200)
  expect(response.body.response[0].description).toBe('Learn Js')
})

test('Should fetch tasks for user sorted by creation time desc', async () => {
  const response = await request(app)
    .get('/tasks?sortBy=createdAt:desc')
    .set('Authorization', `Bearer ${userOne.token}`)
    .send()
    .expect(200)
  expect(response.body.response[0].description).toBe('Learn Spanish')
})

test('Should fetch tasks for user sorted by completed desc', async () => {
  const response = await request(app)
    .get('/tasks?sortBy=completed:desc')
    .set('Authorization', `Bearer ${userOne.token}`)
    .send()
    .expect(200)
  expect(response.body.response[0].description).toBe('Learn Spanish')
})

test('Should fetch all incompleted tasks for user', async () => {
  const response = await request(app)
    .get('/tasks?completed=false')
    .set('Authorization', `Bearer ${userOne.token}`)
    .send()
    .expect(200)
  expect(response.body.response.length).toBe(2)
})

test('Should fetch task for user by id', async () => {
  const response = await request(app)
    .get(`/tasks/${taskOneId}`)
    .set('Authorization', `Bearer ${userOne.token}`)
    .send()
    .expect(200)
  expect(response.body.response.description).toBe('Learn Js')
})

test('Should not fetch other users task by id', async () => {
  const response = await request(app)
    .get(`/tasks/${taskOneId}`)
    .set('Authorization', `Bearer ${userSecond.token}`)
    .send()
    .expect(404)
})

test('Should not fetch task for user by id if unauthenticated', async () => {
  const response = await request(app)
    .get(`/tasks/${taskOneId}`)
    .send()
    .expect(401)
})

test('Should not delete task if not owner', async () => {
  await request(app)
    .delete(`/tasks/${taskOneId}`)
    .set('Authorization', `Bearer ${userSecond.token}`)
    .send()
    .expect(404)
  const task = await Task.findById(taskOneId)
  expect(task).not.toBeNull()
})

test('Should delete task if owner', async () => {
  await request(app)
    .delete(`/tasks/${taskOneId}`)
    .set('Authorization', `Bearer ${userOne.token}`)
    .send()
    .expect(200)
  const task = await Task.findById(taskOneId)
  expect(task).toBeNull()
})


test('Should not delete task if unauthenticated', async () => {
  await request(app)
    .delete(`/tasks/${taskOneId}`)
    .send()
    .expect(401)
  const task = await Task.findById(taskOneId)
  expect(task).not.toBeNull()
})