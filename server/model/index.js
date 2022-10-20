
const mongoose = require("mongoose");

//schemas declaration

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
  });
  
  
  
  
  
  
  
  
  
  
  
  
  // users collection encryption
  userSchema.plugin(passportLocalMongoose);
  userSchema.plugin(findOrCreate);
  