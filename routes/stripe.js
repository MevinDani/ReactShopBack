const router = require('express').Router()
const dotenv = require('dotenv')
dotenv.config()

const stripe = require('stripe')(process.env.STRIPE_KEY);
// const stripe = require('stripe')(process.env.STRIPE_KEY, {
//     apiVersion: "2022-08-01",
// })

// chooloo
router.post('/create-checkout-session', async (req, res) => {
    console.log(req.body.cartItems)
    const line_items = req.body.cartItems.map((item) => {
        return {
            price_data: {
                currency: 'usd',
                product_data: {
                    name: item.title,
                    images: [item.img],
                    description: item.desc,
                    metadata: {
                        id: item.id
                    }
                },
                unit_amount: item.price * 100,
            },
            quantity: item.quantity,
        }
    })
    const session = await stripe.checkout.sessions.create({
        line_items,
        mode: 'payment',
        success_url: `${process.env.CLIENT_URL}/checkout_success`,
        cancel_url: `${process.env.CLIENT_URL}/cart`,
    })
    res.send({ url: session.url })
})

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