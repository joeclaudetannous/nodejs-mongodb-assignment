const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    notes: [{
        type: Schema.Types.ObjectId,
        ref: 'Note'
    }],
    categories: [{
        type: Schema.Types.ObjectId,
        ref: 'Category'
    }]
});

module.exports = mongoose.model('User', userSchema);