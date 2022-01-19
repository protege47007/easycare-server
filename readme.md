home page: contact link is missing
rectify route links


project scope:

1) users: 
-login (POST): full name, email, password
-profile (GET): full name, email, other details
-recover account (): email address
-update profile: 


2) profile:
-get details: name, mail, image, 
-delete account: auth, 
-change password: old password, new password,

3) caregivers
- get all caregivers


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

pages: 
home: {
    testimonials (get)
    health news (get)
}

about:{
    team (get)
    subscribe to blog (post)
}

services:{
    link to caregivers
    link to shrink
    link to maids
    link to chefs
}

news: {
    trending (get)
    health news (get)
    food (get)
}

contact: {
    contact form (post) {fullname, mail, message}
    contact page detail {phonenumber, address}
}

faq: {
    link to contact us
    questions and answers (get)
}

login: {
    google route
    mail and password post
    forgot password link
}

success{
    redirect to dashboard
}

sign up {
    form {full name, mail, password}
    google route
}

client dashboard{
    get: /user/dashboard/
    inbox (get: /user/dashboard/inbox)
    search bar (get/user/dashboard/?queryCaregiver)
    profile details (get: /user/dashboard/profile)
    stats: {number of CGs, available CGs, and unavailable CGs}
    caregiver (get: /caregivers) data pack {fullname, location, rating, availability, profile (get)}
    filter and sort functionality
    
}

testimonials: 
    get (client), post, delete, put (admin)
    data pack {article, name, location, image}

news:
    trending news: get (client), post, put, delete (admin) data pack : {date, title, link}
    health: data pack {date, title, link}, get (client), post, put, delete (admin)
    food: data pack {image, date, title, link}, get (client), post, put, delete (admin)
