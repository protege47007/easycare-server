"use strict";
//node modules initialization
require("dotenv").config();
const _ = require("lodash");
const mongoose = require("mongoose");
const express = require("express");
const encrypt = require("mongoose-encryption");
const cloudinary = require('cloudinary');
const mailer = require('nodemailer');
const session = require("express-session")
const passport = require("passport");
const pLMongoose = require("passport-local-mongoose");
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const findOrCreate = require('mongoose-findorcreate');



//`mongodb+srv://protege47007:${process.env.PASS}@cluster0.5nisq.mongodb.net/easycareDb`
// CLOUDINARY_URL=`cloudinary://${process.env.CLOUDKEY}:${process.env.CLOUDSECRET}@easycare-ng`

//calling express
const app = express();


app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.KEY,
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());



mongoose.connect('mongodb://localhost:27017/eascareDb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
// mongoose.set("useCreateIndex", true);



//schemas declaration
const clientSchema = new mongoose.Schema({
  fullname: String,
  email: String,
});

const careGiverSchema = new mongoose.Schema({
  fullname: String,
  email: String,
});

const userSchema = new mongoose.Schema({
  username: String,
  password: String
});

const adminSchema = new mongoose.Schema({
  username: String,
  fullname: String
});



// users collection encryption
userSchema.plugin(pLMongoose);
userSchema.plugin(findOrCreate);

const Clients = mongoose.model("Client", clientSchema);
const CGivers = mongoose.model("CareGiver", careGiverSchema);
const User = mongoose.model("User", userSchema);

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "http://localhost:3030/oauth20/google/",
  // userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
},
function(accessToken, refreshToken, profile, cb) {
  User.findOrCreate({ googleId: profile.id }, function (err, user) {
    return cb(err, user);
  });
}
));


// res.json() to send json data

//admin routes
app
  .route("/admin/:para")
  .post((req,res) => {

  })

//routes
app
  .route("/login") // client's login route

  .post((req, res) => {
    const user = {
      username: req.body.mail,
      password: req.body.password,
    }

    

    User.findOne({ email: req.body.mail }, function (err, foundUser) {
      if (err) {
        console.log("user collection error:", err);
      } else {
        if (foundUser) {
          req.login(user, (err)=>{
            if (err) {
              console.error(err, 'login error');
            } else{
              passport.authenticate('local') (req, res, () => {
                res.write('successfully logged in redirecting to profile page', 'utf8');
                res.end();
                // res.redirect('/profile');
              })
            }
          });
        } else {
            res.write("Current password/email does not match*", "utf-8");
            res.redirect('/login');
        }
      }
    });
});

app.get("/login/google", (req, res) => {
  passport.authenticate('google', { scope: ['profile'] });
});

app.get('/oauth20/google/profile', 
passport.authenticate('google', { failureRedirect: '/login' }),
function(req, res) {
  // Successful authentication, redirect home.
  res.redirect('/profile');
});

app
  .route("/signup")
  
  .post((req, res) => {
    User.findOne({ email: req.body.mail }, function (err, foundUser) {
      if (err) {
        console.log("user collection error:", err);
      } else { 
        if (foundUser) {
            
            res.redirect('/login/already');
        } else {
          User.register({username: req.body.mail.toLowerCase()}, req.body.password, (err, user) => {
            if (err) {
              console.error(err);
              res.redirect('/signup')
            } else {
              passport.authenticate('local')(req, res, () => {
                //new clients db collection with their fullname, mail, and other details
                let data = {
                  fullname: req.body.fullname,
                  email: req.body.mail,
                }
                let output = saveToDb(data, Clients);
                if (!output) {
                  res.redirect('/profile');
                } else {
                  res.redirect('/signup');
                }
                // res.write('welcome to the family')
                // res.json()
                res.redirect('/profile');
              })
            }
          })
        }  
      }
    }); 
  });

  app.get('/logout', (req, res) => {
    req.logOut();
    res.redirect('/');
  })

app
  .route('/caregiver/signup')
  .post((req, res) => {
    User.findOne({ email: req.body.mail }, function (err, foundUser) {
      if (err) {
        console.log("user collection error:", err);
      } else { 
        if (foundUser) {
            
            res.redirect('/login/already');
        } else {
          User.register({username: req.body.mail.toLowerCase()}, req.body.password, (err, user) => {
            if (err) {
              console.error(err);
              res.redirect('/signup')
            } else {
              passport.authenticate('local')(req, res, () => {
                //new clients db collection with their fullname, mail, and other details
                let data = {
                  fullname: req.body.fullname,
                  email: req.body.mail,
                }
                let output = saveToDb(data, CGivers);
                if (!output) {
                  res.redirect('/profile');
                } else {
                  res.redirect('/caregiver/signup/failure');
                }
                // res.write('welcome to the family')
                // res.json()
                res.redirect('/caregiver/profile');
              })
            }
          })
        }  
      }
    }); 
  })

  .patch((req, res) => {
    let data = req.body;
    CGivers.findOneAndUpdate({email: data.mail}, (err, foundRecord) => {
      if (err) {
        console.error(err, 'line 228 caregiver patch failed');
      } else {

      }

    })
  })

app.get('/profile', (req, res) => {
  if(req.isAuthenticated()){
    res.write('welcome to easy care!', 'utf8');
    res.json({fullname: 'john doe', mail: 'john@doe.com'});
    res.end();
  } else {
    res.redirect('/login');
  }
})







///
const contactSchema = new mongoose.Schema({
    fullname: String,
    email: String,
    message: String,
});
  

const Contact = mongoose.model("contact", contactSchema);

//contact form handler
app.post("/contact", (req, res) => {
  let data = {
    fullname: req.body.fullname,
    email: req.body.mail,
    message: req.body.message,
  }
  let output = saveToDb(data, Contact);
  if (!output) {
    res.write("message sent! We would contact you as soon as possible", 'utf-8');
    res.end('\n homePage');
  }
  else{
    res.write('error sending message', 'utf-8');
    res.end();
  }
});


function saveToDb(obj, collectionName){
  const instance = new collectionName(obj);
  instance.save((err) => {
    if (err) {
      console.error('instance save error with ', obj, err);
      return true;
    }
  })
}


const transporter = mailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'youremail@gmail.com',
    pass: 'yourpassword'
  }
});

let mailOptions= {
  from: 'youremail@gmail.com',
  to: 'myFriend@gmail.com', // multiple reciepients 'a@mail.com, b@gamil.com '
  subject: 'Sending Email using Node.js',
  text: 'this was some what easy!.. ;)' // or html: '<h1>welcome</h1><p>that was easy!</p>'
};

function sendMail(auth, options){
  auth.sendMail(options, function(error, info){
    if (error) {
      console.error(error, 'line 30: mail sender function');
    } else {
      console.log('Email sent ', info.response);
    }
  })
}


//Server initialization
app.listen(process.env.PORT || 3030, () => {
  console.log("Server is Live and running!");
});