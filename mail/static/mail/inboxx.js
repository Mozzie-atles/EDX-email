document.addEventListener('DOMContentLoaded', function () {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

//for email validation, codelink:https://stackoverflow.com/questions/42965541/email-validation-javascript
function validEmail(email) {
  var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
};

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#message-box').style.display = 'none';
  document.querySelector('#mails').style.display = 'none'

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
  document.querySelector('#mails').value = ''
}

function load_mailbox(mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#message-box').style.display = 'none';
  var mail_view = document.querySelector('#mails');
  mail_view.style.display = 'block';

  // Show the mailbox name
  mail_view.innerHTML = ''
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  var message = document.querySelector('#message-box');
  fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {
      // Print emails
      console.log(emails);

      // ... do something else with emails ...

      if (emails.length != 0) {
        for (email in emails) {
          var div = document.createElement("div");
          var sub = document.createElement("h4");
          var time = document.createElement("p");
          var sender = document.createElement("h5");
          var id = document.createElement('p');
          div.className = "mail-div"
          id.innerHTML = emails[email]['id'];
          id.style.display = 'none';
          if (emails[email]['read'] === true) {
            div.style.backgroundColor = 'lightgray'
          } else {
            div.style.backgroundColor = 'white'
          }

          if (mailbox === 'sent') {
            sub.innerHTML = emails[email]['subject'];
            time.innerHTML = emails[email]['timestamp'];
            sender.innerHTML = 'sent to ' + emails[email]['recipients'];

            mail_view.appendChild(div);
            div.appendChild(sub);
            div.appendChild(time);
            div.appendChild(sender);
            div.appendChild(id);
          } else if (mailbox === 'inbox') {
            sub.innerHTML = emails[email]['subject'];
            time.innerHTML = emails[email]['timestamp'];
            sender.innerHTML = 'email from ' + emails[email]['sender'];

            mail_view.appendChild(div);
            div.appendChild(sub);
            div.appendChild(time);
            div.appendChild(sender);
            div.appendChild(id);
          } else {
            sub.innerHTML = emails[email]['subject'];
            time.innerHTML = emails[email]['timestamp'];
            sender.innerHTML = 'email from ' + emails[email]['sender'];


            mail_view.appendChild(div);
            div.appendChild(sub);
            div.appendChild(time);
            div.appendChild(sender);
            div.appendChild(id);
          }
          div.addEventListener('click', () => open_email(mailbox));

        }
      } else {
        document.querySelector('#mails').style.display = 'none'
        message.style.display = 'block';
        message.innerHTML = `Empty ${mailbox} box`
      }
    });


}

function send_email() {
  var recipient = document.querySelector('#compose-recipients').value;
  var subjects = document.querySelector('#compose-subject').value;
  var content = document.querySelector('#compose-body').value;
  var message = document.querySelector('#message-box');
  if (recipient != '') {
    if (!validEmail(recipient)) {
      message.style.display = 'block';
      message.innerHTML = 'Reciver email address invalid'
    } else {
      fetch('/emails', {
        method: 'POST',
        body: JSON.stringify({
          recipients: recipient,
          subject: subjects,
          body: content
        })
      })
        .then(response => response.json())
        .then(result => {
          // Print result
          console.log(result);
        });
      load_mailbox('sent')
    }
  }
  else {
    message.style.display = 'block';
    message.innerHTML = 'There must be atleast one reciver!'
  }
}


function open_email(mailbox) {
  event.stopImmediatePropagation();
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#message-box').style.display = 'none';
  var mail = document.querySelector('#emails-view');
  var mail_view = document.querySelector('#mails');
  mail_view.style.display = 'none';
  mail.style.display = 'block';
  mail.innerHTML = ''
  //i found this method on github
  var tar = event.target;
  if (!(tar.tagName == 'DIV')) {
    tar = tar.parentElement;
  }
  let id = tar.children[3].innerHTML;
  console.log(tar.children[3])


  var div = document.createElement("div");
  var div_btn = document.createElement("div");
  var sub = document.createElement("h4");
  var time = document.createElement("p");
  var sender = document.createElement("h5");
  var body = document.createElement("p");
  var reciver = document.createElement("h5");
  var btn = document.createElement("button");
  var reply = document.createElement("button");

  btn.id = 'archive';
  btn.className = 'btn btn-dark';
  reply.id = 'reply'
  reply.className = 'btn btn-dark'
  reply.style.display = 'none'
  div_btn.className = 'btns';






  fetch(`/emails/${id}`)
    .then(response => response.json())
    .then(email => {
      // Print email

      // ... do something else with email ...
      sub.innerHTML = email['subject'];
      time.innerHTML = 'sent at: ' + email['timestamp'];
      sender.innerHTML = 'From: ' + email['sender'];
      body.innerHTML = email['body'];
      reciver.innerHTML = 'To: ' + email['recipients']
      if (email['archived'] === true) {

        btn.innerHTML = "Unarchive";
      } else {
        btn.innerHTML = "Archive";
        if (mailbox === 'inbox') {
          var re = email['subject']
          reply.innerHTML = 'reply'
          reply.style.display = 'block'
          reply.addEventListener('click', () => {
            document.querySelector('#emails-view').style.display = 'none';
            document.querySelector('#compose-view').style.display = 'block';
            document.querySelector('#message-box').style.display = 'none';

            // Clear out composition fields and replace the recipients

            document.querySelector('#compose-recipients').value = `${email['sender']}`;
            if (re.substr(0, 4) === 'Re: ') {
              document.querySelector('#compose-subject').value = `${email['subject']}`;
            } else {
              document.querySelector('#compose-subject').value = `Re: ${email['subject']}`;
            }
            document.querySelector('#compose-body').value = `\n \n On ${email['timestamp']} ${email['sender']} wrote\n \n ${email['body']}`;
          });
        }
      }

      mail.appendChild(div);
      mail.appendChild(div_btn);
      div.appendChild(sub);
      div.appendChild(sender);
      div.appendChild(reciver);
      div.appendChild(body);
      div.appendChild(time);
      div_btn.appendChild(btn);
      div_btn.appendChild(reply)

      if (email['read'] === false) {
        //making the read attribute true
        fetch(`/emails/${id}`, {
          method: 'PUT',
          body: JSON.stringify({
            read: true
          })
        })
      }
      document.querySelector('#archive').addEventListener('click', () => {
        if (email['archived'] === true) {

          fetch(`/emails/${id}`, {
            method: 'PUT',
            body: JSON.stringify({
              archived: false
            })
          })


        } else {
          fetch(`/emails/${id}`, {
            method: 'PUT',
            body: JSON.stringify({
              archived: true
            })
          })


        }
        load_mailbox('inbox')
      })

    });


}

