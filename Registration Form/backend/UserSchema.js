const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    email: {
        type: String,
    default: true
    },
    username: {
        type: String,
        default: true
    },
    password: {
        type: String,
        default: true
    }
})

const User = mongoose.model('User', userSchema)

module.exports = User