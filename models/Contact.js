const mongoose = require('mongoose')
const { Schema, model } = mongoose

const contactScheme = new Schema({
  name: String,
  number: String
})

contactScheme.set('toJSON', {
  transform: (documentm, returnedObject) => {
    returnedObject.id = returnedObject._id
    delete returnedObject.__v
    delete returnedObject._id
  }
})

const Contact = model('Contact', contactScheme)

module.exports = Contact
