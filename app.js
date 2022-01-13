//node modules initialisation
require("dotenv").config();
const _ = require("lodash");
const mongoose = require("mongoose");
const express = require("express");
const encrypt = require("mongoose-encryption");
const Bcrypt = require("bcrypt");
const saltRounds = 5;
const cloudinary = require('cloudinary');

//`mongodb+srv://protege47007:${process.env.PASS}@cluster0.5nisq.mongodb.net/easycareDb`
// CLOUDINARY_URL=`cloudinary://${process.env.CLOUDKEY}:${process.env.CLOUDSECRET}@easycare-ng`

//calling express
const app = express();

mongoose.connect('mongodb://localhost:27017/eascareDb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(express.urlencoded({ extended: true }));

//schemas declaration
const userSchema = new mongoose.Schema({
  fullname: String,
  email: String,
  password: String,
});

// users collection encryption
userSchema.plugin(encrypt, {
  secret: process.env.KEY,
  encryptedFields: ["password"],
});
const User = mongoose.model("User", userSchema);

// //sudo user collection
// const sudoUserSchema = new mongoose.Schema({
//   fullname: String,
//   email: String,
//   password: String,
// });

// //sudo user collection encryption
// sudoUserSchema.plugin(encrypt, {
//   secret: process.env.KEY,
//   encryptedFields: ["password"],
// });
// const SudoUser = mongoose.model("SudoUser", sudoUserSchema);

//routes
app
  .route("/login") // client's login route

  .post((req, res) => {
    mail = req.body.mail.toLowerCase();

    User.findOne({ email: mail }, function (err, foundUser) {
      if (err) {
        console.log("user collection error:", err);
      } else {
        if (foundUser) {
            console.log(foundUser);
            Bcrypt.compare(req.body.password, foundUser.password, function (err, output) {
                
                 if (output === true) {
                    res.write("Redirect to success screen then back to home screen", "utf-8");
                    res.end('end of stream');
                } else {
                    res.write("Current password/email does not match", "utf-8");
                    res.end();
                    
                }
            });
          
        } else {
            res.write("Current password/email does not match*", "utf-8");
            res.end();
            res.redirect('/login');
        }
      }
    });
});


app
  .route("/signup")
  
  .post((req, res) => {
    User.findOne({ email: req.body.mail }, function (err, foundUser) {
      if (err) {
        console.log("user collection error:", err);
      } else { 
        if (foundUser) {
            
            res.write("you're already a member of this site.", "utf-8");
            res.end();
        }
        else{
        createNewUser(req.body.fullname.toLowerCase(), req.body.mail.toLowerCase(), req.body.password)
        } 
      }
    }); 

    function createNewUser(name, mail, password){

      Bcrypt.hash(password, saltRounds, function (err, hash) {
        console.error(err, 'line 108: hashing error');
        const newUser = new User({
          fullname: name,
          email: mail,
          password: hash,
      });
      
      newUser.save (function (err) {
        if (err) {
          console.error(err, 'saving the user data has generated an error');
        } else {
          res.write("success in creating account", 'utf-8');
          res.end('homePage');
        }
      });
    });
  }
});



///
const contactSchema = new mongoose.Schema({
    fullname: String,
    email: String,
    message: String,
});
  

const Contact = mongoose.model("contact", contactSchema);

//contact form handler
app.post("/contact", (req, res) => {

  const newContact = new Contact({
    fullname: req.body.fullname,
    email: req.body.mail,
    message: req.body.message,
  });
  console.log(newContact);

  newContact.save(function (err) {
    if (err) {
      console.error(err, 'saving the user data has generated an error');
    } else {
      res.write("success in creating account", 'utf-8');
      res.end('\n homePage');
    }
  });

  
});



//Server initialisation
app.listen(process.env.PORT || 3030, () => {
  console.log("Server is Live and running!");
});


/*
*
*
*
*
*
*
*
*
*
*
*
*
*
*
*
*/
(async function () {
  const data = JSON.stringify({
    query: `{
characters(isMonster:true) {
name
episode {
  name
}
}
}`,
  });

  const response = await fetch(
    'https://biggs.stepzen.net/scoobydoo/scoobydoo/__graphql',
    {
      method: 'post',
      body: data,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
        Authorization:
          'Apikey DONOTSENDAPIKEYS',
      },
    }
  );

  const json = await response.json();
  document.getElementById('code').innerHTML = js_beautify(
    JSON.stringify(json.data)
  );
  Prism.highlightAll();
})();