require('dotenv').config()

const connectionURI = process.env.MONGO_DB_URI
const environment = process.env.NODE_ENV

const express = require('express')
const cors = require('cors')
const app = express()

const { databaseConnection, databaseDisconnection } = require('./mongo')

const notFound = require('./middleware/notFound')
const handleError = require('./middleware/handleError')
const contactRouter = require('./controller/contacts')
const usersRouter = require('./controller/users')

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

/* app.get('/info', (request, response) => {
  const phonebookSize = Contact.length
  const time = new Date().toUTCString()
  response.send(`<div><p>Phonebook has info for ${phonebookSize} people<p/><p>${time}<p/><div/>`)
}) */

app.use('/api/contacts', contactRouter)
app.use('/api/users', usersRouter)

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
