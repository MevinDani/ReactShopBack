const router = require('express').Router()
const Product = require('../models/product')
const { verifyToken, verifyTokenAndAuth, verifyTokenAndAdmin } = require('./verify')


// create product
router.post('/', verifyTokenAndAdmin, async (req, res) => {
    const newProduct = new Product(req.body)
    try {
        const savedProduct = await newProduct.save()
        res.status(200).json(savedProduct)
    } catch (error) {
        res.status(500).json(error)
    }
})

// update product
router.put('/:id', verifyTokenAndAdmin, async (req, res) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id,
            {
                $set: req.body
            },
            { new: true }
        )
        res.status(201).json(updatedProduct)
    } catch (error) {
        res.status(500).json(error)
    }
})

// deleteProduct
router.delete('/:id', verifyTokenAndAdmin, async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id)
        res.status(201).json('Product deleted')
    } catch (error) {
        res.status(500).json(error)
    }
})

// get product
router.get('/find/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
        res.status(200).json(product)
    } catch (error) {
        res.status(500).json(error)
    }
})

// get all product
router.get('/', async (req, res) => {
    const qNew = req.query.new
    const qCat = req.query.category
    // console.log(qCat)
    try {
        let products;
        if (qNew) {
            products = await Product.find().sort({ createdAt: -1 }).limit(5)
        } else if (qCat) {
            products = await Product.find({
                categories: {
                    $in: [qCat]
                }
            })
        } else {
            products = await Product.find()
        }
        res.status(200).json(products)
    } catch (error) {
        res.status(500).json(error)
    }
})

module.exports = router