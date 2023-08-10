const router = require('express').Router()
const dotenv = require('dotenv')
const express = require('express')
const { Order } = require('../models/order')
dotenv.config()


const stripe = require('stripe')(process.env.STRIPE_KEY);
// const stripe = require('stripe')(process.env.STRIPE_KEY, {
//     apiVersion: "2022-08-01",
// })

// chooloo
router.post('/create-checkout-session', async (req, res) => {

    // console.log(req.body.cartItems)

    const customer = await stripe.customers.create({
        metadata: {
            userId: req.body.userId,
            // cart: JSON.stringify(req.body.cartItems),
        }
    })

    // cart: JSON.stringify(req.body.cartItems)


    const line_items = req.body.cartItems.map((item) => {
        console.log("items", item)
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
        shipping_address_collection: {
            allowed_countries: ['US', 'CA', 'IN'],
        },
        customer: customer.id,
        line_items,
        mode: 'payment',
        success_url: `${process.env.CLIENT_URL}/checkout_success`,
        cancel_url: `${process.env.CLIENT_URL}/cart`,
    })
    // console.log("ltms", line_items)
    // console.log("sess", session)
    res.send({ url: session.url, session })
})

// createOrderMongo
const createOrder = async (customer, data, lineItems) => {
    // const Items = JSON.parse(customer.metadata.cart)
    // console.log(Items)

    const newOrder = new Order({
        userId: customer.metadata.userId,
        customerId: data.customer,
        paymentIntentId: data.payment_intent,
        products: lineItems.data,
        subtotal: data.amount_subtotal,
        total: data.amount_total,
        shipping: data.customer_details,
        payment_status: data.payment_status
    })

    try {
        const savedOrder = await newOrder.save()
        console.log(savedOrder, "processedOrder")
    } catch (error) {
        console.log(error)
    }

    // const product = await stripe.products.retrieve(
    //     'prod_OOv7QDl6D2417F'
    // );
    // console.log(product, "strpproduct")
}

// webhook

// This is your Stripe CLI webhook secret for testing your endpoint locally.
let endpointSecret;
// endpointSecret = "whsec_4f0f24b4ff3a5595fb66f6562eb2009e21bd9200475b40316bae91290acbc91f";

router.post('/webhook',
    express.raw({ type: 'application/json' }),
    (req, res) => {
        console.log("webhk", req.body.data.object)
        const sig = req.headers['stripe-signature'];

        let data;
        let eventType;

        if (endpointSecret) {
            let event;
            try {
                event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
                console.log("webhook verified")
            } catch (err) {
                console.log("webhookError", err.message)
                response.status(400).send(`Webhook Error: ${err.message}`);
                return;
            }
            data = event.data.object
            eventType = event.type
        } else {
            data = req.body.data.object
            eventType = req.body.type
        }


        // Handle the event
        if (eventType === 'checkout.session.completed') {
            stripe.customers.retrieve(data.customer)
                .then((customer) => {
                    stripe.checkout.sessions.listLineItems(
                        data.id,
                        {},
                        function (err, lineItems) {
                            console.log('lineitems', lineItems.data[0].price, "data", data)
                            createOrder(customer, data, lineItems)
                        }
                    )
                })
                .catch((err) => console.log(err))
        }
        // switch (event.type) {
        //     case 'payment_intent.succeeded':
        //         const paymentIntentSucceeded = event.data.object;
        //         // Then define and call a function to handle the event payment_intent.succeeded
        //         break;
        //     // ... handle other event types
        //     default:
        //         console.log(`Unhandled event type ${event.type}`);
        // }

        // Return a 200 response to acknowledge receipt of the event
        res.send().end();
    });


// router.get('/config', (req, res) => {
//     res.status(200).json({
//         publishableKey: process.env.STRIPE_PKEY,
//     })
// })

// router.post('/create-payment-intent', async (req, res) => {
//     try {
//         const paymentIntent = await stripe.paymentIntents.create({
//             currency: "EUR",
//             amount: 1999,
//             automatic_payment_methods: { enabled: true },
//         });
//         console.log(paymentIntent)
//         res.send({ clientSecret: paymentIntent.client_secret })
//     } catch (error) {
//         console.log(error)
//         res.status(500).json(error)
//     }
// })

// router.post('/payment', (req, res) => {
//     console.log(req)
//     stripe.charges.create({
//         source: req.body.tokenId,
//         amount: req.body.amount,
//         currency: "usd"
//     }, (stripeErr, stripeRes) => {
//         if (stripeErr) {
//             res.status(500).json(stripeErr)
//             console.log(stripeErr)
//         } else {
//             res.status(200).json(stripeRes)
//         }
//     })
// })

module.exports = router