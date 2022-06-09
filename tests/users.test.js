const mongoose = require('mongoose')

const { server } = require('../index')
const {
  initialUsers,
  api,
  getAllUsers,
  getUser,
  saveInitialUsers
} = require('./helpers')

const User = require('../models/User')

beforeEach(async () => {
  await User.deleteMany({})
  await saveInitialUsers()
})

describe('GET / getting ', () => {
  test('all users', async () => {
    const response = await api
      .get('/api/users')
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(response.body).toHaveLength(initialUsers.length)
  })

  test('a user when the id is valid', async () => {
    const usersDB = await getAllUsers()
    const firstUser = usersDB[0]

    const id = firstUser.id
    const userName = firstUser.userName
    const name = firstUser.name

    const response = await api
      .get(`/api/users/${id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(response.body.userName).toBe(userName)
    expect(response.body.name).toBe(name)
  })
  test('an error when the id is not valid', async () => {
    const invalidId = 12345678

    await api
      .get(`/api/users/${invalidId}`)
      .expect(400)
      .expect('Content-Type', /application\/json/)
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

    const usersDB = await getAllUsers()
    expect(usersDB).toHaveLength(initialUsers.length + 1)
    expect(usersDB.map(user => user.userName)).toContain(newUser.userName)
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

    const usersDB = await getAllUsers()
    expect(usersDB).toHaveLength(initialUsers.length)
  })

  test('is not created without the name field', async () => {
    const newInvalidUser = {
      userName: 'name',
      password: '123'
    }

    const response = await api
      .post('/api/users')
      .send(newInvalidUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const usersDB = await getAllUsers()
    expect(usersDB).toHaveLength(initialUsers.length)
    expect(response.body.errors.name.message).toContain('name required')
  })

  test('is not created without the password field', async () => {
    const newInvalidUser = {
      userName: 'newUser',
      name: 'name'
    }

    const response = await api
      .post('/api/users')
      .send(newInvalidUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const usersDB = await getAllUsers()

    expect(usersDB).toHaveLength(initialUsers.length)
    expect(response.body.error).toContain('password required')
  })
  test('is not created when the user is already created', async () => {
    const newInvalidUser = {
      userName: initialUsers[0].userName,
      name: initialUsers[0].name,
      password: '123'
    }

    const response = await api
      .post('/api/users')
      .send(newInvalidUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const userDB = await getAllUsers()
    expect(userDB).toHaveLength(initialUsers.length)
    expect(response.body.errors.userName.message).toContain('Error, expected `userName` to be unique. Value: `testUser`')
  })
  test.skip('is not created when the userName is invalid', async () => {
    const newInvalidUser = {
      userName: 'a a',
      name: 'name',
      password: '123'
    }

    console.log(newInvalidUser)

    const response = await api
      .post('/api/users')
      .send(newInvalidUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(response.body.errors.userName.message).toContain('invalid userName')

    const userDB = await getAllUsers()
    expect(userDB).toHaveLength(initialUsers.length)
  })
})

describe('DELETE / deleting users ', () => {
  test('when exists in the database', async () => {
    const response = await getAllUsers()
    const userToDelete = response[0]

    await api
      .delete(`/api/users/${userToDelete.id}`)
      .expect(204)

    const usersDB = await getAllUsers()
    expect(usersDB).toHaveLength(initialUsers.length - 1)
    expect(usersDB.map(user => user.userName)).not.toContain(userToDelete)
  })

  test('does not delete when the user does not exist in the database', async () => {
    await api
      .delete('/api/users/123')
      .expect(400)

    const usersDB = await getAllUsers()
    expect(usersDB).toHaveLength(initialUsers.length)
  })
})

describe('PUT / Upgrading a users ', () => {
  test.skip('when the user exists in the database', async () => {
    const usersDB = await getAllUsers()
    const userToUpdate = usersDB[0]

    const id = userToUpdate.id

    const newUser = {
      userName: userToUpdate.userName,
      name: 'changedName'
    }

    await api
      .delete(`/api/users/${userToUpdate.id}`)
      .expect(200)

    const user = await getUser(id)
    expect(user.namse).toBe(newUser.name)
  })
})

afterAll(() => {
  mongoose.connection.close()
  server.close()
})
