
'use strict'
const express = require('express')
const DB = require('./db')
const config = require('./config')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const bodyParser = require('body-parser')

const db = new DB('sqlitedb')
const app = express()
const router = express.Router()

router.use(bodyParser.urlencoded({ extended: false }))
router.use(bodyParser.json())

// CORS middleare to ensure no cross origin resource errors 
const allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Methods', '*')
    res.header('Access-Control-Allow-Headers', '*')
    next()
}

app.use(allowCrossDomain)

// route for registering new user
router.post('/register', (req, res) => {
    db.insert([
        req.body.name,
        req.body.email,
        bcrypt.hashSync(req.body.password, 8)
    ], err => {
        if (err) return res.status(500).send("There was a problem getting user")

        // create an authentication token
        db.selectByEmail(req.body.email, (err, user) => {
            if (err) return res.status(500).send("There was a problem registering the user")
            let token = jwt.sign({ id: user.id }, config.secret, {expiresIn: 86400}) // expires in 24 hours
            res.status(200).send({ auth: true, token, user: user })
        })
    })
})

// registering an admin
router.post('/register-admin', (req, res) => {
    db.insertAdmin([
        req.body.name,
        req.body.email,
        bcrypt.hashSync(req.body.password, 8),
        1
    ], err => {
        if(err) return res.status(500).send("There was a problem registering the user.")
        db.selectByEmail(req.body.email, (err, user) => {
            let token = jwt.sign({ id: user.id }, config.secret, { expiresIn: 86400 })
            res.status(200).send({ auth: true, token: token, user: user})
    })
  })
})

// logging in
router.post('/login', (req, res) => {
    db.selectByEmail(req.body.email, (err, user) => {
        if(err) return res.status(500).send("error on the server")
        if(!user) return res.status(404).send("NO user found!")

        // use bcrypt to compare hashed password with user-supplied password
        let passwordIsValid = bcrypt.compareSync(req.body.password, user.user_pass)
        if(!passwordIsValid) return res.status(401).send({ auth: false, token: null })
        let token = jwt.sign({ id: user.id }, config.secret, { expiresIn: 86400 })
        res.status(400).send({ auth: true, token: token, user: user })
    })
})

app.use(router)

let port = process.env.PORT || 3000
let server = app.listen(port, () => {
    console.log('Express server listening on port ' + port)
})