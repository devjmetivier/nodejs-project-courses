const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({dest: './uploads'});
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const User = require('../models/user');

// GET users page
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

// GET users login page
router.get('/login', function(req, res, next) {
    res.render('login', {title: 'Login'});
});

// POST users login, authenticating user
router.post('/login',
    passport.authenticate('local', {failureRedirect: '/users/login', failureFlash: 'Invalid username and/or password.'}),
    function(req, res) {
        req.flash('success', 'You are now logged in.');
        res.redirect('/');
    }
);

// starting session
passport.serializeUser(function(user, done) {
    done(null, user.id);
});

// ending session on logout
passport.deserializeUser(function(id, done) {
    User.getUserById(id, function(err, user) {
        done(err, user);
    });
});

// strategy for local db to authenticate username and password
passport.use(new LocalStrategy(function (username, password, done) {
    User.getUserByUsername(username, function (err, user) {
        if(err) throw err;
        if(!user) {
            return done(null, false, {message: 'Unknown User'});
        }

        User.comparePassword(password, user.password, function (err, isMatch) {
            if(err) return done(err);
            if(isMatch) {
                return done(null, user);
            } else {
                return done(null, false, {message: 'Invalid Password'});
            }

        });
    });
}));

// logout user
router.get('/logout', function (req, res) {
    req.logout();
    req.flash('success', 'You are now logged out.');
    res.redirect('/');
});

// GET register page
router.get('/register', function(req, res, next) {
    res.render('register', {title: 'Register'});
});

// POST register, registering user to DB
router.post('/register', upload.single('profileimage'), function(req, res, next) {
    let name = req.body.name;
    let email = req.body.email;
    let username = req.body.username;
    let password = req.body.password;
    let password2 = req.body.password2;

    if(req.file) {
      console.log('Uploading File...');
      //////////////////////
      // check use of 'let'
      //////////////////////
      var profileimage = req.file.filename;
    } else {
      console.log('No File Uploaded...');
      var profileimage = 'noimage.jpg'
    }

    // form validation
    req.checkBody('name', 'Name field is required').notEmpty();
    req.checkBody('email', 'Email field is required').notEmpty();
    req.checkBody('email', 'Email is not valid').isEmail();
    req.checkBody('username', 'Username field is required').notEmpty();
    req.checkBody('password', 'Password field is required').notEmpty();
    req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

    // check errors
    let errors = req.validationErrors();

    if(errors) {
      res.render('register', {errors: errors});
    } else {
      let newUser = new User({
          name: name,
          email: email,
          username: username,
          password: password,
          profileimage: profileimage
      });

      User.createUser(newUser, function (err, user) {
          if(err) throw err;
          console.log(user);
      });

      req.flash('success', 'You are now registered and can log in.');

      res.location('/');
      res.redirect('/');
    }
});

module.exports = router;