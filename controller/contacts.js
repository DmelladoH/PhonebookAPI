
const contactRouter = require('express').Router()
const Contact = require('../models/Contact')

contactRouter.get('/', async (request, response) => {
  const contact = await Contact.find({})
  response.json(contact)
})

contactRouter.get('/:id', async (request, response, next) => {
  const { id } = request.params

  try {
    const contact = await Contact.findById(id)
    response.json(contact)
  } catch (err) {
    next(err)
  }
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
    const savedContact = await contact.save()
    response.json(savedContact)
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

contactRouter.put('/:id', async (request, response, next) => {
  const { id } = request.params
  const contact = request.body

  const updatedContact = {
    name: contact.name,
    number: contact.number
  }

  try {
    await Contact.findByIdAndUpdate(id, updatedContact, { new: true })
    response.json(contact)
  } catch (err) {
    next(err)
  }
})

module.exports = contactRouter
