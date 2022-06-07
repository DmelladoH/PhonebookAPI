const mongoose = require('mongoose')

const { server } = require('../index')
const {
  initialUsers,
  api,
  getAllUsers,
  getUser
} = require('./helpers')

const User = require('../models/User')

beforeEach(async () => {
  await User.deleteMany({})

  for (const user of initialUsers) {
    const userObject = new User(user)
    await userObject.save()
  }
})

describe('GET / getting ', () => {
  test('all users', async () => {
    const response = await getAllUsers()

    expect(response.status).toBe(200)
    expect(response.body).toHaveLength(initialUsers.length)
  })

  test('a user when the id is valid', async () => {
    const response = await getAllUsers()
    const firstUser = response.body[0]

    const id = firstUser.id
    const userName = firstUser.userName
    const name = firstUser.name

    const secondResponse = await getUser(id)

    expect(secondResponse.status).toBe(200)
    expect(secondResponse.body.userName).toBe(userName)
    expect(secondResponse.body.name).toBe(name)
  })
  test('an error when the id is not valid', async () => {
    const invalidId = 12345678

    const secondResponse = await getUser(invalidId)

    expect(secondResponse.status).toBe(400)
  })
})

describe('POST / a new User', () => {
  test('is created when it is correct', async () => {
    const newUser = {
      userName: 'newUser',
      name: 'name',
      password: '123'
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const response = await getAllUsers()
    expect(response.body).toHaveLength(initialUsers.length + 1)
    expect(response.body.map(user => user.userName)).toContain(newUser.userName)
  })

  test('is not created without the userName field', async () => {
    const newInvalidUser = {
      name: 'name',
      password: '123'
    }

    await api
      .post('/api/users')
      .send(newInvalidUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const response = await getAllUsers()
    expect(response.body).toHaveLength(initialUsers.length)
  })

  test('is not created without the name field', async () => {
    const newInvalidUser = {
      userName: 'name',
      password: '123'
    }

    const result = await api
      .post('/api/users')
      .send(newInvalidUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const response = await getAllUsers()
    expect(response.body).toHaveLength(initialUsers.length)
    expect(result.body.errors.name.message).toContain('name required')
  })

  test('is not created without the password field', async () => {
    const newInvalidUser = {
      userName: 'newUser',
      name: 'name'
    }

    await api
      .post('/api/users')
      .send(newInvalidUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const response = await getAllUsers()
    expect(response.body).toHaveLength(initialUsers.length)
  })
  test('is not created when the user is already created', async () => {
    const newInvalidUser = {
      userName: initialUsers[0].userName,
      name: initialUsers[0].name,
      password: '123'
    }

    await api
      .post('/api/users')
      .send(newInvalidUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const response = await getAllUsers()
    expect(response.body).toHaveLength(initialUsers.length)
  })
  test('is not created when the userName is invalid', async () => {
    const newInvalidUser = {
      userName: 'new User',
      name: 'name',
      password: '123'
    }

    await api
      .post('/api/users')
      .send(newInvalidUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const response = await getAllUsers()
    expect(response.body).toHaveLength(initialUsers.length)
  })
})

describe('DELETE / deleting users ', () => {
  test('when exists in the database', async () => {
    const response = await getAllUsers()
    const userToDelete = response.body[0]

    await api
      .delete(`/api/users/${userToDelete.id}`)
      .expect(204)

    const secondResponse = await getAllUsers()
    expect(secondResponse.body).toHaveLength(initialUsers.length - 1)
    expect(secondResponse.body.map(user => user.userName)).not.toContain(userToDelete)
  })

  test('does not delete when the user does not exist in the database', async () => {
    await api
      .delete('/api/users/123')
      .expect(400)

    const response = await getAllUsers()
    expect(response.body).toHaveLength(initialUsers.length)
  })
})

describe('PUT / Upgrading a users ', () => {
  test.skip('when the user exists in the database', async () => {
    const response = await getAllUsers()
    const userToUpdate = response.body[0]

    const id = userToUpdate.id

    const newUser = {
      userName: userToUpdate.userName,
      name: 'changedName'
    }

    await api
      .delete(`/api/users/${userToUpdate.id}`)
      .expect(200)

    const secondResponse = await getUser(id)
    expect(secondResponse.body.name).toBe(newUser.name)
  })
})

afterAll(() => {
  mongoose.connection.close()
  server.close()
})
