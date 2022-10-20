const createError = require("http-errors")
const saveToDb = require("../../utils/save-to-db")
const Client = require("../../model/client");

async function forgotten(req, res, next){
    try {
        
        Client.findOne({email: req.body.mail}, (error, foundUser) =>{
            if (error) return next(createError(500, "internal server error"))
            
            if(!foundUser) return next(createError(404, "user not found"))
            
            //reset password, generate otp and replace with password and send to mail
            res.status(200).json({status: 'success', message: 'Check your mail for your otp'});
        });
          

    } catch (error) {
        return next(createError(500, "Internal server error"))
    }
}


module.exports = forgotten