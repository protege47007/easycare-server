require("dotenv").config();
const express = require("express");
const { User, Client } = require("../../model/index");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const findOrCreate = require("mongoose-findorcreate");
const ejs = require("ejs");

const app = express();

const Session = {
  secret: process.env.KEY,
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 1000 * 60 * 60 * 24 },
};

app.set("view engine", "ejs");

app.use(express.static("public"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(session(Session));
app.use(passport.initialize());
app.use(passport.session());

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
      callbackURL:
        app.get("env") === "production"
          ? "https://mighty-thicket-98219.herokuapp.com/auth/google/"
          : "http://localhost:3030/auth/google/",
    },
    function (accessToken, refreshToken, profile, cb) {
      User.findOrCreate({ googleId: profile.id }, function (err, user) {
        return cb(err, user);
      });
    }
  )
);

// login routes
app
  .route("/login") // client's login route
  .get((req, res) => {
    res.render("auth/login");
  })
  .post((req, res) => {
    const { mail, password } = req.body;
    User.findOne({ email: req.body.mail }, function (err, foundUser) {
      if (err) {
        console.log("user collection error:", err);
      } else {
        if (foundUser) {
          req.login(foundUser, (err) => {
            if (err) {
              console.error(err, "login error");
              res.redirect("/login");
            } else {
              passport.authenticate("local", { failureRedirect: "/login" })(
                req,
                res,
                () => {
                  req.session.mail = mail;
                  res.redirect("/dashboard");
                }
              );
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
    res.render("auth/signup");
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
            res.json({
              status: "failed",
              message: "This email is already registered with us!",
            }); //already a member
          } else {
            User.register(
              { username: req.body.mail.toLowerCase() },
              req.body.password,
              (err, user) => {
                if (err) {
                  console.error(err);
                  res.json({
                    status: "failed",
                    message:
                      "something went wrong on our end. \n please try again.",
                  });
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
