function $(id) {
  return document.querySelector(id);
}
const form = $('#contactForm');


form.addEventListener('onsubmit', (e) => {
  e.preventDefault();
  const option = {
    fullname: $('#fullName').value,
    mail: $('#mail').value,
    message: $('#message').value
  }
})