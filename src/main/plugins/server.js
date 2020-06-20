const express = require('express')
const bodyParser = require("body-parser")
const app = express()
const port = 0 // to get port from os.

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

const routes = require('./express/routes')

// all route will point to /passman
app.use('/passman', routes)

const server = app.listen(port, () => {
    process.env.PASSMAN_BACKEND_PORT = server.address().port
    console.log(`Backend started at http://localhost:${server.address().port}`)
})
