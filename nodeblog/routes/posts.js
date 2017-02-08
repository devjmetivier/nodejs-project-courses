const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({dest: './public/images'});
const mongo = require('mongodb');
const db = require('monk')('localhost/nodeblog');

router.get('/add', function(req, res, next) {
    let categories = db.get('categories');

    categories.find({}, {}, function (err, categories) {
        res.render('addpost', {
            'title': 'Add Posts',
            'categories': categories
        });
    });
});

router.get('/show/:id', function(req, res, next) {
    let posts = db.get('posts');

    posts.findById(req.params.id, function (err, post) {
        res.render('show', {
            'post': post
        });
    });
});

router.post('/add', upload.single('mainimage'),function(req, res, next) {
    // get the form values
    let title = req.body.title;
    let category = req.body.category;
    let body = req.body.body;
    let author = req.body.author;
    let date = new Date();

    // check image upload
    if(req.file) {
        var mainimage = req.file.filename;
    } else {
        var mainimage = 'noimage.jpg'
    }

    // form validation
    req.checkBody('title', 'Title Field is Required.').notEmpty();
    req.checkBody('body', 'Body Field is Required.').notEmpty();

    // check errors
    let errors = req.validationErrors();

    if(errors) {
        res.render('addpost', {
            'errors': errors
        });
    } else {
        let posts = db.get('posts');
        posts.insert({
            'title': title,
            'body': body,
            'category': category,
            'date': date,
            'author': author,
            'mainimage': mainimage
        }, function (err, post) {
            if(err) {
                res.send(err);
            } else {
                req.flash('success', 'Post Added');
                res.location('/');
                res.redirect('/');
            }
        });
    }
});

router.post('/addcomment', function(req, res, next) {
    // get the form values
    let postId = req.body.postid;
    let name = req.body.name;
    let email = req.body.email;
    let body = req.body.body;
    let commentDate = new Date();


    // form validation
    req.checkBody('name', 'Name Field is Required.').notEmpty();
    req.checkBody('email', 'Email Field is Required But Never Displayed.').notEmpty();
    req.checkBody('email', 'EMail Is Not Valid.').isEmail();
    req.checkBody('body', 'Body Field is Required.').notEmpty();

    // check errors
    let errors = req.validationErrors();

    if(errors) {
        let posts = db.get('posts');
        posts.findById(postId, function (err, post) {
            res.render('show', {
                'post': post
            });
        });
    } else {
        let comment = {
            'name': name,
            'email': email,
            'body': body,
            'commentdate': commentDate
        };

        let posts = db.get('posts');

        posts.update({
            '_id': postId
        }, {
            $push: {
                'comments': comment
            }
        }, function (err, doc) {
            if(err) {
                throw err;
            } else {
                req.flash('success', 'Comment Added');
                res.location('/posts/show/' + postId);
                res.redirect('/posts/show/' + postId);
            }
        });
    }
});

module.exports = router;