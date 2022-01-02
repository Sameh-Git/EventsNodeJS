const express = require("express")
const app = express()
const db = require('./config/database')
const bodyParser = require('body-parser')
const session = require('express-session')
const flash = require('connect-flash')
// bring ejs template
app.set('view engine', 'ejs')
// bring body parser 
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

//bring static
app.use(express.static('public'))
app.use(express.static('node_modules'))
app.use(express.static('uploads'))
// session and flash config .
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
    cookie: {maxAge: 60000 * 15}
}))
app.use(flash())
//
const passport =  require("passport")
require('./config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());

// Global variables
app.use(function(req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
  });

 
app.get('/',(req,res)=> {
    res.render('login')
})

// bringg events routes
const events = require('./routes/event-routes')
app.use('/events', events)
app.use('/users', require('./routes/user-routes.js'));
// listen to port 3000
app.listen(3000, ()=> {
    console.log(' app is wokring on port 3000')
})