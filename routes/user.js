const router = require('express').Router()
const { Order } = require('../models/order');
const { User } = require('../models/user');
const cloudinary = require('../utils/cloudinary');
const dotenv = require('dotenv')
const { verifyToken, verifyTokenAndAuth, verifyTokenAndAdmin, verifyTokenAndAuthForReview } = require('./verify')
dotenv.config()


const stripe = require('stripe')(process.env.STRIPE_KEY);



// update user
router.put('/:id', verifyTokenAndAuth, async (req, res) => {
    console.log(req)
    const { username, email, profilePic } = req.body.data
    console.log(username, email, profilePic)

    try {
        if (profilePic) {
            const uploadRes = await cloudinary.uploader.upload(profilePic, {
                upload_preset: "react-shop"
            })
            // console.log(uploadRes)
            if (uploadRes) {
                const user = await User.findByIdAndUpdate(req.params.id, {
                    $set: {
                        username,
                        email,
                        profilePic: uploadRes.url
                    }
                }, { new: true })
                const { password, ...others } = user._doc
                res.status(200).json(others)
            }
        } else {
            const user = await User.findByIdAndUpdate(req.params.id, {
                $set: {
                    username,
                    email
                }
            }, { new: true })
            const { password, ...others } = user._doc
            res.status(200).json(others)
        }
    } catch (error) {
        res.status(500).json(error)
    }

})

// delete user
router.delete('/:id', verifyTokenAndAuth, async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id)
        res.status(201).json(deletedUser)
    } catch (error) {
        res.status(500).json(error)
    }
})

// get user(only admin)
router.get('/find/:id', verifyTokenAndAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        const { password, ...others } = user._doc
        res.status(200).json(others)
    } catch (error) {
        res.status(500).json(error)
    }
})

// get all users(only admin)
router.get('/', verifyTokenAndAdmin, async (req, res) => {
    const query = req.query.new
    try {
        const users = query ? await User.find().sort({ _id: -1 }).limit(5) : await User.find().sort({ _id: -1 })
        res.status(200).json(users)
    } catch (error) {
        res.status(500).json(error)
    }
})

// getUser stats(only admin)
router.get('/stats', verifyTokenAndAdmin, async (req, res) => {
    const date = new Date()
    const lastYear = new Date(date.setFullYear(date.getFullYear() - 1))

    try {
        const data = await User.aggregate([
            { $match: { createdAt: { $gte: lastYear } } },
            {
                $project: {
                    month: { $month: "$createdAt" }
                }
            },
            {
                $group: {
                    _id: "$month",
                    total: { $sum: 1 }
                }
            }
        ])
        res.status(200).json(data)
    } catch (error) {
        res.status(500).json(error)
    }
})

router.get('/orders/:id', async (req, res) => {
    let stripeData = []
    let fullData = []
    let fullOrder = []
    let product;
    // console.log("userOrderreq")
    try {
        const orders = await Order.find({ userId: req.params.id })

        for (const item of orders) {
            // console.log("item", item)
            fullOrder.push(item)
            for (const i of item.products) {
                fullData.push(i)
                // console.log("i", i)
                product = await stripe.products.retrieve(i.price.product);
                stripeData.push(product)
            }
        }
        res.status(200).json({ stripeData, fullData, fullOrder, orders })
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }

    // const paymentIntent = await stripe.paymentIntents.retrieve(
    //     'pi_3NcMY4SAAbSbcDjO0amzymOq'
    // );
    // console.log("paymentIntent", paymentIntent)
})

// get users profilePics
router.get('/profilePic/:id/:userId', verifyTokenAndAuthForReview, async (req, res) => {
    const { id } = req.params
    try {
        const user = await User.findById(id)
        res.status(200).json(user.profilePic)
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
})

router.put('/order/:id/recieved/:lid', verifyTokenAndAuth, async (req, res) => {
    // console.log(req.params)
    try {
        const user = await User.findById(req.params.id)
        const order = await Order.find({ userId: req.params.id })
        let orderId
        // console.log(order)
        if (order) {
            for (o of order) {
                // console.log("0", o)
                for (i of o.products) {
                    // console.log("i", i)
                    if (req.params.lid == i.id) {
                        // console.log("insode", req.params.lid, i.id, o._id)
                        orderId = o._id
                    }
                }
            }
        }
        if (orderId) {
            try {
                const updateOrder = await Order.findById(orderId);

                if (updateOrder) {
                    // Update the delivery status
                    updateOrder.delivery_status = 'delivered'; // Replace with your desired status

                    // Save the updated order
                    await updateOrder.save();

                    console.log('Order updated:', updateOrder);
                    res.status(200).json(updateOrder)
                } else {
                    console.log('Order not found');
                }
            } catch (error) {
                console.error('Error updating order:', error);
            }
        }
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
})



module.exports = router