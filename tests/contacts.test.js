const mongoose = require('mongoose')

const { server } = require('../index')
const {
  initialContacts,
  api,
  getAllContacts,
  getContact
} = require('./helpers')

const Contact = require('../models/Contact')

// integration test

beforeEach(async () => {
  await Contact.deleteMany({})

  for (const contact of initialContacts) {
    const contactObject = new Contact(contact)
    await contactObject.save()
  }
})

describe('GET / getting ', () => {
  test('all contacts', async () => {
    const response = await getAllContacts()

    expect(response.status).toBe(200)
    expect(response.body).toHaveLength(initialContacts.length)
  })

  test('a contact when the id is valid', async () => {
    const response = await getAllContacts()
    const firstContact = response.body[0]

    const id = firstContact.id
    const name = firstContact.name
    const number = firstContact.number

    const secondResponse = await getContact(id)

    expect(secondResponse.status).toBe(200)
    expect(secondResponse.body.name).toBe(name)
    expect(secondResponse.body.number).toBe(number)
  })

  test('an error when the id is not valid', async () => {
    const invalidId = 1234

    const secondResponse = await getContact(invalidId)

    expect(secondResponse.status).toBe(400)
  })
})

describe('POST / a new Contact ', () => {
  test('is created when it is correct', async () => {
    const newContact = {
      name: 'Carlos',
      number: '000-00000'
    }

    await api
      .post('/api/contacts')
      .send(newContact)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const response = await getAllContacts()
    expect(response.body).toHaveLength(initialContacts.length + 1)
    expect(response.body.map(contact => contact.name))
      .toContain(newContact.name)
  })

  test('is not created without the name field', async () => {
    const newInvalidContact = {
      number: '000-00000'
    }

    await api
      .post('/api/contacts')
      .send(newInvalidContact)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const response = await getAllContacts()
    expect(response.body).toHaveLength(initialContacts.length)
  })

  test('is not created without the number field', async () => {
    const newInvalidContact = {
      name: 'Carlos'
    }

    await api
      .post('/api/contacts')
      .send(newInvalidContact)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const response = await getAllContacts()
    expect(response.body).toHaveLength(initialContacts.length)
  })

  test('is not created when the contact is already created', async () => {
    const newInvalidContact = {
      name: initialContacts[0].name,
      number: '000-00000'
    }

    await api
      .post('/api/contacts')
      .send(newInvalidContact)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    const response = await getAllContacts()
    expect(response.body).toHaveLength(initialContacts.length)
  })
})

describe('DELETE / deleting contacts ', () => {
  test('when exists in the database', async () => {
    const response = await getAllContacts()
    const noteToDelete = response.body[0]

    await api
      .delete(`/api/contacts/${noteToDelete.id}`)
      .expect(204)

    const secondResponse = await getAllContacts()

    expect(secondResponse.body).toHaveLength(initialContacts.length - 1)
    expect(secondResponse.body.map(contact => contact.name)).not.toContain(noteToDelete.name)
  })

  test('does not delete when the contact does not exist in the database', async () => {
    await api
      .delete('/api/contacts/1234')
      .expect(400)

    const response = await getAllContacts()

    expect(response.body).toHaveLength(initialContacts.length)
  })
})

describe('PUT / Upgrading a contact ', () => {
  test('when the contact exists in the database', async () => {
    const response = await getAllContacts()
    const contactToUpdate = response.body[0]

    const id = contactToUpdate.id

    const newContact = {
      name: 'Jaime',
      number: '040-41520'
    }

    await api
      .put(`/api/contacts/${id}`)
      .send(newContact)
      .expect(200)

    const secondResponse = await getContact(id)
    expect(secondResponse.body.name).toBe(newContact.name)

    expect(secondResponse.body.number).toBe(newContact.number)
  })
})

afterAll(() => {
  mongoose.connection.close()
  server.close()
})
