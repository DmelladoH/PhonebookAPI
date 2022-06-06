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

const getAllContacts = async () => {
  return await api.get('/api/contacts')
}

const getContact = async (id) => {
  return await api.get(`/api/contacts/${id}`)
}

module.exports = { initialContacts, api, getAllContacts, getContact }
