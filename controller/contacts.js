
const contactRouter = require('express').Router()
const Contact = require('../models/Contact')

contactRouter.get('/', async (request, response) => {
  const contact = await Contact.find({})
  response.json(contact)
})

contactRouter.get('/', async (request, response) => {
  const contact = await Contact.find({})
  response.json(contact)
})

contactRouter.get('/:id', (request, response, next) => {
  const { id } = request.params

  Contact.findById(id).then(contact => {
    if (contact) response.json(contact)
    response.status(404).end()
  }).catch(err => next(err))
})

contactRouter.post('/', async (request, response, next) => {
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

contactRouter.delete('/:id', async (request, response, next) => {
  const { id } = request.params

  try {
    await Contact.findByIdAndDelete(id)
    response.status(204).end()
  } catch (err) {
    next(err)
  }
})

contactRouter.put('/:id', (request, response, next) => {
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

module.exports = contactRouter
