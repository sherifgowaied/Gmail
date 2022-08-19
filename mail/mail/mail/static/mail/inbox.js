document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  

  document.querySelector('#compose-form').addEventListener('submit',function(){
    const subject = document.querySelector('#compose-subject').value ;
    const recipients = document.querySelector('#compose-recipients').value ;
    const body = document.querySelector('#compose-body').value ;
    
    fetch('/emails',{
      method:'POST',
      body:JSON.stringify({
        subject:`${subject}`,
        recipients:`${recipients}`,
        body:`${body}`
      })
    })
    .then(response => response.json())
    .then(data =>{
      if (data.error) {
        
        console.log(`Error sending email: ${data.error}`);
    }else {
      load_mailbox('sent');
    }
      
    })
    .catch(error => console.log(error))

    
      return false;
    
  });
    





  // By default, load the inbox
  

  
  load_mailbox('inbox');
});



function compose_email(event, recipients = '', subject = '', body = '') {

  // Show compose view and hide other views
  document.querySelector('#email-view').style.display='none';
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  
  
   document.querySelector('#compose-recipients').value = recipients;
    document.querySelector('#compose-subject').value = subject;
    document.querySelector('#compose-body').value = body;
} 

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#email-view').style.display='none';

  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  if (mailbox === "inbox") {
    document.querySelector('#inbox').style.borderBottom = '3px solid #d93025';
    document.querySelector('#inbox').style.color = '#d93025';

    document.querySelector('#sent').style.borderBottom = '3px solid lightgrey';
    document.querySelector('#sent').style.color = '#5f6368';
    document.querySelector('#archived').style.borderBottom = '3px solid lightgrey';
    document.querySelector('#archived').style.color = '#5f6368';
} else if (mailbox === "sent") {
    document.querySelector('#sent').style.borderBottom = '3px solid #188038';
    document.querySelector('#sent').style.color = '#188038';

    document.querySelector('#inbox').style.borderBottom = '3px solid lightgrey';
    document.querySelector('#inbox').style.color = '#5f6368';
    document.querySelector('#archived').style.borderBottom = '3px solid lightgrey';
    document.querySelector('#archived').style.color = '#5f6368';
} else {
    document.querySelector('#archived').style.borderBottom = '3px solid #fabf19';
    document.querySelector('#archived').style.color = '#fabf19';

    document.querySelector('#inbox').style.borderBottom = '3px solid lightgrey';
    document.querySelector('#inbox').style.color = '#5f6368';
    document.querySelector('#sent').style.borderBottom = '3px solid lightgrey';
    document.querySelector('#sent').style.color = '#5f6368';
}



  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  
  //showing (fetch) data of emails based on mailbox sent the function(sent,archive,inbox)
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails =>{
    //console.log(emails);
    emails.forEach(email => {
      const email_body = document.createElement('div');
      email_body.innerHTML = `
      <span style="width: 240px; display: inline-block">${email.sender}</span>
      <span >${email.subject}</span> 
      <span style="float: right; font">${email.timestamp}</span>`;
      email_body.className = 'mailbox-email';
      email_body.addEventListener('click',function(){
        fetch(`/emails/${email.id}`)
        .then(response => response.json())
        .then(data =>{
          //console.log(data);
          if(!data.read){
            fetch(`/emails/${email.id}`,{
              method:'PUT',
              body:JSON.stringify({
                read:true
              })
            })
            .then(response => {console.log(`PUT status for updating read state returned status code ${response.status}`)})
            
            
            
          }
          load_email(email, mailbox);
        })
        
        //console.log('this element has been clicked')
      });
      
      // Change background color of email if it has been read already
      email_body.style.backgroundColor = "white";
      if(email.read){
        email_body.style.backgroundColor = "rgba(242,245,245,0.8)";
      }
      document.querySelector('#emails-view').append(email_body);
    });
  });

}


function load_email(email , mailbox){
  document.querySelector('#compose-view').style.display = "none";
  document.querySelector('#emails-view').style.display = "none";
  document.querySelector('#email-view').style.display = "block";
  
  const subject_title = document.createElement('div');
  subject_title.innerHTML= email.subject ;
  subject_title.className= 'subject_title';
  

  const details = document.createElement('div');
  details.className = 'details';
  details.innerHTML = `<div><span class="text-muted">From: </span> ${email.sender}
  <span class="text-muted" style="float:right;font-size: 13px;">${email.timestamp}<i class="far fa-star" style="margin-left: 16px"></i></span>
  </div>
  <div>
  <span class="text-muted">To: </span>${email.recipients.join()}
  </div>
  <div>
  <span class="text-muted">Subject: </span>${email.subject}
  </div>
  `;


  //reply button
  const button_reply = document.createElement('button');
  button_reply.innerHTML="<span style='15px;'>&#8592;</span>  Reply";
  button_reply.className="email-btns btn btn-sm btn-outline-secondary";
  button_reply.id="reply_button";
  const body_section = document.createElement('div');
  body_section.innerHTML = email.body ;
  body_section.style.marginTop ="20px";

  button_reply.addEventListener('click', function(event) {
    let subject = email.subject ;
    if (!email.subject.startsWith("Re: ")) {
      subject = `Re: ${subject}`;
    }
    let body = `On ${email.timestamp} <${email.sender}> wrote: \n ${email.body} \n -------- \n`
    let recipient = email.sender;
    compose_email(event, recipient, subject, body)
});



  


  document.querySelector('#email-view').innerHTML = "";
  document.querySelector('#email-view').append(subject_title);
  document.querySelector('#email-view').append(details);
  document.querySelector('#email-view').append(button_reply);

 

  





  if(mailbox ==="inbox"){
    const buttons_archive = document.createElement('button');
    buttons_archive.id="archive_button";
    buttons_archive.innerHTML = "<span class='bi bi-archive' style='color: #f3da35; '></span><span style='color:#000000;'> Archive</span>";
    buttons_archive.className ="btn btn-outline-warning";
    buttons_archive.addEventListener('click',function(event){
    fetch(`/emails/${email.id}`,{
      method:'PUT',
      body:JSON.stringify({
        archived:true
      })
    })
    .then(response => console.log(response))
    load_mailbox("inbox");
    
  });
  document.querySelector('#email-view').append(buttons_archive);
  }
  
  else if(mailbox==="archive"){
    const buttons_unarchive = document.createElement('button');
    buttons_unarchive.id="archive_button";
    buttons_unarchive.innerHTML =  "<i class=\"fas fa-inbox\" style=\"margin-right: 5px\"></i>Move to inbox";
    buttons_unarchive.className ="btn btn-outline-danger";
    buttons_unarchive.addEventListener('click',function(event){
      fetch(`/emails/${email.id}`,{
        method:'PUT',
        body:JSON.stringify({
          archived:false
        })
      })
      .then(response => console.log(response))
      
      load_mailbox("inbox");
    });
    document.querySelector('#email-view').append(buttons_unarchive);
  }
  
  
  
  
  document.querySelector('#email-view').append(body_section);

 

}

