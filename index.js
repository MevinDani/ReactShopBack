const express = require('express')
const app = express()
const mongoose = require('mongoose')
const dotenv = require('dotenv')
const userRoute = require('./routes/user')
const authRoute = require('./routes/auth')
const productRoute = require('./routes/product')
const cartRoute = require('./routes/cart')
const orderRoute = require('./routes/order')
const stripeRoute = require('./routes/stripe')
const cors = require('cors')
// const env = require("dotenv").config({ path: "./.env" });

dotenv.config()

mongoose.connect(process.env.MONGO_URL)
    .then(() => {
        console.log("db connection successfull")
    }).catch((error) => {
        console.log(error)
    });

app.use(cors())
app.use(express.json({ limit: '50mb' }))

app.use('/api/auth', authRoute)
app.use('/api/users', userRoute)
app.use('/api/products', productRoute)
app.use('/api/carts', cartRoute)
app.use('/api/orders', orderRoute)
app.use('/api/stripe', stripeRoute)

app.listen(process.env.PORT || 5000, () => {
    console.log("express app is running on 5000")
})
