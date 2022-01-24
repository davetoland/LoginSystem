const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const { engine } = require('express-handlebars');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mongo = require('mongodb');
const mongoose = require('mongoose');
const db = mongoose.connection;
const routes = require('./routes/index');
const users = require('./routes/users');

mongoose.connect('mongodb://localhost/loginapp');

//view engine
var app = express();
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', engine({ extname: '.handlebars', defaultLayout: "layout"}));
app.set('view engine', 'handlebars');

//middleware
app.use(express.json());
app.use(express.urlencoded({ entended: false }));
app.use(cookieParser());

//static
app.use(express.static(path.join(__dirname, 'public')));

//express session
app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true
}));

app.use(passport.initialize());
app.use(passport.session());

//express validator
app.use(expressValidator({
    errorFormatter: function(param, msg, value) {
        var namespace = param.split('.')
        , root    = namespace.shift()
        , formParam = root;
  
      while(namespace.length) {
        formParam += '[' + namespace.shift() + ']';
      }
      return {
        param : formParam,
        msg   : msg,
        value : value
      };
    }
  }));

  //connect flash
  app.use(flash());

  //globals
  app.use((req,res,next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    next();
  });

  //routing
  app.use('/', routes);
  app.use('/users', users);

  //set port
  app.set('port', (process.env.PORT || 3000));

  //start server
  app.listen(app.get('port'), () => {
    console.log("Server started and listening on port " + app.get('port'));
  });