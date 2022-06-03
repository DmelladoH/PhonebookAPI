const http = require('http')
const express = require('express')
const app = express()
app.use(express.json())

let phonebook = [
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


app.get('/info',(request, response) => {
    
    const phonebookSize = phonebook.length
    const time = new Date().toUTCString()
    response.send(`<div><p>Phonebook has info for ${phonebookSize} people<p/><p>${time}<p/><div/>`)

})


app.get('/api/persons', (request, response) => {
    response.json(phonebook)
})

app.get('/api/persons/:id',(request, response) => {
    const id = Number(request.params.id)
    person = phonebook.find(person => person.id === id)

    if(person){
        response.json(person)
    }else{
        response.status(404).end()
    }

})


app.post('/api/persons', (request, response) => {

    const body = request.body


    if(!body.name || !body.number){
        return response.status(400).json({
            error: 'The name or number is missing'
        })
    }

    if(phonebook.find(person => person.name === body.name)){
        return response.status(400).json({
            error: 'The name already exists in the phonebook'
        })
    }

    const person = {
        id: Math.floor(Math.random() * 1000),
        name: body.name, 
        number: body.number
    }

    phonebook = phonebook.concat(person)
    response.json(person)
   
})

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    phonebook = phonebook.filter(person => person.id !== id)

    response.status(204).end()
})

const PORT = 3001
app.listen(PORT)
console.log(`Server running on port ${PORT}`)