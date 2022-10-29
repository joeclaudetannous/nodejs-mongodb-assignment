const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const categorySchema = new Schema({
    name: {
        type: String,
        required: true
    },
    notesCount: {
        type: Number,
        default: 0
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
});

module.exports = mongoose.model('Category', categorySchema);