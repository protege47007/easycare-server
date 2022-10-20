function $(id) {
    return document.querySelector(id);
}


const confrm = $('#confirm');
const pwd = $('#password');
const nom = $('#name');
const mail = $('#mail');

$('#signUp').addEventListener( 'submit', (e) => {
    e.preventDefault();
    if( confrm.value !== pwd.value) {
        $('.error').classList.remove('off');
        setTimeout(() => {
            $('.error').classList.add('off');
        }, 4000);
    }
    else{
        

        const user = {
            fullname: nom.value,
            password: pwd.value,
            mail: mail.value
        }
        console.log(user);
        
        const request = new Request('/signup', {
            method: 'POST', 
            body: JSON.stringify(user),
            headers: {"content-type": "application/json"},
            mode: 'same-origin',
        });
        
        fetch(request)
          .then(response => {
            if (response.status === 200) {
              return response.json();
        
            } else {
              throw new Error('Something went wrong on api server!');
            }
          })
          .then(res => {

            console.debug(res);
            
            console.log(res);
            
          }).catch(error => {
            console.error(error);
          });
    }
});

