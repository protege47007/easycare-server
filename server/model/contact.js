const mongoose = require("mongoose");
const emailValidator = require("email-validator");

const contactSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: true,
        index: {unique: true},
        minlength: 3
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        index: {unique: true},
        validate: {
            validator: emailValidator,
            message: props => `${props.value} is not a valid email address!`
        }
    },
    message: {
        type: String,
        required: true,
        minlength: 3
    },
  }, {timestamps: true});
  
module.exports = mongoose.model("contact", contactSchema)