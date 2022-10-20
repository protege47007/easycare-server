const createError = require("http-errors")
const saveToDb = require("../../utils/save-to-db")
const Contact = require("../../model/contact");

async function contact(req, res, next){
    try {
        
        let data = {
            fullname: req.body.fullname,
            email: req.body.mail,
            message: req.body.message,
          };
          let output = saveToDb(data, Contact);
          if (output) return next(createError(500, "Internal server error: could not send your message")) 
        
          res.status(200).json({message: "message and contact info successfully sent"});
        

    } catch (error) {
        return next(createError(500, "Internal server error"))
    }
}
module.exports = contact