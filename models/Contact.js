const { Schema, model } = require('mongoose')

const contactSchema = new Schema({
  name: String,
  number: String,
  users: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }]
})

contactSchema.set('toJSON', {
  transform: (documentm, returnedObject) => {
    returnedObject.id = returnedObject._id
    delete returnedObject.__v
    delete returnedObject._id
  }
})

const Contact = model('Contact', contactSchema)

module.exports = Contact
