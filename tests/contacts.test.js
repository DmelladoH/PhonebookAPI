const mongoose = require('mongoose')

const { server } = require('../index')
const {
  initialContacts,
  initialUsers,
  api,
  getAllContacts,
  getContact,
  saveInitialUsers,
  saveInitialContacts,
  generateTempToken
} = require('./helpers')

const Contact = require('../models/Contact')
const User = require('../models/User')
// integration test

beforeEach(async () => {
  await Contact.deleteMany({})
  await User.deleteMany({})

  await saveInitialUsers()
  await saveInitialContacts()
})

describe('GET / getting ', () => {
  test('all contacts', async () => {
    const response = await api
      .get('/api/contacts')
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(response.body).toHaveLength(initialContacts.length)
  })

  test('a contact when the id is valid', async () => {
    const contactsDB = await getAllContacts()
    const firstContact = contactsDB[0]

    const id = firstContact.id
    const name = firstContact.name
    const number = firstContact.number

    const response = await api
      .get(`/api/contacts/${id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(response.body.name).toBe(name)
    expect(response.body.number).toBe(number)
  })

  test('an error when the id is not valid', async () => {
    const invalidId = 1234

    await api
      .get(`/api/contacts/${invalidId}`)
      .expect(400)
      .expect('Content-Type', /application\/json/)
  })
})

describe('POST / a new Contact ', () => {
  test('is created when it is correct', async () => {
    const { userName } = initialUsers[0]
    const user = await User.findOne({ userName })

    const userForToken = {
      id: user.id,
      userName: user.userName
    }

    const token = generateTempToken(userForToken)

    const newContact = {
      name: 'Carlos',
      number: '000-00000'

    }

    await api
      .post('/api/contacts')
      .set({ authorization: 'bearer ' + token })
      .send(newContact)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const contactsDB = await getAllContacts()
    expect(contactsDB).toHaveLength(initialContacts.length + 1)
    expect(contactsDB.map(contact => contact.name))
      .toContain(newContact.name)
  })

  test('is not created without the name field', async () => {
    const { userName } = initialUsers[0]
    const user = await User.findOne({ userName })

    const newInvalidContact = {
      number: '000-00000'
    }

    const userForToken = {
      id: user.id,
      userName: user.userName
    }

    const token = generateTempToken(userForToken)

    await api
      .post('/api/contacts')
      .set({ authorization: 'bearer ' + token })
      .send(newInvalidContact)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const contactsDB = await getAllContacts()
    expect(contactsDB).toHaveLength(initialContacts.length)
  })

  test('is not created without the number field', async () => {
    const { userName } = initialUsers[0]
    const user = await User.findOne({ userName })

    const newInvalidContact = {
      name: 'Carlos'
    }

    const userForToken = {
      id: user.id,
      userName: user.userName
    }

    const token = generateTempToken(userForToken)

    await api
      .post('/api/contacts')
      .send(newInvalidContact)
      .set({ authorization: 'bearer ' + token })
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const contactDB = await getAllContacts()
    expect(contactDB).toHaveLength(initialContacts.length)
  })

  test('is not created when the contact is already created', async () => {
    const { userName } = initialUsers[0]
    const user = await User.findOne({ userName })

    const newInvalidContact = {
      name: initialContacts[0].name,
      number: '000-00000'
    }

    const userForToken = {
      id: user.id,
      userName: user.userName
    }

    const token = generateTempToken(userForToken)

    await api
      .post('/api/contacts')
      .set({ authorization: 'bearer ' + token })
      .send(newInvalidContact)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const contactDB = await getAllContacts()
    expect(contactDB).toHaveLength(initialContacts.length)
  })

  test('is not created when there is not authorization', async () => {
    const newContact = {
      name: 'Carlos',
      number: '000-00000'

    }

    await api
      .post('/api/contacts')
      .send(newContact)
      .expect(401)

    const contactsDB = await getAllContacts()
    expect(contactsDB).toHaveLength(initialContacts.length)
  })

  test('is not created when the authorization is invalid', async () => {
    const token = 'invalidToken'

    const newContact = {
      name: 'Carlos',
      number: '000-00000'

    }

    await api
      .post('/api/contacts')
      .set({ authorization: 'bearer ' + token })
      .send(newContact)
      .expect(401)

    const contactsDB = await getAllContacts()
    expect(contactsDB).toHaveLength(initialContacts.length)
  })
})

describe('DELETE / deleting contacts ', () => {
  test('when exists in the database', async () => {
    const { userName } = initialUsers[0]
    const user = await User.findOne({ userName })

    const contactDB = await getAllContacts()
    const noteToDelete = contactDB[0]

    const userForToken = {
      id: user.id,
      userName: user.userName
    }

    const token = generateTempToken(userForToken)

    await api
      .delete(`/api/contacts/${noteToDelete.id}`)
      .set({ authorization: 'bearer ' + token })
      .expect(204)

    const response = await getAllContacts()

    expect(response).toHaveLength(initialContacts.length - 1)
    expect(response.map(contact => contact.name)).not.toContain(noteToDelete.name)
  })

  test('does not delete when the contact does not exist in the database', async () => {
    const { userName } = initialUsers[0]
    const user = await User.findOne({ userName })

    const userForToken = {
      id: user.id,
      userName: user.userName
    }

    const token = generateTempToken(userForToken)

    await api
      .delete('/api/contacts/1234')
      .set({ authorization: 'bearer ' + token })
      .expect(400)

    const contactDB = await getAllContacts()

    expect(contactDB).toHaveLength(initialContacts.length)
  })
})

describe('PUT / Upgrading a contact ', () => {
  test('when the contact exists in the database', async () => {
    const { userName } = initialUsers[0]
    const user = await User.findOne({ userName })

    const contactDB = await getAllContacts()
    const contactToUpdate = contactDB[0]

    const id = contactToUpdate.id

    const userForToken = {
      id: user.id,
      userName: user.userName
    }

    const token = generateTempToken(userForToken)

    const newContact = {
      name: 'Jaime',
      number: '040-41520'
    }

    await api
      .put(`/api/contacts/${id}`)
      .set({ authorization: 'bearer ' + token })
      .send(newContact)
      .expect(200)

    const response = await getContact(id)
    expect(response.body.name).toBe(newContact.name)
    expect(response.body.number).toBe(newContact.number)
  })
})

afterAll(() => {
  mongoose.connection.close()
  server.close()
})
