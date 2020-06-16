const DOM = {
  messages: document.querySelector('.messages'),//the message pane
  prompts: document.getElementById('prompts'),
  input: document.querySelector('.message-form__input'),//stuff inside the input bar
  form: document.querySelector('.message-form'),//the input bar
};



function setPrompt(msg) {
  prompts.innerHTML = '';
  prompts.appendChild(document.createTextNode("Say '" + msg + "'"));
}

DOM.form.addEventListener('submit', sendInput);//when input is submitted send message
//sendInput -> userSend -> send
//                      -> respond -> compSend -> send
//

function sendInput() {
  const value = DOM.input.value;
  if (value === '') return;
  DOM.input.value = '';
  userSend(value);
}

function send(msg) {
  const msgs = DOM.messages;
  msgs.appendChild(createMessageElement(msg));
  msgs.scrollTop = msgs.scrollHeight - msgs.clientHeight;//set scroll to bottom
}

function compSend(msg) {
  send("Computer: " + msg)
}
function userSend(msg) {
  send("User: " + msg)
  respond(msg)
}

var step = 0;
const conv = [["hola","hola"],["como estas","bien"]];
setPrompt(conv[0][0]);

function respond(msg) {
  if(step < conv.length && conv[step][0] == msg){
    compSend(conv[step][1]);
    step++;
    setPrompt(conv[step][0])
  }else{
    // end conversation?
  }
}

function createMessageElement(text) {
  const el = document.createElement('div');
  el.appendChild(document.createTextNode(text));
  el.className = 'message';
  return el;
}
