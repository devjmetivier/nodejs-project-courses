const express = require('express');
const router = express.Router();
const mongo = require('mongodb');
const db = require('monk')('localhost/nodeblog');

/* GET home page. */
router.get('/', function(req, res, next) {
    let db = req.db;
    let posts = db.get('posts');
    posts.find({}, {}, function (err, posts) {
        res.render('index', { posts: posts });
    });
});

module.exports = router;
