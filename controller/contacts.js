
const contactRouter = require('express').Router()
const Contact = require('../models/Contact')
const User = require('../models/User')
const userExtractor = require('../middleware/userExtractor')
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

contactRouter.post('/', userExtractor, async (request, response, next) => {
  try {
    const body = request.body
    const { userId } = request

    const user = await User.findById(userId)

    const contact = new Contact({
      name: body.name,
      number: body.number,
      user: userId
    })

    const savedContact = await contact.save()

    user.contacts = user.contacts.concat(savedContact._id)
    await user.save()

    response.json(savedContact)
  } catch (error) {
    response.status(400).json(error)
  }
})

contactRouter.delete('/:id', userExtractor, async (request, response, next) => {
  const { id } = request.params

  try {
    await Contact.findByIdAndDelete(id)
    response.status(204).end()
  } catch (err) {
    next(err)
  }
})

contactRouter.put('/:id', userExtractor, async (request, response, next) => {
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
