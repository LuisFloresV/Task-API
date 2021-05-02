const request = require('supertest')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const app = require('../src/app')
const User = require('../src/models/user')

const userOneId = new mongoose.Types.ObjectId()

const userOne = {
  _id: userOneId,
  name: "Naoko",
  email: "naoko@test.com",
  password: "aprilfeb690.",
  tokens: [{
    token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET)
  }]
}

beforeEach(async () => {
  await User.deleteMany()
  await new User(userOne).save()
})

afterAll(async () => {
  await mongoose.disconnect()
})

test('Should signup a new user', async () => {
  const response = await request(app).post('/users').send({
    name: "Naoko",
    email: "naokodeveloper@gmail.com",
    password: "aprilfeb50D."
  }).expect(201)

  //DB was changed
  const user = await User.findById(response.body.response.user._id)
  expect(user).not.toBeNull()

  //Assertions about the response
  expect(response.body.response).toMatchObject({
    user: {
      name: 'Naoko',
      email: 'naokodeveloper@gmail.com'
    },
    token: user.tokens[0].token
  })

  //User password
  expect(user.password).not.toBe('aprilfeb50D.')

})


test('Should update valid user fields', async () => {
  await request(app)
    .patch('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
      'name': 'Naoko Banana'
    })
    .expect(200)
  const user = await User.findById(userOneId)
  expect(user.name).toEqual('Naoko Banana')
})

test('Should not update invalid user fields', async () => {
  await request(app)
    .patch('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .send({
      location: 'Mexico'
    })
    .expect(400)
})


test('Should login existing user', async () => {
  const response = await request(app).post('/users/login').send({
    email: userOne.email,
    password: userOne.password
  }).expect(201)

  const user = await User.findById(response.body.response.user._id)
  expect(user.tokens[1].token).toBe(response.body.response.token)
})


test('Should not login non-existing user', async () => {
  await request(app).post('/users/login').send({
    email: "foobar@gmail.com",
    password: "aprilfeb50D."
  }).expect(500)
})

test('Should get profile for user', async () => {
  await request(app)
    .get('/users/me')
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
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
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
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
    .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
    .attach('avatar', 'tests/fixtures/pino.jpg')
    .expect(200)
  const user = await User.findById(userOneId)
  expect(user.avatar).toEqual(expect.any(Buffer))
})