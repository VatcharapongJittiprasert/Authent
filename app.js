//jshint esversion:6
require('dotenv').config();

const express = require("express")
const bodyParser = require("body-parser")
const ejs = require("ejs")
const mongoose = require("mongoose")
const encrypt = require("mongoose-encryption")
const md5 = require("md5");
const bcrypt = require("bcrypt");

const app = express();

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect('mongodb://localhost:27017/userDB');

const UserSchema = new mongoose.Schema({
    email: String,
    password: String
});

// UserSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ['password'] }); // //! auto encrypt when Find&Save
const User = new mongoose.model("User", UserSchema);

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

app.post("/register", function (req, res) {

    bcrypt.hash(req.body.password, 2, function(err, hash) {
        // Store hash in your password DB.
        const newUser = new User({
            email: req.body.username,
            password: hash
        })
        newUser.save(function (err) {
            if (!err) {
                res.render("Secrets")
            }
        });
    });
})

app.post("/login", function (req, res) {
    const username = req.body.username
    const password = req.body.password
    User.findOne({ email: username }, function (err, foundUser) {
        if (err) {
            console.log(err);
        } else {
            if (foundUser) {
                bcrypt.compare(password, foundUser.password, function(err, result){
                    if( result === true){
                        res.render("Secrets");
                    }
                })
            }
        }
    })
})

//? //////////////////////////////////////////////////
app.listen(3000, function () {
    console.log("Server Start at port 3000")
})