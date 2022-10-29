const express = require('express');
const { body } = require('express-validator');
const User = require('../models/user');
const authController = require('../controllers/auth');

const router = express.Router();

router.put('/signup', [
    body('email')
        .isEmail()
        .withMessage('please enter a valide email')
        .custom((value, { req }) => {
                return User.findOne({email: value })
                .then(userDoc => {
                    if (userDoc) {
                        return Promise.reject('email already exists try another one');
                    }
                })
                
        }).normalizeEmail(),
    body('password')
        .isLength({min: 5}),
    body('name')
        .not()
        .isEmpty()
        .trim()
], authController.signup);

router.put('/login',[
    body('email')
        .isEmail()
        .normalizeEmail(),
    body('password')
        .isLength({min: 5})
], authController.login);

module.exports = router;