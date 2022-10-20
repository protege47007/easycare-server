"use strict";
//node modules initialization
require("dotenv").config();
const _ = require("lodash");
const mongoose = require("mongoose");
const express = require("express");
const cloudinary = require("cloudinary").v2;
const mailer = require("nodemailer");
const session = require("express-session");
const MongoDBStore = require('connect-mongodb-session')(session);
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const findOrCreate = require("mongoose-findorcreate");
const multer = require("multer");
const ejs = require("ejs");
const { randomUUID } = require('crypto');


cloudinary.config({
  cloud_name: "easycare-ng",
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET,
});

//`mongodb+srv://protege47007:${process.env.PASS}@cluster0.5nisq.mongodb.net/easycareDb`
// CLOUDINARY_URL=`cloudinary://${process.env.CLOUD_KEY}:${process.env.CLOUD_SECRET}@easycare-ng`

//calling express
const app = express();
const store = new MongoDBStore({
  uri: 'mongodb://localhost:27017/easycareDb',
  collection: 'mySessions'
});
const Session = {
  genid: (req) => {return randomUUID()},
  secret: process.env.KEY,
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 1000*60*60*24},
  store: store,
}
app.set('view engine', 'ejs');
if (app.get('env') === 'production') {
    app.set('trust proxy', 1);
    session.cookie.secure = true;
}
// Catch errors
store.on('error', function(error) { console.log(error); });

//express use middle wares
app.use(express.static('public'));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(session(Session));
app.use(passport.initialize());
app.use(passport.session());


//mongoDB instance
// `mongodb+srv://protege47007:${process.env.PASS}@cluster0.5nisq.mongodb.net/easycareDb`
// 
mongoose.connect(app.get('env') === 'production' ? `mongodb+srv://protege47007:${process.env.PASS}@cluster0.5nisq.mongodb.net/easycareDb` : 'mongodb://localhost:27017/easycareDb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

//schemas declaration

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
});

const clientSchema = new mongoose.Schema({
  fullname: String,
  email: String,
  dateJoined: String,
  phoneNumber: String,
  profilePicture: String,
  gender: String,
  city: String,
  state: String,
  address: String
});


const organizationSchema = new mongoose.Schema({
  organizationName: String,
  email: String,
  dateJoined: String,
  phoneNumber: String,
  city: String,
  state: String,
  address: String,
});

const careGiverSchema = new mongoose.Schema({
  fullname: String,
  email: String,
  dateJoined: String,
  phoneNumber: String,
  gender: String,
  rating: Number,
  city: String,
  state: String,
  address: String,
  organization: organizationSchema,
});



const adminSchema = new mongoose.Schema({
  fullname: String,
  email: String,
  dateJoined: String,
  phoneNumber: String,
  gender: String,
  city: String,
  state: String,
  address: String,
});

// users collection encryption
userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const Client = mongoose.model("Client", clientSchema);
const CGiver = mongoose.model("CareGiver", careGiverSchema);
const User = mongoose.model("User", userSchema);
const Org = mongoose.model("Organizations", organizationSchema);

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "https://mighty-thicket-98219.herokuapp.com/auth/google/",
      // userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
    },
    function (accessToken, refreshToken, profile, cb) {
      User.findOrCreate({ googleId: profile.id }, function (err, user) {
        return cb(err, user);
      });
    }
  )
);
const noAuth = require('./routes/static-pages');

app.use(noAuth);
// home page route
// app.get('/', (req, res) => {
//     res.render('main/home');
// })





// login routes
app
  .route("/login") // client's login route
  .get((req, res) => {
    res.render('auth/login');
  })
  .post((req, res) => {
    const {mail, password} = req.body;
    User.findOne({ email: req.body.mail }, function (err, foundUser) {
      if (err) {
        console.log("user collection error:", err);
      } else {
        if (foundUser) {
          req.login(foundUser, (err) => {
            if (err) {
              console.error(err, "login error");
              res.redirect('/login');
            } else {
              passport.authenticate("local", {failureRedirect: "/login"})(req, res, () => {
                req.session.mail = mail;
                res.redirect("/dashboard");
              });
            }
          });
        } else {
          res.redirect("/login");
        }
      }
    });
  });

app.get(
  "/login/google",
  passport.authenticate("google", { scope: ["profile"] })
);

