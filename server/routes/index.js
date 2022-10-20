const router = require("express").Router()
const contact = require("../controller/static/contact")

module.exports = (params) => {
    
    router.get("/", (req, res) => {
        res.render('main/home');
    })

    router.get("/about", (req, res) => {
        res.render('main/about');
    })

    router.get("/news", (req, res) => {
        res.render('main/news');
    })

    router.get("/contact", (req, res) => {
        res.render('main/contact');
    })

    router.post("/contact", contact)

    router.get("/services", (req, res) => {
        res.render('main/services');
    })

    router.get("/forgot-password", (req, res) => {
        res.render('auth/forget');
    })
    
    router.use("/", auth)
    
    //Authentication is required henceforth
    router.use(isUserLoggedIn)
    
    router.use("/dashboard")
    // router.use("/org")
    
    
    
    return router
}