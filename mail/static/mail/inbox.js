document.addEventListener('DOMContentLoaded', () => {

  // Load inbox by default
  load_mailbox('inbox');

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  
  document.querySelector('#compose-form').addEventListener('submit', () =>{
    send_email();
    load_mailbox('sent');
    event.preventDefault();
  });

  document.querySelector('#reply-form').addEventListener('submit', () =>{
    reply_email();
    load_mailbox('sent');
    event.preventDefault();
  });
  
});


function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#emails-body').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email').style.display = 'none';
  document.querySelector('#reply-view').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function reply(email_id) {

  // Show reply view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#emails-body').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email').style.display = 'none';
  document.querySelector('#reply-view').style.display = 'block';

  call='/emails/'+email_id;
  console.log(call);

  fetch(call)
  .then(response => response.json())
  .then(email => {

  // Clear out composition fields
  document.querySelector('#reply-recipients').value = `${email.sender}`;
  

  if(email.subject.includes('Re:', 0)){

    document.querySelector('#reply-subject').value = `${email.subject}`;

  }else{
    document.querySelector('#reply-subject').value = `Re: ${email.subject}`;
  }

  document.querySelector('#reply-body').value = `
  
  On ${email.timestamp} ${email.sender} wrote: 
  ${email.body}`;

});
  

}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#emails-body').style.display = 'block';
  document.querySelector('#email').style.display = 'none';
  document.querySelector('#reply-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Delete the existing data in the emails-body
  document.querySelector('#email-summary').innerHTML= ``;

  //Make API call
  if (mailbox == 'sent'){
    get=fetch('/emails/sent')
  }else if (mailbox == 'inbox'){
    get=fetch('/emails/inbox')
  }else{
    get=fetch('/emails/archive')
  }

  get.then(response => response.json())
  .then(emails => {
    // Print emails
    console.log(emails);

    //Displaying the emails
      var i=0;
      for (i = 0; i < emails.length; i++) {

      const row = document.createElement('div');

      row.className = "row email-summary clickable-row";
      row.id=emails[i].id;
     
      if (mailbox!== 'sent' & emails[i].read == false){
        row.style.backgroundColor="gray";
        row.style.color="honeydew";
      }

      const col1 = document.createElement('div');
      col1.className = "col-2"

      const col2 = document.createElement('div');
      col2.className = "col-6"

      const col3 = document.createElement('div');
      col3.className = "col-2.5"
      
      row.append(col3,col1,col2);

      if(mailbox == 'sent'){
        col1.innerHTML =  `<p id="email-col">${emails[i].recipients}</p>`;
        document.querySelector('#from').innerHTML = `<h5>To</h5>`;
      }else{
        col1.innerHTML =  `<p id="email-col">${emails[i].sender}</p>`;
      }


      col2.innerHTML =  `<p style="font-weight: 600; display:inline;">${emails[i].subject}</p><p style="font-weight: 300;   white-space: nowrap; overflow: hidden;">${emails[i].body}</p>`;

      col3.innerHTML =  `<p id="email-col">${emails[i].timestamp}</p>`;
      
      document.querySelector('#email-summary').append(row); 
      }
    });

    $(document).ready(function(){
      $("#email-summary").on("click", "div", function( event ) {
        event.preventDefault();
        email(this.id, mailbox);
      });
    }); 
}

// Go to specific email page

function email(email_id, mailbox){

  // Show the email and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#emails-body').style.display = 'none';
  document.querySelector('#email').style.display = 'block';
  document.querySelector('#reply-view').style.display = 'none';
  

  call='/emails/'+email_id;
  console.log(call);

  fetch(call)
  .then(response => response.json())
  .then(email => {
      // Print email
      console.log(email);
      // ... do something else with email ...
      document.querySelector('#email-sender').innerHTML = `From: ${email.sender}`;
      document.querySelector('#email-recipients').innerHTML = `To: ${email.recipients}`;
      document.querySelector('#email-timestamp').innerHTML = `${email.timestamp}`;
      document.querySelector('#email-subject').innerHTML = `Subject: ${email.subject}`;
      document.querySelector('#email-content').innerHTML = `${email.body}`;
      
      var AB = document.querySelector('#archive');
      userEmail = document.querySelector('#user-email').innerHTML;

      document.querySelector('#reply').addEventListener('click', function(){
        reply(email_id)
      });

      if(mailbox !== 'sent'){

        if(email.archived==true){
          AB.style.visibility = 'visible'
          AB.innerHTML = `Unarchive`;
          AB.onclick = function(){
            archive(email_id);
          };
        }else{
          AB.style.visibility = 'visible'
          AB.innerHTML = `Archive`;
          AB.onclick = function(){
            archive(email_id);
          }; 
        }
      }else{
        AB.style.visibility = 'hidden' ;
      }
        
      if(!email.read){
        fetch('/emails/'+email_id,{
        method: 'PUT',
        body: JSON.stringify({
          read: true
          })
        })
      } 
  });
}

function send_email(){

  // Make the API CALL
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: document.querySelector('#compose-recipients').value,
        subject: document.querySelector('#compose-subject').value,
        body: document.querySelector('#compose-body').value,
        read: false
    })
  })

  .then(response => {
    return response.json();
    })

  .then(result => {
      // Print result
      console.log(result);
    })  

  .catch(error => {
    console.log('Error:', error);
    });
  
  return false;
}

function reply_email(){

  // Make the API CALL
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: document.querySelector('#reply-recipients').value,
        subject: document.querySelector('#reply-subject').value,
        body: document.querySelector('#reply-body').value,
        read: false
    })
  })

  .then(response => {
    return response.json();
  })

  .then(result => {
      // Print result
      console.log(result);})

  .catch(error => {
    console.log('Error:', error);
    });
  
  return false;
}

function archive(email_id){

  call='/emails/'+email_id;

  fetch(call)
  .then(response => response.json())
  .then(email => {

    if(email.archived == false){
      fetch(call, {
        method: 'PUT',
        body: JSON.stringify({
            archived: true
        })
      })
    }else{
      fetch(call, {
        method: 'PUT',
        body: JSON.stringify({
            archived: false
        })
      })
    }
  });
  
  load_mailbox('inbox');
}