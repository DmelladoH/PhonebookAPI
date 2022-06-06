const supertest = require('supertest')
const { app } = require('../index')

const api = supertest(app)

const initialContacts = [
  {
    name: 'Manuel',
    number: '00-000-01'
  },
  {
    name: 'carla',
    number: '00-000-02'
  }
]

const initialUsers = [
  {
    userName: 'testUser',
    name: 'test',
    password: '123'
  },
  {
    userName: 'anotherTestUser',
    name: 'anotherTest',
    password: '123'
  }
]

const getAllContacts = async () => {
  return await api.get('/api/contacts')
}

const getContact = async (id) => {
  return await api.get(`/api/contacts/${id}`)
}

const getAllUsers = async () => {
  return await api.get('/api/users')
}

const getUser = async (id) => {
  return await api.get(`/api/users/${id}`)
}

module.exports = { initialContacts, initialUsers, api, getAllContacts, getContact, getAllUsers, getUser }
