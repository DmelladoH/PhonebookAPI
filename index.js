require('dotenv').config()

const connectionURI = process.env.MONGO_DB_URI
const environment = process.env.NODE_ENV

const express = require('express')
const cors = require('cors')
const app = express()
const Contact = require('./models/Contact')
const { databaseConnection, databaseDisconnection } = require('./mongo')

const notFound = require('./middleware/notFound')
const handleError = require('./middleware/handleError')

app.use(express.json())
app.use(cors())

databaseConnection(connectionURI, environment)

const requestLogger = (request, response, next) => {
  console.log('Method: ', request.method)
  console.log('Path: ', request.path)
  console.log('Body: ', request.body)
  console.log('------')

  next()
}

app.use(requestLogger)

app.get('/info', (request, response) => {
  const phonebookSize = Contact.length
  const time = new Date().toUTCString()
  response.send(`<div><p>Phonebook has info for ${phonebookSize} people<p/><p>${time}<p/><div/>`)
})

app.get('/api/contacts', async (request, response) => {
  const contact = await Contact.find({})
  response.json(contact)
})

app.get('/api/contacts/:id', (request, response, next) => {
  const { id } = request.params

  Contact.findById(id).then(contact => {
    if (contact) response.json(contact)
    response.status(404).end()
  }).catch(err => next(err))
})

app.post('/api/contacts', async (request, response, next) => {
  const body = request.body

  if (!body.name || !body.number) {
    return response.status(400).json({
      error: 'The name or number is missing'
    })
  }

  const checkContact = await Contact.findOne({ name: body.name }).exec()

  if (checkContact) {
    return response.status(400).json({
      error: 'The name already exists in the phonebook'
    })
  }

  const contact = new Contact({
    name: body.name,
    number: body.number
  })

  try {
    const saverdContact = await contact.save()
    response.json(saverdContact)
  } catch (err) {
    next(err)
  }
})

app.delete('/api/contacts/:id', async (request, response, next) => {
  const { id } = request.params

  try {
    await Contact.findByIdAndDelete(id)
    response.status(204).end()
  } catch (err) {
    next(err)
  }
})

app.put('/api/contacts/:id', (request, response, next) => {
  const { id } = request.params
  const contact = request.body

  const newContact = {
    name: contact.name,
    number: contact.number
  }

  Contact.findByIdAndUpdate(id, newContact, { new: true }).then(contact => {
    response.json(contact)
  }).catch(err => next(err))
})

app.use(notFound)

app.use(handleError)

process.on('uncaughtException', () => {
  databaseDisconnection()
})

const PORT = process.env.PORT

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

module.exports = { app, server }
