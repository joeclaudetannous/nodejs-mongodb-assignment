const Category = require('../models/category');
const { validationResult } = require('express-validator');
const User = require('../models/user');
const io = require('../socket');

exports.getCategories = async (req, res, next) => {
    const pageNumber = req.query.pageNumber || 1;

    const perPage = 2;
    let totalNumber;

    try{
        const count = await Category.find().countDocuments().exec();
        totalNumber = count;
        const categories = await Category
            .find()
            .skip((pageNumber - 1) * perPage)
            .limit(perPage)
        res.status(200).json({
            message: 'categories fetched successfully! ',
            categories: categories,
            totalNumber: totalNumber
        });
    }catch(err){
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.getCategory = async (req, res, next) => {
    const categoryId = req.params.categoryId;

    try{
        const category = await Category.findById(categoryId);
        if(!category){
            const error = new Error('could not fetched category!');
            error.statusCode = 404;
            throw error;
        }

        // if(category.userId.toString() !== req.userId){
        //     const error = new Error('not authorized user!');
        //     error.statusCode = 403;
        //     throw error;
        // }

        res.status(200).json({
            message: 'ressource fetched successfully!',
            category: category
        });
    }catch(err){
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.createCategory = async (req, res, next) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        const error = new Error('validation failde please enter a valid data!');
        error.statusCode = 422;
        throw error;
    }

    const name = req.body.name;
    let loadedCategory;

    try{
        const category = new Category({
            name: name,
            count: 0,
            userId: req.userId
        });
        const result = await category.save();
        loadedCategory = result;
        const userDoc = await User.findById(req.userId);
        userDoc.categories.push(loadedCategory);
        const updatedUser = await userDoc.save();
        // io.getIO().emit('categories', {
        //     action: 'create category',
        //     category: {
        //         ...loadedCategory._doc,
        //         userId: req.userId,
        //         userName: updatedUser.name
        //     }
        // });
        res.status(201).json({
            message: 'ressource created successfully',
            category: loadedCategory
        });

    }catch(err){
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.updateCategory = (req, res, next) => {
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        const error = new Error('validation failde please enter a valid data!');
        error.statusCode = 422;
        throw error;
    }

    const categoryId = req.params.categoryId;
    let updatedCategory;

    Category.findById(categoryId)
    .then(category => {
        if(!category){
            const error = new Error('could not fetched category!');
            error.statusCode = 404;
            throw error;
        }

        if(category.userId.toString() !== req.userId){
            const error = new Error('not authorized user!');
            error.statusCode = 403;
            throw error;
        }

        const name = req.body.name;
        category.name = name;

        return category.save();
    }).then(categoryDoc => {
 
        updatedCategory = categoryDoc;
        return User.findById(req.userId)
    }).then(userDoc => {

        // io.getIO().emit('categories', {
        //     action: 'updated category',
        //     category: {
        //         ...updatedCategory._doc,
        //         userId: req.userId,
        //         userName: userDoc.name
        //     }
        // });
        res.status(200).json({
            message: 'ressources updated succesfully',
            category: result
        });
    }).catch(err => {
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    });
};

exports.deleteCategory = async (req, res, next) => {
    const categoryId = req.params.categoryId;

    try{

        const category = await Category.findById(categoryId);
        if(!category){
            const error = new Error('could not fetched category!');
            error.statusCode = 404;
            throw error;
        }

        if(category.userId.toString() !== req.userId){
            const error = new Error('not authorized user!');
            error.statusCode = 403;
            throw error;
        }

        if(category.notesCount > 0){
            const error = new Error('request refuse cannot delete category');
            error.statusCode = 422;
            throw error;
        }
        
        await Category.findByIdAndDelete(categoryId);
        const userDoc = await User.findById(req.userId);
        
        userDoc.categories.pull(categoryId);
        const finalResult = await userDoc.save();
        // io.getIO().emit('categories', {
        //     action: 'delete category',
        //     category: {
        //         categoryId: categoryId,
        //         userId: finalResult._id,
        //         userName: finalResult.name
        //     }
        // });
        res.status(200).json({
            message: 'ressource deleted successfully!'
        });

    }catch(err){
        if(!err.statusCode){
            err.statusCode = 500;
        }
        next(err);
    }
};