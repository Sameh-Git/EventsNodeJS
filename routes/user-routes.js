const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const passport = require('passport');
// Load User model


var path = require('path')
var multer = require('multer')
var upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => { cb(null, './uploads') },
        filename: function (req, file, callback) {
            callback(null, file.fieldname + '-' +
                Date.now() + path.extname(file.originalname))
        }
    })
})



const { forwardAuthenticated } = require('../config/auth');
router.get('/register', forwardAuthenticated, (req, res) => res.render('register'));
router.post('/register',(req,res) =>{
const{name,email,password,password2}=req.body;
let errors=[]
if(!email ||!name || !password || !password2){
    errors.push({msg : "Please fill in all fields"})
}
if (password != password2) {
    errors.push({ msg: 'Passwords do not match' });
  }

  if (password.length < 6) {
    errors.push({ msg: 'Password must be at least 6 characters' });
  }
  if(errors.length > 0){
    res.render('register', {
        errors,
        name,
        email,
        password,
        password2
      });
  }
  else{
      //validation passed
      User.findOne({ email: email }).then(user => {
        if (user) {
          errors.push({ msg: 'Email already exists' });
          res.render('register', {
            errors,
            name,
            email,
            password,
            password2
          });
        } else {
          const newUser = new User({
            name,
            email,
            password
          });
          bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(newUser.password, salt, (err, hash) => {
              if (err) throw err;
              newUser.password = hash;
              newUser
                .save()
                .then(user => {
                  req.flash(
                    'success_msg',
                    'You are now registered and can log in'
                  );
                  res.redirect('/users/login');
                })
                .catch(err => console.log(err));
            });
          });
        }
      });
    }
  });



  router.get('/login',forwardAuthenticated,  (req, res) =>
  res.render('login'));
  // Login post
  router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
      successRedirect: '/events/home',
      failureRedirect: '/users/login',
      failureFlash: true
    })(req, res, next);
   });
  






  // Logout
  router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You are logged out');
    res.redirect('/users/login');
  });
module.exports = router;