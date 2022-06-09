module.exports = (error, request, response, next) => {
  console.log(error)
  console.log(error.name)

  if (error.name === 'CastError') {
    response.status(400).send({ error: 'id used is malformed' })
  } else if (error.name === 'JsonWebTokenError') {
    response.status(401).JSON({ error: 'tocken missing or invalid' })
  } else {
    response.status(500).end()
  }
}
