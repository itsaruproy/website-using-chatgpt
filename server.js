const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const session = require('express-session')
const MongoStore = require('connect-mongo')
const mongoose = require('mongoose')
require('dotenv').config()

//connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
const db = mongoose.connection

//handle mongo error
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', function () {
    // we're connected!
})

//use sessions for tracking logins
app.use(
    session({
        secret: 'work hard',
        resave: true,
        saveUninitialized: false,
        store: MongoStore.create({
            mongoUrl: process.env.MONGO_URI,
        }),
    })
)

// parse incoming requests
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
// set the view engine to ejs
app.set('view engine', 'ejs')

// serve static files from template
app.use(express.static(__dirname + '/views'))

// include routes
const routes = require('./routes/router')
app.use('/', routes)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    const err = new Error('File Not Found')
    err.status = 404
    next(err)
})

// error handler
// define as the last app.use callback
app.use(function (err, req, res, next) {
    res.status(err.status || 500)
    res.send(err.message)
})

// listen on port 3000
app.listen(3000, function () {
    console.log('Express app listening on port 3000')
})
