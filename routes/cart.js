const router = require('express').Router()
const Cart = require('../models/cart')
const { verifyToken, verifyTokenAndAuth, verifyTokenAndAdmin } = require('./verify')

// create cart
router.post('/', verifyToken, async (req, res) => {
    const newCart = new Cart(req.body)
    try {
        const savedCart = await newCart.save()
        res.status(200).json(savedCart)
    } catch (error) {
        res.status(500).json(error)
    }
})

// update cart
router.put('/:id', verifyTokenAndAuth, async (req, res) => {
    try {
        const updatedCart = await Cart.findByIdAndUpdate(req.params.id,
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

// deleteCart
router.delete('/:id', verifyTokenAndAuth, async (req, res) => {
    try {
        await Cart.findByIdAndDelete(req.params.id)
        res.status(201).json('Cart deleted')
    } catch (error) {
        res.status(500).json(error)
    }
})

// get user cart
router.get('/find/:id', verifyTokenAndAuth, async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.params.id })
        res.status(200).json(cart)
    } catch (error) {
        res.status(500).json(error)
    }
})

// get all carts
router.get('/', verifyTokenAndAdmin, async (req, res) => {
    try {
        const carts = await Cart.find()
        res.status(200).json(carts)
    } catch (error) {
        res.status(500).json(error)
    }
})

module.exports = router