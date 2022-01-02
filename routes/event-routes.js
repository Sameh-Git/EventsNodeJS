const express = require("express")
const router = express.Router()
const Event = require('../models/Evnet')

const { check, validationResult } = require('express-validator/check')
const moment = require('moment');
moment().format();
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
// Dashboard
router.get('/home', ensureAuthenticated,  (req, res) =>
  res.render('home', {
    user: req.user
  })
);




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












// route to home events
router.get('/',ensureAuthenticated, (req, res) => {
    Event.find({}, (err, events) => {
        //     res.json(events)
        let chunk = []
        let chunkSize = 3
        for (let i = 0; i < events.length; i += chunkSize) {
            chunk.push(events.slice(i, chunkSize + i))
        }
        //res.json(chunk)
        res.render('index', {
            chunk: chunk,
            message: req.flash('info')
        })
    })

})

//create new events
router.get('/create',ensureAuthenticated, (req, res) => {

    res.render('create', {
        errors: req.flash('errors')
    })
})

// save event to db
router.post('/create', upload.single('image'), [
    check('title').isLength({ min: 5 }).withMessage('Title should be more than 5 char'),
    check('description').isLength({ min: 5 }).withMessage('Description should be more than 5 char'),
    check('location').isLength({ min: 3 }).withMessage('Location should be more than 5 char'),
    check('date').isLength({ min: 5 }).withMessage('Date should valid Date'),
], (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        req.flash('errors', errors.array())
        res.redirect('/events/create')
    } else {
        let newEvent = new Event({
            title: req.body.title,
            description: req.body.description,
            date: req.body.date,
            location: req.body.location,
            created_at: Date.now(),
            image: req.file.filename
        })
        newEvent.save((err) => {
            if (!err) {
                console.log('event was added')
                req.flash('info', ' The event was created successfuly')
                res.redirect('/events')
            } else {
                console.log(err)
            }
        })
    }

})

// show single event
router.get('/:id', ensureAuthenticated,(req, res) => {
    Event.findOne({ _id: req.params.id }, (err, event) => {

        if (!err) {

            res.render('show', {
                event: event
            })

        } else {
            console.log(err)
        }

    })

})


// edit route

router.get('/edit/:id',ensureAuthenticated, (req, res) => {

    Event.findOne({ _id: req.params.id }, (err, event) => {

        if (!err) {

            res.render('edit', {
                event: event,
                eventDate: moment(event.date).format('YYYY-MM-DD'),
                errors: req.flash('errors'),
                message: req.flash('info')
            })

        } else {
            console.log(err)
        }

    })

})

// update the form
router.post('/update',  upload.single('image'),[
    check('title').isLength({ min: 5 }).withMessage('Title should be more than 5 char'),
    check('description').isLength({ min: 5 }).withMessage('Description should be more than 5 char'),
    check('location').isLength({ min: 3 }).withMessage('Location should be more than 5 char'),
    check('date').isLength({ min: 5 }).withMessage('Date should valid Date'),

], (req, res) => {

    const errors = validationResult(req)
    if (!errors.isEmpty()) {

        req.flash('errors', errors.array())
        res.redirect('/events/edit/' + req.body.id)
    } else {
        // crete obj
        let newfeilds = {
            title: req.body.title,
            description: req.body.description,
            location: req.body.location,
            date: req.body.date,
            image: req.file.filename
        }
        let query = { _id: req.body.id }

        Event.updateOne(query, newfeilds, (err) => {
            if (!err) {
                req.flash('info', " The event was updated successfuly"),
                    res.redirect('/events/edit/' + req.body.id)
            } else {
                console.log(err)
            }
        })
    }

})








router.delete('/delete/:id', (req, res) => {

    let query = { _id: req.params.id }

    Event.deleteOne(query, (err) => {

        if (!err) {
            res.status(200).json('deleted')
        } else {
            res.status(404).json('There was an error .event was not deleted')
        }
    })
})





module.exports = router 