require('dotenv').config()
require('./mongo.js')

const express = require('express')
const cors = require('cors')
const app = express()
const Contact = require('./models/Contact')

const notFound = require('./middleware/notFound')
const handleError = require('./middleware/handleError')

app.use(express.json())
app.use(cors())

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

app.get('/api/persons', (request, response) => {
  Contact.find({}).then(contacts => {
    response.json(contacts)
  })
})

app.get('/api/persons/:id', (request, response, next) => {
  const { id } = request.params

  Contact.findById(id).then(contact => {
    if (contact) response.json(contact)
    response.status(404).end()
  }).catch(err => next(err))
})

app.post('/api/persons', (request, response) => {
  const body = request.body

  if (!body.name || !body.number) {
    return response.status(400).json({
      error: 'The name or number is missing'
    })
  }

  if (Contact.findOne({ name: body.name })) {
    return response.status(400).json({
      error: 'The name already exists in the phonebook'
    })
  }

  const contact = new Contact({
    name: body.name,
    number: body.number
  })

  contact.save()
    .then(savedContact => {
      response.json(savedContact)
    })
})

app.delete('/api/persons/:id', (request, response, next) => {
  const { id } = request.params

  Contact.findByIdAndDelete(id).then(contact => {
    response.status(204).end()
  }).catch(err => next(err))
})

app.put('/api/persons/:id', (request, response, next) => {
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

const PORT = process.env.PORT

app.listen(PORT)
console.log(`Server running on port ${PORT}`)
