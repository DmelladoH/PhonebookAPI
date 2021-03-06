const bcrypt = require('bcrypt')

const userRouter = require('express').Router()
const User = require('../models/User')

userRouter.get('/', async (request, response) => {
  const user = await User.find({}).populate('contacts', {
    name: 1,
    number: 1
  })
  response.json(user)
})

userRouter.get('/:id', async (request, response, next) => {
  const { id } = request.params

  try {
    const user = await User.findById(id)
    response.json(user)
  } catch (err) {
    next(err)
  }
})

userRouter.post('/', async (request, response, next) => {
  const body = request.body
  const saltRounds = 10

  try {
    if (!body.password) {
      return response.status(400).json({
        error: 'password required'
      })
    }

    const passwordHash = await bcrypt.hash(body.password, saltRounds)

    const user = new User({
      userName: body.userName,
      name: body.name,
      password: passwordHash
    })

    const savedUser = await user.save()
    response.json(savedUser)
  } catch (error) {
    response.status(400).json(error)
  }
})

userRouter.delete('/:id', async (request, response, next) => {
  const { id } = request.params

  try {
    await User.findByIdAndDelete(id)
    response.status(204).end()
  } catch (err) {
    next(err)
  }
})

/*
userRouter.put('/:id', async (request, response, next) => {
    const{id} =request.params
    const user = request.body

    const updatedUser = {
        username: user.userName

    }
}) */

module.exports = userRouter
