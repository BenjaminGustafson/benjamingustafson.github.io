const DOM = {
  messages: document.querySelector('.messages'),//the message pane
  input: document.querySelector('.message-form__input'),//stuff inside the input bar
  form: document.querySelector('.message-form'),//the input bar
};

DOM.form.addEventListener('submit', sendMessage);//when input is submitted send message

function sendMessage() {
  const value = DOM.input.value;//get text from input bar
  if (value === '') {//if no input do nothing
    return;
  }
  DOM.input.value = '';//clear input bar
  console.log("Sending message " + value)
  const msgs = DOM.messages;
  msgs.appendChild(createMessageElement(value));
  msgs.scrollTop = msgs.scrollHeight - msgs.clientHeight;//set scroll to bottom
}

function createMessageElement(text) {
  const el = document.createElement('div');
  el.appendChild(document.createTextNode(text));
  el.className = 'message';
  return el;
}
