const router = require('express').Router()
const User = require('../models/user')
const CryptoJS = require('crypto-js')
const jwt = require('jsonwebtoken')

// register
router.post('/register', async (req, res) => {

    const { username, email, password } = req.body
    if (!username || !email || !password) {
        return res.status(400).json({
            message: "all input fields are required"
        })
    }

    const newUser = new User({
        username: req.body.username,
        email: req.body.email,
        password: CryptoJS.AES.encrypt(password, process.env.PASS_SECRET).toString()
    });

    try {
        const savedUser = await newUser.save()
        res.status(201).json(savedUser)
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "user with same username or email exists"
        })
    }

})

// LOGIN
router.post('/login', async (req, res) => {
    // console.log(req.body)
    const { username, password } = req.body
    if (!username || !password) {
        return res.status(400).json({
            message: "both username and password is required"
        })
    }
    try {
        const user = await User.findOne({ username })

        if (!user) return res.status(401).json("No USER Found")

        if (user) {

            const hashedPassword = CryptoJS.AES.decrypt(user.password, process.env.PASS_SECRET)
            const pass = hashedPassword.toString(CryptoJS.enc.Utf8)

            if (pass !== req.body.password) {
                return res.status(401).json("Wrong credentials")
            }

            const accessToken = jwt.sign({
                id: user._id,
                isAdmin: user.isAdmin
            }, process.env.JWTSECRET,
                { expiresIn: "2d" })

            const { password, ...others } = user._doc
            res.status(200).json({ ...others, accessToken })
        } else {
            res.status(500).json({
                message: "username and password required"
            })
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message: "username and password required"
        })
    }
})

module.exports = router