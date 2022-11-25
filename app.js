//jshint esversion:6
require('dotenv').config();

const express = require("express")
const bodyParser = require("body-parser")
const ejs = require("ejs")
const mongoose = require("mongoose")
//const encrypt = require("mongoose-encryption")
//const md5 = require("md5");
//const bcrypt = require("bcrypt");
const session = require('express-session')
const passport = require("passport")
const passportLocalMongoose = require("passport-local-mongoose")

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
    secret: 'Our lillte secret',
    resave: false,
    saveUninitialized: false
}))

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect('mongodb://localhost:27017/userDB');


const UserSchema = new mongoose.Schema({
    email: String,
    password: String
});

UserSchema.plugin(passportLocalMongoose);

// UserSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ['password'] }); // //! auto encrypt when Find&Save
const User = new mongoose.model("User", UserSchema);

// CHANGE: USE "createStrategy" INSTEAD OF "authenticate"
passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//? //////////////////////////////////////////////////

app.get("/", function (req, res) {
    res.render("Home")
})

app.get("/login", function (req, res) {
    res.render("login")
})

app.get("/register", function (req, res) {
    res.render("register")
})

app.get("/secrets", function (req, res) {
    if (req.isAuthenticated()) {
        res.render("Secrets");
    } else {
        res.redirect("/login");
    }
})

app.get("/logout",function(req,res){
    req.logout(function(err){
        if(!err){
            res.redirect("/");
        }
    });
})

//! non-Cookies version

// app.post("/register", function (req, res) {

//     bcrypt.hash(req.body.password, 2, function(err, hash) {
//         // Store hash in your password DB.
//         const newUser = new User({
//             email: req.body.username,
//             password: hash
//         })
//         newUser.save(function (err) {
//             if (!err) {
//                 res.render("Secrets")
//             }
//         });
//     });
// })

// app.post("/login", function (req, res) {
//     const username = req.body.username
//     const password = req.body.password
//     User.findOne({ email: username }, function (err, foundUser) {
//         if (err) {
//             console.log(err);
//         } else {
//             if (foundUser) {
//                 bcrypt.compare(password, foundUser.password, function(err, result){
//                     if( result === true){
//                         res.render("Secrets");
//                     }
//                 })
//             }
//         }
//     })
// })

//! Cookied version
app.post("/register", function (req, res) {
    User.register({ username: req.body.username }, req.body.password, function (err, user) {
        if (err) {
            console.log(err);
            res.redirect("/register")
        } else {
            passport.authenticate("local")(req, res, function () {
                res.redirect("/secrets")
            })
        }
    })
})

app.post("/login", function (req, res) {
    const user = new User({
        username: req.body.username,
        password: req.body.password
    })
    req.login(user, function(err){
        if(err){
            console.log(err);
        } else{
            passport.authenticate("local")(req,res, function(){
                res.redirect("/secrets");
            })
        }
    })
})

//? //////////////////////////////////////////////////
app.listen(3000, function () {
    console.log("Server Start at port 3000")
})