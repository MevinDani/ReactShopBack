const router = require('express').Router()
const { Product, Review } = require('../models/product')
const { verifyToken, verifyTokenAndAuth, verifyTokenAndAdmin, verifyTokenAndAuthForReview } = require('./verify')



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
        } else if (qCat === 'all') {
            products = await Product.find()
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

// add review to a product
router.post('/:productId/review/:userId', verifyTokenAndAuthForReview, async (req, res) => {
    const { productId } = req.params
    const { content, rating, userId, name } = req.body

    try {
        const review = new Review({
            content,
            rating,
            productId,
            userId,
            name
        })

        await review.save()

        const product = await Product.findByIdAndUpdate(productId, { $push: { reviews: review._id } }, { new: true })
        res.status(200).json({ review, product })
    } catch (error) {
        console.error('Failed to add review', error);
        res.status(500).json({ error: 'Failed to add review' });
    }
})

// get product review
router.get('/:productId/reviews', async (req, res) => {
    const { productId } = req.params
    try {
        const product = await Product.findById(productId).populate('reviews')
        const reviews = product.reviews
        res.status(200).json(reviews)
    } catch (error) {
        console.log(error)
        res.status(500).json(error)
    }
})

module.exports = router