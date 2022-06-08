const { Schema, model } = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const contactSchema = new Schema({
  name: {
    type: String,
    unique: true,
    required: [true, 'name required']
  },

  number: {
    type: String,
    required: [true, 'phonenumber required']
  },
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

contactSchema.plugin(uniqueValidator)
const Contact = model('Contact', contactSchema)

module.exports = Contact
