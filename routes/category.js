const express = require('express');
const { body } = require('express-validator');
const isAuth = require('../middleware/is-auth');

const categoryRoutes = require('../controllers/category');

const router = express.Router();

router.get('/categories', isAuth, categoryRoutes.getCategories);

router.get('/category/:categoryId',isAuth, categoryRoutes.getCategory);

router.post('/category', isAuth,[
    body('name').not().isEmpty().trim()
], categoryRoutes.createCategory);

router.put('/category/:categoryId', isAuth,[
    body('name').not().isEmpty().trim()
], categoryRoutes.updateCategory);

router.delete('/category/:categoryId', isAuth, categoryRoutes.deleteCategory);

module.exports = router;