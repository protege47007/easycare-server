require("dotenv").config()
const path = require("path")

module.exports = {
    development: {
        siteName: "EasyCare NG [Development]",
        DB: "mongodb://localhost:27017/easycareDb",
        data: {
            
        },
        mailing_agent: {
            key_1: `${process.env.JET_ONE}`,
            key_2: `${process.env.JET_TWO}`
        },
    },
    production: {
        siteName: "EasyCare NG [Test]",
        DB: `mongodb+srv://protege47007:${process.env.PASS}@cluster0.5nisq.mongodb.net/easycareDb`,
        data: {
            // about: path.join(__dirname, "../data/about.json"),
            // portfolio:  path.join(__dirname, "../data/portfolio.json")
        },
        mailing_agent: {
            key_1: `${process.env.JET_ONE}`,
            key_2: `${process.env.JET_TWO}`
        }
    }
}