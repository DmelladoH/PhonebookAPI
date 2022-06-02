const http = require('http')
const express = require('express')

const app = express()

const phonebook = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]


app.get('/api/persons', (request, response) => {
    response.json(phonebook)
})

app.get('/api/persons/:id',(request, response) => {
    const id = Number(request.params.id)
    const person = phonebook.find(person => person.id === id)

    if(person){
        response.json(person)
    }else{
        response.status(404).end()
    }

    
})

app.get('/info',(request, response) => {
    
    const phonebookSize = phonebook.length
    const time = new Date().toUTCString()
    response.send(`<div><p>Phonebook has info for ${phonebookSize} people<p/><p>${time}<p/><div/>`)

})
const PORT = 3001
app.listen(PORT)
console.log(`Server running on port ${PORT}`)