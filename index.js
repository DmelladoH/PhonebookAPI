require('dotenv').config()

const connectionURI = process.env.MONGO_DB_URI
const environment = process.env.NODE_ENV

const express = require('express')
const cors = require('cors')
const app = express()

const { databaseConnection, databaseDisconnection } = require('./mongo')

const notFound = require('./middleware/notFound')
const handleError = require('./middleware/handleError')
const requestLogger = require('./middleware/requestLogger')

const contactRouter = require('./controller/contacts')
const usersRouter = require('./controller/users')
const loginRouter = require('./controller/login')

app.use(express.json())
app.use(cors())

databaseConnection(connectionURI, environment)

app.use(requestLogger)

app.use('/api/contacts', contactRouter)
app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)

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
