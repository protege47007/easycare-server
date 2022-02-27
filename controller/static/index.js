const ejs = require("ejs");
const express = require("express");

const app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));

exports.home = (req, res) =>{
    res.render('main/home');
}

exports.contact = (req, res) => {
    res.render('main/contact');   
}