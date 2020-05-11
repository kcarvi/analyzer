
let text = document.querySelector('#text');
let spinner = document.querySelector('.lds-spinner');

document.querySelector('#analyzer').addEventListener('click', function(){
  spinner.style.display = 'block';
  document.querySelector('#out').innerHTML = '';
  fetch('/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ 'text': text.value }),
  }).then(function(response) {
    return response.json();
  }).then(function(data) {
    let html = data.join(' ');

    spinner.style.display = 'none';
    document.querySelector('#out').innerHTML = html;
  });

})