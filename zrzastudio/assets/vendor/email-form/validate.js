(function () {
  "use strict";

  let forms = document.querySelectorAll('.email-form');

  forms.forEach( function(e) {
    e.addEventListener('submit', function(event) {
      event.preventDefault();

      let thisForm = this;

      let action = thisForm.getAttribute('action');
      let recaptcha = thisForm.getAttribute('data-recaptcha-site-key');
      thisForm.querySelector('.loading').classList.add('d-block');
      thisForm.querySelector('.error-message').classList.remove('d-block');
      if(action !='newsletter'){
        thisForm.querySelector('.sent-message').classList.remove('d-block');
      }
      else{
        thisForm.querySelector('.sentmessage').classList.remove('d-block');
      }

      let formData = new FormData( thisForm );
      let jsonData = {}; 
      formData.forEach((value, key) => {
         jsonData[key] = value; }
        );
      if ( recaptcha ) {
        if(typeof grecaptcha !== "undefined" ) {
          grecaptcha.ready(function() {
            try {
              grecaptcha.execute(recaptcha, {action: 'email_form_submit'})
              .then(token => {
                formData.set('recaptcha-response', token);
                email_form_submit(thisForm, action, formData);
              })
            } catch(error) {
              displayError(thisForm, error);
            }
          });
        } else {
          displayError(thisForm, 'The reCaptcha javascript API url is not loaded!')
        }
      } else {
        email_form_submit(thisForm, action, formData, jsonData);
      }
    });
  });

  function email_form_submit(thisForm, action, formData, jsonData) {
      fetch('http://localhost:3000/sendemail', {
      method: 'POST',
      body: JSON.stringify(jsonData),
      headers: {"Content-Type": "application/json", 'X-Requested-With': 'XMLHttpRequest'}
    })
    .then(response => {
      if( response.ok ) {        
        return response.json();
      } else {          
        throw new Error(`${response.status} One of our smart AI agents will solve this issue soon`); 
      }
    })
    .then(data => {
      thisForm.querySelector('.loading').classList.remove('d-block');      
      if (data.status.trim() === 'success') { // Ensure you check if data contains expected response
        document.querySelector('.sent-message').classList.add('d-block');        
        thisForm.reset();
      }
      if (data.status.trim() === 'successs') { // Ensure you check if data contains expected response        
        document.querySelector('.sentmessage').classList.add('d-block');
        thisForm.reset();
      }
    })
    .catch((error) => {
      console.log(''+error.message);
      displayError(thisForm, error);
    });
  }

  function displayError(thisForm, error) {
    thisForm.querySelector('.loading').classList.remove('d-block');
    thisForm.querySelector('.error-message').innerHTML = error;
    thisForm.querySelector('.error-message').classList.add('d-block');
  }

})();
