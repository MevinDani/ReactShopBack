const router = require('express').Router()
const { Order } = require('../models/order')
const { verifyToken, verifyTokenAndAuth, verifyTokenAndAdmin } = require('./verify')

// create order
router.post('/', verifyToken, async (req, res) => {
    const newOrder = new Order(req.body)
    try {
        const savedOrder = await newOrder.save()
        res.status(200).json(savedOrder)
    } catch (error) {
        res.status(500).json(error)
    }
})

// update cart
router.put('/:id', verifyTokenAndAdmin, async (req, res) => {
    try {
        const updatedCart = await Order.findByIdAndUpdate(req.params.id,
            {
                $set: req.body
            },
            { new: true }
        )
        res.status(201).json(updatedCart)
    } catch (error) {
        res.status(500).json(error)
    }
})

// delete Order
router.delete('/:id', verifyTokenAndAdmin, async (req, res) => {
    try {
        await Order.findByIdAndDelete(req.params.id)
        res.status(201).json('Order deleted')
    } catch (error) {
        res.status(500).json(error)
    }
})

// get user order
router.get('/find/:id', verifyTokenAndAdmin, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id)
        if (req.user.isAdmin) {
            res.status(200).json(order)
        } else {
            return res.status(403).json("Access denied")
        }
    } catch (error) {
        res.status(500).json(error)
    }
})

// get all carts
router.get('/', verifyTokenAndAdmin, async (req, res) => {
    try {
        const order = await Order.find().sort({ _id: -1 })
        res.status(200).json(order)
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
})

// get monthly income
router.get('/income', verifyTokenAndAdmin, async (req, res) => {
    const date = new Date()
    const lastMonth = new Date(date.setMonth(date.getMonth() - 1))
    const previousMonth = new Date(new Date().setMonth(lastMonth.getMonth() - 1))

    try {
        const income = await Order.aggregate([
            {
                $match: { createdAt: { $gte: previousMonth } }
            },
            {
                $project: {
                    month: { $month: "$createdAt" },
                    sales: "$amount"
                }
            },
            {
                $group: {
                    _id: "$month",
                    total: { $sum: $sale }
                }
            }
        ])
        res.status(200).json(income)
    } catch (error) {
        res.status(500).json(error)
    }
})

router.get('/totalIncome', verifyTokenAndAdmin, async (req, res) => {
    try {
        const income = await Order.aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: "$total" }
                }
            }
        ]);

        if (income.length > 0) {
            const totalIncome = income[0].total;
            res.status(200).json({ totalIncome });
        } else {
            res.status(200).json({ totalIncome: 0 });
        }
    } catch (error) {
        res.status(500).json(error)
    }
})


module.exports = router