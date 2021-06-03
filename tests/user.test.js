const request = require('supertest')
const mongoose = require('mongoose')
const app = require('../src/app')
const User = require('../src/models/user')
const { setupDb, userOne, userOneId } = require('./fixtures/db')

beforeEach(setupDb)

afterAll(async () => {
  await mongoose.disconnect()
})

test('Should signup a new user', async () => {
  const response = await request(app).post('/users').send({
    name: 'Naoko',
    email: 'naokodeveloper@gmail.com',
    password: 'aprilfeb50D.',
  }).expect(201)

  // DB was changed
  const user = await User.findById(response.body.response.user._id)
  expect(user).not.toBeNull()

  // Assertions about the response
  expect(response.body.response).toMatchObject({
    user: {
      name: 'Naoko',
      email: 'naokodeveloper@gmail.com',
    },
    token: user.token,
  })

  // User password
  expect(user.password).not.toBe('aprilfeb50D.')
})

test('Should not sign up user with invalid name', async () => {
  request(app)
    .post('/users')
    .send({
      name: 'Naoko120',
      email: 'naokodeveloper@gmail.com',
      password: 'aprilfeb50D.',
    })
    .expect(400)
})

test('Should not sign up user with invalid email', async () => {
  request(app)
    .post('/users')
    .send({
      name: 'Naoko120',
      email: 'luisemail.com',
      password: 'aprilfeb50D.',
    })
    .expect(400)
})

test('Should not sign up user with invalid password', async () => {
  request(app)
    .post('/users')
    .send({
      name: 'Naoko120',
      email: 'luisemail.com',
      password: 'aprilfebpassword.',
    })
    .expect(400)
})

test('Should update valid user fields', async () => {
  await request(app)
    .patch('/users/me')
    .set('Authorization', `Bearer ${userOne.token}`)
    .send({
      name: 'Naoko Banana',
    })
    .expect(200)
  const user = await User.findById(userOneId)
  expect(user.name).toEqual('Naoko Banana')
})

test('Should not update user with invalid name', async () => {
  await request(app)
    .patch('/users/me')
    .set('Authorization', `Bearer ${userOne.token}`)
    .send({
      name: 'Naoko123',
    })
    .expect(400)
})

test('Should not update user with invalid email', async () => {
  await request(app)
    .patch('/users/me')
    .set('Authorization', `Bearer ${userOne.token}`)
    .send({
      email: 'naoko.com',
    })
    .expect(400)
})

test('Should not update user with invalid password', async () => {
  await request(app)
    .patch('/users/me')
    .set('Authorization', `Bearer ${userOne.token}`)
    .send({
      password: 'password123',
    })
    .expect(400)
})

test('Should not update user without auth', async () => {
  await request(app)
    .patch('/users/me')
    .send({
      name: 'Naoko Banana',
    })
    .expect(401)
})

test('Should not update invalid user fields', async () => {
  await request(app)
    .patch('/users/me')
    .set('Authorization', `Bearer ${userOne.token}`)
    .send({
      location: 'Mexico',
    })
    .expect(400)
})

test('Should get profile for user', async () => {
  await request(app)
    .get('/users/me')
    .set('Authorization', `Bearer ${userOne.token}`)
    .send()
    .expect(200)
})

test('Should not get profile for unauthenticated user', async () => {
  await request(app)
    .get('/users/me')
    .send()
    .expect(401)
})

test('Should delete account for user', async () => {
  await request(app)
    .delete('/users/me')
    .set('Authorization', `Bearer ${userOne.token}`)
    .send()
    .expect(200)
  expect(await User.findById(userOneId)).toBeNull()
})

test('Should not delete account for unauthenticated user', async () => {
  await request(app)
    .delete('/users/me')
    .send()
    .expect(401)
})

test('Should upload avatar image', async () => {
  await request(app)
    .post('/users/me/avatar')
    .set('Authorization', `Bearer ${userOne.token}`)
    .attach('avatar', 'tests/fixtures/pino.jpg')
    .expect(200)
  const user = await User.findById(userOneId)
  expect(user.avatar).toEqual(expect.any(Buffer))
})
