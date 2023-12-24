const User = require('./UserSchema')
const bcrypt = require('bcrypt')
const asyncHandler = require('express-async-handler')
const nodemailer = require('nodemailer')
const otpGenerator = require('otp-generator')
const fs = require('fs/promises')
const { setTimeout } = require('timers')

const generateOtp = asyncHandler(async(req, res) => {
    const {username, email, password} = req.body
    console.log(username, email, password)
    let duplicate = await User.findOne({username})
    if (duplicate) {
        console.log('checkpoint 1')
        return res.status(400).json({ message: "Username is already taken." })
    } 
    duplicate = await User.findOne({email})
    if (duplicate) {
        console.log('checkpoint 2')
        return res.status(400).json({ message: "Account already exists for this E-mail." })
    }
    const hashPwd = await bcrypt.hash(password, 10)
    const otp = otpGenerator.generate(6)
    const otpCombo = { user: {username, email, password: hashPwd}, otp }
    try {
        console.log('checkpoint 3')
        await fs.writeFile(`otps/${email}.json`, JSON.stringify(otpCombo))
        res.status(200).json({ message: "OTP sent." })
        
        setTimeout(async function() {
            await fs.unlink(`otps/${email}.json`, (error) => {
                if (error)
                    console.log(error)
                else 
                    console.log('checkpoint 3.5')
            })
        }, 360000)
        console.log('checkpoint 4')
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error.' }) 
    }
    
    
})

const registerNewUser = asyncHandler(async(req, res) => {
    const {otp, email} = req.body
    let expiredFlag = false
    const userData = await fs.readFile(`otps/${email}.json`, 'utf-8', (error, data) => {
        if (error) {
            expiredFlag = !expiredFlag
        } else {
            return data
        }
    })
    if (expiredFlag) {
        return res.status(400).json({ message: "OTP expired. Please register again." })
    }
    if (otp !== JSON.parse(userData).otp) {
        return res.status(400).json({ message: "Incorrect OTP. Please try again." })
    } 
    const newUser = {
        username: JSON.parse(userData).user.username,
        email: JSON.parse(userData).user.email,
        password: JSON.parse(userData).user.password
    }
    const addedUser = await User.create(newUser)
    if (!addedUser) {
        return res.status(500).json({ message: "Some error occurred while registering. Please try again." })
    } else {
        return res.status(200).json({ message: "You're successfully registered." })
    }
})

const loginUser = asyncHandler(async(req, res) => {
    const {username, password} = req.body
    const account = await User.findOne({username})
    if (!account) {
        return res.status(400).json({ message: "Incorrect username or password." })
    }
    const passwordMatched = await bcrypt.compare(password, account.password)
    if (!passwordMatched) {
        return res.status(400).json({ message: "Incorrect username or password." })
    } else {
        return res.status(200).json({ username: username })
    }
})

module.exports = {
    generateOtp,
    registerNewUser,
    loginUser
}