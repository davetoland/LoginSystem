const express = require('express');
const router = express.Router();
const User = require('../models/user')
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

//register
router.get('/register', (req,res) => {
    res.render('register');
});

router.post('/register', (req,res) => {
    var name = req.body.name;
    var email = req.body.email;
    var username = req.body.username;
    var password = req.body.password;
    var password2 = req.body.password2;

    req.checkBody('name', 'Name is required!').notEmpty();
    req.checkBody('email', 'Email is required!').notEmpty();
    req.checkBody('email', 'Email is not valid!').isEmail();
    req.checkBody('username', 'Username is required!').notEmpty();
    req.checkBody('password', 'Password is required!').notEmpty();
    req.checkBody('password2', 'Passwords do not match!').equals(req.body.password);

    var errors = req.validationErrors();

    if (errors) {
        console.error("errors!");
        res.render('register', {
            errors: errors
        });
    } else {
        var newUser = new User({
            name: name,
            email: email,
            username: username,
            password: password
        });

        User.createUser(newUser, (err, user) => {
            if (err) throw err;
            console.log(user);
        });

        req.flash('success_msg', 'You are registered and can now login');
        res.redirect('/users/login');
    }

    console.log(`new user: ${name}, just registered!`);
});

//login
router.get('/login', (req,res) => {
    res.render('login');
});

passport.use(new LocalStrategy((user, pass, done) => {
    User.getUserByUsername({ username: user}, (err, user) => {
        if (err) 
            return done(err);
        if (!user)
            return done(null, false, { message: "Unknown username" });

        User.comparePassword(pass, user.password, (err, isMatch) => {
            if (err)
                return done(err);
            if (!isMatch)
                return done(null, false, { message: "Incorrect password"});
                
            return done(null, user);
        });    
    });
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    User.getUserById(id, (err, user) => {
        done(err, user.id);
    });
});

router.post('/login', 
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/users/login',
        failureFlash: true
    }),
    (req, res) => {
        res.redirect('/');
    });

router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/users/login');
});

module.exports = router;