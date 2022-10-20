const mongoose = require("mongoose");
const emailValidator = require("email-validator")

const clientSchema = new mongoose.Schema({
    full_name: {
        type: String,
        required: true,
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
        required: true,
        minlength: 5
    },
    profile_picture: {
        type: String,
    },
    gender: {
        type: String,
        required: true,
        minlength: 1
    },
    city: {
        type: String,
        required: true,
        minlength: 3
    },
    state: {
        type: String,
        required: true,
        minlength: 3
    },
    address: {
        type: String,
        required: true,
        minlength: 5
    }
}, {timestamps: true});

clientSchema.pre("save", async function presave(next){
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

clientSchema.methods.comparePassword = async function comparePassword(userPassword){
    return bcrypt.compare(userPassword, this.password)
}


module.exports = mongoose.model("Client", clientSchema);