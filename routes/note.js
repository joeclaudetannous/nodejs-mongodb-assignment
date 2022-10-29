const express = require('express');
const { body } = require('express-validator');
const isAuth = require('../middleware/is-auth');
const Category = require('../models/category');

const router = express.Router();

const noteController = require('../controllers/note');

router.get('/notes', isAuth,
  noteController.getNotes);

router.get('/note/:noteId', isAuth,
  noteController.getNote);

router.post('/note', isAuth,
[
   body('title')
    .isLength({min: 3})
    .trim(),
   body('content')
    .isLength({min: 5})
    .trim(),
   body('tags')
    .not()
    .isEmpty(),
   body('categoryId')
    .not()
    .isEmpty()
    .custom((value, {req}) => {
      return Category.findById(value).then(categoryDoc => {
        if(!categoryDoc){
          return Promise.reject('please enter a valid cayegory id');
        }
      });
    }
   )
], noteController.createNote);

router.put('/note/:noteId', isAuth, [
  body('title')
    .isLength({min: 3})
    .trim(),
  body('content')
    .isLength({min: 5})
    .trim(),
  body('tags')
    .not()
    .isEmpty(),
  body('categoryId')
    .not()
    .isEmpty()
    .custom((value, {req}) => {
      return Category
        .findById(value)
        .then(categoryDoc => {
          if(!categoryDoc){
            return Promise.reject('please enter a valid cayegory id');
          }
      });
      
   })
], noteController.updatedNote);

router.delete('/note/:noteId',
  isAuth,
  noteController.deleteNote
);

module.exports = router;