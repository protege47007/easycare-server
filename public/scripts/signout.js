function validation(){
    var email ="miriamudefi@gmail.com";
    var password ="123456a";

    var eMail = document.getElementById('email').value;
    var passWord = document.getElementById('password').value;

    if((email == eMail) && (password == passWord)) {
        swal("Welcome back!").then(function()
        {
            window.location = "redirectURL";
        });
    }
    else{
        sweetAlert("Oops...", "Wrong Username or password");
    }

    
};