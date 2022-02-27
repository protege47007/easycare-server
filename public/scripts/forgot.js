function $(id) {
    return document.querySelector(id);
}


const mail = $('#mail');

$('#form').addEventListener( 'submit', (e) => {
    e.preventDefault();
    const data = {mail: mail.value};

    const request = new Request('/forgotten', {
        method: 'POST', 
        body: data,
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
          console.log(res);
          if (res.status === 'success') {
              $('.success').classList.remove('off');
              $('#success').textContent = res.message;
            //   location.href = '/login';
          } else if (res.status === 'failed') {
            $('.fail').classList.remove('off');
            $('#fail').textContent = res.message;
            setTimeout(() => {
                $('.fail').classList.add('off');
                $('#fail').textContent = '';
            }, 3000);
          }
        console.debug(res);
        // ...
      }).catch(error => {
        console.error(error);
      });
});

