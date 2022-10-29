const User = require('../models/user');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const sendgridtransport = require('nodemailer-sendgrid-transport');

const transporter = nodemailer.createTransport(sendgridtransport({
    auth: {
        api_key: ''
    }
}));

exports.login = async (req, res, next) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        const error = new Error('validation failed please enter a valid data');
        error.statusCode = 422;
        error.message = errors.array();
        throw error;
    }

    const email = req.body.email;
    const password = req.body.password;
    let loadedUser ;
    try{
        const user = await User.findOne({email: email});
        if(!user){
            const error = new Error('user not found');
            error.statusCode = 404;
            throw error;
        }
        loadedUser = user;
        const isEqual = await bcrypt.compare(password, user.password);
        if(!isEqual){
            const error = new Error('Wrong password');
            error.statusCode = 404;
            throw error;
        }
        const token = jwt.sign({
            email: loadedUser.email,
            userId: loadedUser._id.toString()
            },
            'secret',
            {expiresIn: '1h'}    
        );
        res.status(200).json({
            message: 'user logged in succesfully',
            user: {
                token: token,
                _id: loadedUser._id.toString()
            }
        });
    }catch(err){
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.signup = (req, res, next) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        const error = new Error('validation failed please enter a valid data');
        error.statusCode = 422;
        // error.message = message;
        error.data = errors.array();
        throw error;
    }
    
    const password = req.body.password;

        bcrypt.hash(password, 12).then(hashedPass => {
            const email = req.body.email;
            const name = req.body.name;
        
            const user = new User({
                email: email,
                password: hashedPass,
                name: name,
                notes: [],
                category: []
            });
            return user.save();
        }).then(result => {
            //sending an email to new signup user
            // transporter.sendMail({
            //     to: email,
            //     from: 'test@test.com',
            //     subject: 'signup successfully',
            //     html: '<h1> signup successfully </h1>'
            // });
            res.status(200).json({
                message: 'user added successfully',
                user: result
            });
        }).catch(err => {
            if(!err.statusCode){
                err.statusCode = 500;
            }
            next(err);
        });
};