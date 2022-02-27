
const mongoose = require("mongoose");

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

  module.exports = {User, Client, CGiver, Org};