const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const noteSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    tags: [{
        type: String,
        required: true
    }],
    categoryId: {
        type: Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    creatorId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {timestamps: true});

// noteSchema.methods.findByTag = async function(tag){

//     return find({tags: tag});
// };

// noteSchema.methods.findByCategory = async function(categoryName){
//     return aggregate([
//         {$lookup: {from: 'categories', localField: 'categoryId', foreignField: '_id', as: 'categories'}},
//         {$match: {'categories.name': categoryName}}
//     ]);
// };

module.exports = mongoose.model('Note', noteSchema);