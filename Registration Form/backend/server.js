const express = require('express')
const mongoose = require('mongoose')

const UserController = require('./userController.js')

const app = express()
app.use(express.json())
app.use(express.urlencoded())

const cors = require('cors')
app.use(cors({
    origin: 'http://127.0.0.1:5500',
    optionsSuccessStatus: 200
}))

require('dotenv').config()
const PORT = process.env.PORT || 3500

const DB_URI = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wr5i0wi.mongodb.net/?retryWrites=true&w=majority`

mongoose.connect(DB_URI)

mongoose.connection.on('error', () => {
    console.log(`Couldn't connect to database. Trying again...`)
    mongoose.connect(DB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
})

mongoose.connection.once('open', () => {
    console.log('Connected to database!')
})

app.route('/login').post(UserController.loginUser)
app.route('/get-otp').post(UserController.generateOtp)
app.route('/resend-otp').post(UserController.resendOtp)
app.route('/register').post(UserController.registerNewUser)

app.listen(PORT, () => {
    console.log('Server is listening to PORT ' + PORT + "...")
})
