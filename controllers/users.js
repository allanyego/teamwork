const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { User } = require('../models/users');

function login(req, res, _next) {
    User.findOne({ email: req.body.email })
        .then(async user => {
            if (!user) {
                return res.status(401).json({
                    error: "User not found"
                });
            }

            try {
                const valid = await bcrypt.compare(req.body.password, user.password);
                if (!valid) {
                    return res.status(401).json({
                        error: "Incorrect email + password combo"
                    });
                }

                const token = jwt.sign(
                    { userId: user._id },
                    "RANDOM_TOKEN_SECRET",
                    { expiresIn: '24h' }
                );

                res.status(200).json({
                    userId: user._id,
                    token: token
                })
            } catch(error) {
                res.status(500).json({
                    err: error
                });
            }
        })
        .catch(error => {
            res.status(500).json({
                error: error
            })
        })
}

function signup(req, res, _next) {
    bcrypt.hash(req.body.password, 10)
        .then(hash => {
            const user = new User({
                email: req.body.email,
                password: hash
            });

            user.save()
                .then(() => {
                    res.status(201).json({
                        message: 'User registered successfully.'
                    });
                })
                .catch(error => {
                    res.status(500).json({
                        error: error
                    })
                })
        })
        .catch(error => {
            res.status(500).json({
                error: error.message
            })
        })
}

module.exports = {
    login,
    signup
};