const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')

// define the Post model
const Post = require('../models/post')

// define the Admin model
const Admin = require('../models/admin')

// get all posts
router.get('/', function (req, res, next) {
    Post.find({}, function (err, posts) {
        if (err) return next(err)
        res.render('home', { posts })
    })
})

// login route for /admin
router.get('/admin/login', function (req, res) {
    res.render('admin/login')
})

router.post('/admin/login', function (req, res) {
    // authenticate the admin user
    Admin.findOne({ username: req.body.username }, function (err, admin) {
        if (err) return next(err)
        if (!admin) {
            return res.status(404).send('No admin found.')
        }
        bcrypt.compare(
            req.body.password,
            admin.password,
            function (err, result) {
                if (!result) {
                    return res.status(401).send('Incorrect password.')
                }
                // save admin to session
                req.session.admin = admin
                return res.redirect('/admin/add-post')
            }
        )
    })
})

router.get('/admin/signup', (req, res) => {
    res.render('signup')
})

router.post('/admin/signup', function (req, res, next) {
    const { username, password } = req.body
    if (!username || !password) {
        return res
            .status(422)
            .send({ error: 'You must provide a username and password' })
    }
    Admin.findOne({ username }, function (err, existingAdmin) {
        if (err) return next(err)
        if (existingAdmin) {
            return res
                .status(422)
                .send({ error: 'This username is already taken' })
        }
        Admin.signup(username, password, function (err, admin) {
            if (err) return next(err)
            res.json({ success: true })
        })
    })
})

// add post route for /admin
router.get('/admin/add-post', function (req, res) {
    // check if admin is logged in
    if (!req.session.admin) {
        return res.redirect('/admin/login')
    }
    res.render('admin/add-post')
})

router.post('/admin/add-post', function (req, res) {
    // check if admin is logged in
    if (!req.session.admin) {
        return res.redirect('/admin/login')
    }
    // create a new post
    const post = new Post({
        heading: req.body.heading,
        body: req.body.body,
    })
    // save the post to the database
    post.save(function (err) {
        if (err) return next(err)
        return res.redirect('/')
    })
})

// logout route for /admin
router.get('/logout', function (req, res) {
    // clear the admin from the session
    req.session.admin = null
    res.redirect('/')
})

module.exports = router