app.get(
  "/auth/google/",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    res.redirect("/dashboard");
  }
);


//sign up route
app
  .route("/signup")
  .get((req, res) => {
    res.render('auth/signup');
  })
  .post((req, res) => {
    console.log(req.body);
    User.findOne(
      { email: req.body.mail.toLowerCase() },
      function (err, foundUser) {
        if (err) {
          console.log("user collection error:", err);
        } else {
          if (foundUser) {
            res.json({status: "failed", message: "This email is already registered with us!"}); //already a member
          } else {
            User.register(
              { username: req.body.mail.toLowerCase() },
              req.body.password,
              (err, user) => {
                if (err) {
                  console.error(err);
                  res.json({status: "failed", message: "something went wrong on our end. \n please try again."});
                } else {
                  passport.authenticate("local")(req, res, () => {
                    //new clients db collection with their fullname, mail, and other details
                    req.session.mail = req.body.mail;
                    let data = {
                      fullname: req.body.fullname,
                      email: req.body.mail,
                      dateJoined: new Date().toString(),
                    };
                    let output = saveToDb(data, Client);
                    if (!output) {
                      res.redirect("/dashboard");
                    } else {
                      res.redirect("/signup");
                    }
                  });
                }
              }
            );
          }
        }
      }
    );
  });


// sign out route
app.get("/logout", (req, res) => {
  req.logOut();
  res.redirect("/");
});


//care giver profile route
app
  .route("/caregiver/signup")
  .post((req, res) => {
    User.findOne({ email: req.body.mail }, function (err, foundUser) {
      if (err) {
        console.log("user collection error:", err);
      } else {
        if (foundUser) {
          res.redirect("/login/already");
        } else {
          User.register(
            { username: req.body.mail.toLowerCase() },
            req.body.password,
            (err, user) => {
              if (err) {
                console.error(err);
                res.redirect("/signup");
              } else {
                passport.authenticate("local")(req, res, () => {
                  //new clients db collection with their fullname, mail, and other details
                  let data = {
                    fullname: req.body.fullname,
                    email: req.body.mail,
                  };
                  let output = saveToDb(data, CGiver);
                  if (!output) {
                    res.redirect("/profile");
                  } else {
                    res.redirect("/caregiver/signup/failure");
                  }
                  // res.write('welcome to the family')
                  // res.json()
                  res.redirect("/caregiver/profile");
                });
              }
            }
          );
        }
      }
    });
  })

  .patch((req, res) => {
    let data = req.body;
    CGivers.findOneAndUpdate({ email: data.mail }, (err, foundRecord) => {
      if (err) {
        console.error(err, "line 228 caregiver patch failed");
      } else {
      }
    });
  });



app.route("/dashboard")
.get( (req, res) => {
  if (req.isAuthenticated()) {
    Client.findOne({email: req.session.mail}, (err, foundUser) => {
      if(err){
        console.error(err, 'error fetching data');
        res.redirect('/login');
      }
      else{
        console.log(foundUser);
        
        res.render('main/dashboard', {
          user: foundUser,
        });
      }
    });
  } else {
    res.redirect("/login");
  }
});

app.get('/dashboard/:something', (req, res) => {
  if (req.isAuthenticated()) {

    //routing between each dashboard component
    switch (req.params.something) {
      case "profile":
        Client.findOne({email: req.session.mail}, (err, foundClient) => {
          if (err) {
            console.error(err);
            res.json({status: "failed", message: "error fetching data"});
          } else {
            res.render('main/client/profile', {
              user: foundClient,
            });
          }
        });
        break;
  
      case "caregiver":
        
        break;
  
      case "inbox":
        
        break;
  
      default:
        res.redirect('/dashboard');
        break;
    }
    //end of switch statement
  }
  else{
    res.redirect('/login');
  }
  
});







/// contact page route
const contactSchema = new mongoose.Schema({
  fullname: String,
  email: String,
  message: String,
});

const Contact = mongoose.model("contact", contactSchema);

//contact form handler
app.route("/contact")
  // .get((req, res) => {
  //   res.render('main/contact');
  // })
.post( (req, res) => {
  let data = {
    fullname: req.body.fullname,
    email: req.body.mail,
    message: req.body.message,
  };
  let output = saveToDb(data, Contact);
  if (!output) {
    res.write(
      "message sent! We would contact you as soon as possible",
      "utf-8"
    );
    res.end("\n homePage");
  } else {
    res.write("error sending message", "utf-8");
    res.end();
  }
});

