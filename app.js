const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();

const noteRoutes = require('./routes/note');
const categoryRoutes = require('./routes/category');
const authRoutes = require('./routes/auth');
const route404 = require('./controllers/404');

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origine', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PATCH, DELETE, PUT');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.use(noteRoutes);
app.use('/admin', categoryRoutes);
app.use('/auth', authRoutes);
app.use(route404.get404) // routes that are not found 404 page

app.use((error, req, res, next) => {

    const message = error.message;
    const status = error.statusCode || 500;
    res.status(status).json({
        message: message
    });
});

mongoose.connect(
    'mongodb+srv://joeclaudetannous:codechallenge2022@cluster0.yowx14c.mongodb.net/?retryWrites=true&w=majority').then(() => {
    console.log('server listen ...');
    const server = app.listen(8080);
    const io = require('socket.io')(server);
    io.on('connection', socket => {
        console.log('Client connected ...');
    });

}).catch(err => {
    console.log(err);
});