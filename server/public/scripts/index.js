  window.onload = (event) =>{
    const path = /\w+/.exec(location.pathname);
    document.querySelectorAll(".nav-link").forEach((n, i) => {
      if(location.pathname === n.getAttribute('href')){
        n.classList.add('active');
      }
    })
  }