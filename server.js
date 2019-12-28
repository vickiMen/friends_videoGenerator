const express = require('express')
const app = express()
const port = process.env.SERVER_PORT || 3000
const path = require('path')
const bodyParser = require('body-parser')
const api = require('./server/routes/api')
const mongoose = require('mongoose')


const pass = 'T23Cd93@g62EmrQ'

const DB_URL = `mongodb://vicki:${encodeURIComponent(pass)}@ds127506.mlab.com:27506/heroku_drzf9z0f`

const connectionOptions = {
        // poolSize: 20,
        socketTimeoutMS: 0,
        connectTimeoutMS: 0,
        useNewUrlParser: true,
        useFindAndModify: false,
        useUnifiedTopology: true
}

mongoose.connect(DB_URL, connectionOptions, (err) => {
    if (err) {
        console.log(err.message)
    } else {
        console.log('The Mongoose connection is ready');
    }
})


app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

app.use(express.static(path.join(__dirname, 'dist')))
app.use(express.static(path.join(__dirname, 'node_modules')))
app.use('/', api)

app.listen(port, () => console.log(`Server is running on port ${port}`));