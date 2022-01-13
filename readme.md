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

bcrypt
mongoose encrypt

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
