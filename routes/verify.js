const jwt = require('jsonwebtoken')

const verifyToken = (req, res, next) => {
    // console.log(req)
    const authHeader = req.headers.authorization
    if (authHeader) {
        const token = authHeader.split(" ")[1]
        jwt.verify(token, process.env.JWTSECRET, (err, user) => {
            // console.log(user)
            if (err) res.status(403).json("Token is not Valid")
            req.user = user
            next()
        })
    } else {
        return res.status(401).json("user not authenticated")
    }
}

const verifyTokenAndAuth = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user.id === req.params.id || req.user.isAdmin) {
            next()
        } else {
            return res.status(401).json("user not authenticated")
        }
    })
}

const verifyTokenAndAdmin = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user.isAdmin) {
            next()
        } else {
            return res.status(401).json("only admin can update")
        }
    })
}

module.exports = { verifyToken, verifyTokenAndAuth, verifyTokenAndAdmin }