const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Token creator
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Model infos
const User = require('../models/User');

// Middleware
const isAuthenticated = require('../middleware/isAuthenticated');

const saltRounds = 10;

// Post Signup
router.post('/signup', (req, res, next) => {
    const { email, password, username } = req.body;

    // Check if the email or password or name is provided as an empty string
    if(!email || !password || !username) {
        res.status(400).json({ message: 'Provide email, password and name' });
        return;
    }

    // Use regex to validate the email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if(!emailRegex.test(email)) {
        res.status(400).json({ message: 'Provide a valid email address.'});
        return;
    }

    // Check the users collection if a user with the same email already exists
    User.findOne({ email })
        .then((foundUser) => {
            // If the user with the same email already exists, send an error response
            if(foundUser) {
                res.status(400).json({ message: 'User already exists.' });
                return;
            }

            // If the email is unique, proceed to hash the password
            const salt = bcrypt.genSaltSync(saltRounds);
            const hashedPassword = bcrypt.hashSync(password, salt);

            // Create a new user in the database
            // We return a pending promise, which allows us to chain another `then`
            User.create({ email, password: hashedPassword, username })
                .then((createUser) => {
                    // Deconstruct the newly created user object to omit the password
                    // We should never expose passwords publicly
                    const { email, username, _id } = createUser;

                    // Create a new object that doesn't expose the password
                    const payload = { email, username, _id };

                    const authToken = jwt.sign(payload, process.env.SECRET, {
                        algorithm: 'HS256',
                        expiresIn: '6h'
                    });

                    // Send the token as the response
                    res.status(200).json({ authToken });
                })
                .catch((error) => {
                    if(error instanceof mongoose.Error.ValidationError) {
                        console.log('This is the error ===> ', error);
                        res.status(501).json(error);
                    } else if(error.code === 11000){
                        console.log('Invalid username, email or password.');
                        res.status(502).json(error);
                    } else {
                        res.status(503).json(error);
                    }
                });
        })
        .catch((err) => {
            console.log(err);
            res.status(500).json({ message: 'Internal Server Error'});
        });
});

// Post Login
router.post('/login', (req, res, next) => {
    const { email, password } = req.body;

    // Check if email or password are provided as empty string
    if(email === '' || password === '') {
        res.status(400).json({ message: 'Provide email and password.'});
        return;
    }

    // Check the users collection if a user with the same email exists
    User.findOne({ email })
        .then((foundUser) => {
            if(!foundUser) {
                // If the user is not found, send an error response
                res.status(401).json({ message: 'Incorrect Email or Password' });
                return;
            }

            // Compare the provided password with the one saved in the database
            const passwordCorrect = bcrypt.compareSync(password, foundUser.password);

            if(passwordCorrect) {
                // Deconstruct the user object to omit the password
                const {_id, email, username } = foundUser;

                // Create an object that will be set as the token payload
                const payload = { _id, email, username };

                // Create and sign the token
                const authToken = jwt.sign(payload, process.env.SECRET, {
                    algorithm: 'HS256',
                    expiresIn: '6h'
                });

                // Send the token as the response
                res.status(200).json({ authToken });
            } else {
                res.status(401).json({ message: 'Unable to authenticate the user' });
            }
        })
        .catch((err) => res.status(500).json({ message: 'Internal Server Error' }));
});

// GET Verify
router.get('/verify', isAuthenticated, (req, res, next) => {
    // If JWT token is valid the payload gets decoded by the
    // isAuthenticated middleware and made available on `req.user`
    console.log('req.user ===> ', req.user);

    // Send back the object with user data
    // previously set as the token payload
    res.status(200).json(req.user);
});

module.exports = router;