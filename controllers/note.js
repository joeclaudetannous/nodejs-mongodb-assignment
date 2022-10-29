const { validationResult } = require('express-validator');
const Note = require('../models/note');
const User = require('../models/user');
const Category = require('../models/category');
const io = require('../socket');
 
exports.getNotes = async (req, res, next) => {

    console.log('first');
    const categoryName = req.query.category;
    const tag = req.query.tag;
    const pageNumber = req.query.pageNumber || 1;

    const perPage = 3;
    let totalCount = 0;

    console.log('before try caych bloc');
    if(tag){
        try{
            totalNotes = await Note
                .find({tags: tag})
                .countDocuments().exec();
            totalCount = totalNotes;
            const notesDoc = await Note.find({tags: tag})
                .populate('creatorId')
                .sort({updatedAt: -1, createdAt: -1})
                .skip((pageNumber - 1) * perPage)
                .limit(perPage);

            res.status(200).json({
                message: 'ressources fetched succesfully',
                notes: notesDoc,
                totalNotes: totalCount
            });
        }catch(err){
            if(!err.statusCode){
                err.statusCode = 500;
            }
            next(err);
        }
    } else if(categoryName){
        try{
            const notesCount = await Note.aggregate([
                {$lookup: {from: 'categories',
                localField: 'categoryId',
                foreignField: '_id',
                as: 'categories'}},
                {$match: {$expr: {$eq: ["$categories.name", categoryName]}}},
                {$group: {_id: null, count: {$sum: 1}}}
            ]);
            totalCount = notesCount;

            const notesDoc = await Note.aggregate([
                {$lookup: {from: 'categories',
                    localField: 'categoryId',
                    foreignField: '_id',
                    as: 'categories'}},
                {$match: {$expr: {$eq: ["$categories.name", categoryName]}}},
                {$sort: {updatedAt: -1, createdAt: -1}}
            ]);

            res.status(200).json({
                message: 'ressources fetched succesfully',
                notes: notesDoc,
                totalNotes: totalCount
            });
        }catch(err){
            if(!err.statusCode){
                err.statusCode = 500;
            }
            next(err);
        }
    } else {


        try{
            const totalNotes = await Note.find()
                .countDocuments()
                .exec();

            totalCount = totalNotes;

            const notesDoc = await Note.find()
                .populate('creatorId')
                .sort({updatedAt: -1, createdAt: -1})
                .skip((pageNumber - 1) * perPage)
                .limit(perPage);
    
            res.status(200).json({
                message: 'ressources fetched succesfully',
                notes: notesDoc,
                totalNotes: totalCount
            });
    
        }catch(err){
            if(!err.statusCode){
                err.statusCode = 500;
            }
            next(err);
        }
    
    }
};

exports.getNote = async (req, res, next) => {
    const noteId = req.params.noteId;

    try{
        const note = await Note.findById(noteId);
        if(!note){
            const error = new Error('could not fetched note!');
            error.statusCode = 404;
            throw error;
        }

        res.status(200).json({
            message: 'ressource fetched succefully',
            note: note
        });
    }catch(err){

        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.createNote = (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const error = new Error('validation failed please enter a valid data!');
        error.statusCode = 422;
        error.message = errors.array();
        throw error;
    }

    const title = req.body.title;
    const content = req.body.content;
    const tags = req.body.tags;
    const categoryId = req.body.categoryId;
    const note = new Note({
        title: title,
        content: content,
        tags: tags,
        categoryId: categoryId,
        creatorId: req.userId
    });

    let updatedCount;
    let loadedNote;
    let loadedUser;

        note.save().then(result => {
            loadedNote = result;
            return Category.findById(categoryId);
        }).then(categoryDoc => {
            updatedCount = categoryDoc.notesCount + 1;
            categoryDoc.notesCount = updatedCount;
            return categoryDoc.save();
        }).then(result2 => {
            return User.findById(req.userId);
        }).then(userDoc => {
            loadedUser = userDoc;
            userDoc.notes.push(loadedNote);
            return userDoc.save();
        }).then(result3 => {
            // io.getIO().emit('notes', {
            //     action: 'create note',
            //     note: {
            //         ...loadedNote._doc,
            //         userId: req.userId,
            //         userName: loadedUser.name
            //     }
            // });
            res.status(201).json({
                message: 'note added successfully',
                note: loadedNote
            });
        }).catch(err => {
            if(!err.statusCode){
                err.statusCode = 500;
            }
            next(err);
        });
};

exports.updatedNote = async (req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        const error = new Error('validation failed please enter a valid data');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }

    const noteId = req.params.noteId;

    const title = req.body.title;
    const content = req.body.content;
    const tags = req.body.tags;
    const categoryId = req.body.categoryId;

    let updatedNote;
    let updatedCategory;
    let updatedCount;
    let loadedUser;

    try{
        const noteDoc = await Note.findById(noteId);
        if(!noteDoc){
            const error = new Error('note not found');
            error.statusCode(404);
            throw error;
        }

        if(noteDoc.creatorId.toString() !== req.userId){
            const error = new Error('Unauthorized user');
            error.statusCode(403);
            throw error;
        }

        if(noteDoc.categoryId !== categoryId){
            updatedCategory = noteDoc.categoryId;
            try{

                const oldCategoryDoc = await Category.findById(updatedCategory);
                updatedCount = oldCategoryDoc.notesCount - 1;
                oldCategoryDoc.notesCount = updatedCount;
                await oldCategoryDoc.save();
                const newCategoryDoc = await Category.findById(categoryId);
                updatedCount = newCategoryDoc.notesCount + 1;
                newCategoryDoc.notesCount = updatedCount;
                await oldCategoryDoc.save();
            }catch(err){
                if(!err.statusCode){
                    err.statusCode = 500;
                }
                next(err);
            }
        }
        noteDoc.title = title;
        noteDoc.content = content;
        noteDoc.tags = tags;
        updatedNote = await noteDoc.save();
        loadedUser = await User.findById(req.userId);
        // io.getIO().emit('notes', {
        //     action: 'update note',
        //     note: {
        //         ...loadedNote._doc,
        //         userId: req.userId,
        //         userName: loadedUser.name
        //     }
        // });
        res.status(200).json({
            message: 'note updated succesfully!',
            note: updatedNote
        });
    }catch(err){
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.deleteNote = async (req, res, next) => {
    const noteId = req.params.noteId;

    let updatedCategory;
    let updatedCount;

    try{
        const noteDoc = await Note.findById(noteId);
        if(!noteDoc){
            const error = new Error('note not found!');
            error.statusCode = 404;
            throw error;
        }

        if(noteDoc.creatorId.toString() !== req.userId){
            const error = new Error('unauthorized user!');
            error.statusCode = 403;
            throw error;
        }
        updatedCategory = noteDoc.categoryId;
        await Note.findByIdAndDelete(noteId);

        const categoryDoc = await Category.findById(updatedCategory);
        updatedCount = categoryDoc.notesCount - 1;
        categoryDoc.notesCount = updatedCount;
        await categoryDoc.save();
        const userDoc = await User.findById(req.userId);
        userDoc.notes.pull(noteId);
        await userDoc.save();

        // io.getIO().emit('notes', {
        //     action: 'delete note',
        //     note: noteId
        // });
        res.status(200).json({
            message: 'note deleted successfully'
        });

    }catch(err){
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    }
};