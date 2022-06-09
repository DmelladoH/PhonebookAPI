const supertest = require('supertest')
const { app } = require('../index')
const User = require('../models/User')
const Contact = require('../models/Contact')
const jwt = require('jsonwebtoken')

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

const generateTempToken = (infoToken) => {
  return jwt.sign(infoToken, process.env.SECRET, {
    expiresIn: 60
  })
}

const saveInitialContacts = async () => {
  for (const contact of initialContacts) {
    const contactObject = new Contact(contact)
    await contactObject.save()
  }
}

const saveInitialUsers = async () => {
  for (const user of initialUsers) {
    const userObject = new User(user)
    await userObject.save()
  }
}

const getAllContacts = async () => {
  const contactDB = await Contact.find({})
  return contactDB.map(contact => contact.toJSON())
}

const getContact = async (id) => {
  return await api.get(`/api/contacts/${id}`)
}

const getAllUsers = async () => {
  const usersDB = await User.find({})
  return usersDB.map(user => user.toJSON())
}

const getUser = async (id) => {
  return await api.get(`/api/users/${id}`)
}

module.exports = {
  initialContacts,
  initialUsers,
  api,
  getAllContacts,
  getContact,
  getAllUsers,
  getUser,
  saveInitialContacts,
  saveInitialUsers,
  generateTempToken
}
