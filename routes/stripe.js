const router = require('express').Router()
const dotenv = require('dotenv')
dotenv.config()

const stripe = require('stripe')(process.env.STRIPE_KEY);
// const stripe = require('stripe')(process.env.STRIPE_KEY, {
//     apiVersion: "2022-08-01",
// })

router.get('/config', (req, res) => {
    res.status(200).json({
        publishableKey: process.env.STRIPE_PKEY,
    })
})

router.post('/create-payment-intent', async (req, res) => {
    try {
        const paymentIntent = await stripe.paymentIntents.create({
            currency: "EUR",
            amount: 1999,
            automatic_payment_methods: { enabled: true },
        });
        console.log(paymentIntent)
        res.send({ clientSecret: paymentIntent.client_secret })
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
})

router.post('/payment', (req, res) => {
    console.log(req)
    stripe.charges.create({
        source: req.body.tokenId,
        amount: req.body.amount,
        currency: "usd"
    }, (stripeErr, stripeRes) => {
        if (stripeErr) {
            res.status(500).json(stripeErr)
            console.log(stripeErr)
        } else {
            res.status(200).json(stripeRes)
        }
    })
})

module.exports = router