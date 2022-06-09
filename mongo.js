const mongoose = require('mongoose')

function databaseConnection (connectionURI, envarionment) {
  console.log(envarionment)
  if (envarionment === 'test') {
    console.log('mocking database')
    const Mockgoose = require('mockgoose').Mockgoose
    const mockgoose = new Mockgoose(mongoose)

    mockgoose.prepareStorage().then(() => {
      mongoConnection(connectionURI)
    })
  } else {
    console.log('connecting to database')
    mongoConnection(connectionURI)
  }
}

function databaseDisconnection () {
  mongoose.disconnect()
}

function mongoConnection (connectionURI) {
  mongoose.connect(connectionURI)
    .then(() => {
      console.log('Database connected')
    }).catch(err => {
      console.error(err)
    })
}

module.exports = { databaseConnection, databaseDisconnection }