app.get("/contact/posts", (req, res) => {
  Contact.find({}, (err, posts) => {
    res.send(posts);
  });
});

const articleSchema = new mongoose.Schema({
  date: String,
  author: String,
  article: String,
  image: String,
});

const Article = mongoose.model("article", articleSchema);



//news page route
app
  .route("/news")
  .get((req, res) => {
    res.render('main/news');
  })
  .post(async (req, res) => {
    try {
      await cloudinary.uploader.upload(
        req.body.image,
        function (error, result) {
          console.log(result);
          const post = {
            date: req.body.date,
            author: req.body.author,
            article: req.body.article,
            image: result.secure_url,
          };
          let output = saveToDb(post, Article);
          if (!output) {
            res.status(200).redirect("/news");
          }
        }
      );
    } catch (error) {
      console.error(error);
      res.status(500).json({ err: "something went wrong" });
    }
  })

  // .get((req, res) => {
  //   Article.find({}, (err, articles) => {
  //     if (err) console.log("error getting news articles");
  //     else {
  //       res.send(articles);
  //     }
  //   });
  // });

const storage = multer.memoryStorage();
const upload = multer({ storage });
const path = require('path');

const DatauriParser = require('datauri/parser');
const { error } = require("console");
const parser = new DatauriParser();

const dataUri = (req) =>{
  console.log(req);
  const extName = path.extname(req.file.originalname).toString();
  return  parser.format('.jpg', req.file.buffer);
}

app.post("/news/test", upload.single("image"), async (req, res) => {
  try {
    console.log(req.file);
    if (req.file) {
      const file = await dataUri(req).content;
      console.log(file, 'file gotten');

      await cloudinary.uploader.upload(file, function(error, result) {
      console.log(result, 'result:');
      const post = {
        date: req.body.date,
        author: req.body.author,
        article: req.body.article,
        image: result.secure_url,
      }
      let output = saveToDb(post, Article);
      if (!output) {
        res.status(200).redirect('/news')
      }
        }
      )
    }
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ err: "something went wrong" });
  }
});

//about us page route
app
  .route("/about")
  .get((req, res) => {
    res.render('main/about');
  });



app
  .route("/services")
  .get((req, res) => {
    res.render('main/services');
  });





//saving to database function
function saveToDb(obj, collectionName) {
  const instance = new collectionName(obj);
  instance.save((err) => {
    if (err) {
      console.error("instance save error with ", obj, err);
      return true;
    }
  });
}


//password recovery route
app.route('/forgotten')
.get((req, res) => {
  res.render('auth/forget');
})
.post( (req, res) => {
  User.findOne({email: req.body.mail}, (error, foundUser) =>{
    if (error) {
      res.json({status: 'failed', message: 'error fetching data. try again'});
    }
    else{
      if (foundUser) {
        console.log(foundUser);
        //reset password, generate otp and replace with password and send to mail
        res.json({status: 'success', message: 'Check your mail for your otp'});
      } else {
        res.json({
          status: 'failed',
          message: 'Email is not registered with us'
        })
      }
    }
  })
})


const transporter = mailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MY_MAIL,
    pass: process.env.MAIL_KEY,
  },
});

let mailOptions = {
  from: "stalker@stalker.com",
  to: "akdadewumi@gmail.com", // multiple reciepients 'a@mail.com, b@gamil.com '
  subject: "Sending Email using Node.js",
  text: "this was some what easy!.. ;)", // or html: '<h1>welcome</h1><p>that was easy!</p>'
};

function sendMail(auth, options) {
  auth.sendMail(options, function (error, info) {
    if (error) {
      console.error(error, "line 30: mail sender function");
    } else {
      console.log("Email sent ", info.response);
    }
  });
}
// sendMail(transporter, mailOptions);



app.use(function(req, res){
  res.status(404).json({body: '404_error_template'});
});

// error handler
app.use( (err, req, res, next) => {
  console.log(err)
  res.locals.message = err.message // global error message
  const status = err.status || 500
  res.locals.status = status // global error status
  res.status(500).json({body: err.body, message: err.message})
})

//Server initialization
app.listen(process.env.PORT || 3030, () => {
  console.log("Server is Live and running! on port: ", process.env.PORT || 3030);
});
