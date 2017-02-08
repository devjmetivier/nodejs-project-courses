const express = require('express');
const router = express.Router();
const mongo = require('mongodb');
const db = require('monk')('localhost/nodeblog');

router.get('/add', function(req, res, next) {
    res.render('addcategory', {
        'title': 'Add Category'
    });
});

router.get('/show/:category', function(req, res, next) {
    let posts = db.get('posts');

    posts.find({category: req.params.category}, {}, function (err, posts) {
        res.render('index', {
            'title': req.params.category,
            'posts': posts
        });
    });
});

router.post('/add', function(req, res, next) {
    // get the form values
    let name = req.body.name;

    // form validation
    req.checkBody('name', 'Name Field is Required.').notEmpty();

    // check errors
    let errors = req.validationErrors();

    if(errors) {
        res.render('addcategory', {
            'errors': errors
        });
    } else {
        let posts = db.get('categories');
        posts.insert({
            'name': name
        }, function (err, post) {
            if(err) {
                res.send(err);
            } else {
                req.flash('success', 'Category Added');
                res.location('/');
                res.redirect('/');
            }
        });
    }
});

module.exports = router;