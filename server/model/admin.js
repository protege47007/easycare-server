const mongoose = require("mongoose");
const emailValidator = require("email-validator")

const adminSchema = new mongoose.Schema({
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
    password: {
        type: String,
        required: true,
        trim: true,
        index: {unique: true},
        minlength: 6
    },
    phone_number: {
        type: String,
        minlength: 6,
        required: true,
        trim: true
    },
    gender: {
        type: String,
        minlength: 6,
        required: true,
        trim: true
    },
    city: {
        type: String,
        minlength: 6,
        required: true,
        trim: true
    },
    state: {
        type: String,
        minlength: 6,
        required: true,
        trim: true
    },
    address: {
        type: String,
        minlength: 6,
        required: true,
        trim: true
    },
}, {timestamps: true});


adminSchema.pre("save", async function presave(next){
    const user = this

    if(!user.isModified("password")) return next()

    try {
        const hash = await bcrypt.hash(user.password, SALT_ROUNDS)
        user.password = hash
        return next()
    } catch (error) {
        return next(error)
    }
})

adminSchema.methods.comparePassword = async function comparePassword(userPassword){
    return bcrypt.compare(userPassword, this.password)
}


module.exports = mongoose.model("Admin", adminSchema);