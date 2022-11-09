class TextMessage {
  constructor({ text, who, onComplete }) {
    this.text = text
    this.who = who
    this.onComplete = onComplete
    this.element = null
  }

  createElement() {
    //Create the element
    this.element = document.createElement("div")
    this.element.classList.add("TextMessage")

    console.log(this.who)
    this.element.innerHTML = (`
      <p class="TextMessage_who">${this.who}</p>
      <hr>
      <p class="TextMessage_text">${this.text}</p>
      <button class="TextMessage_button">Next</button>
    `)

    this.element.querySelector("button").addEventListener("click", () => {
      //Close the text message
      this.done()
    })

    this.actionListener = new KeyPressListener("Enter", () => {
      this.actionListener.unbind()
      this.done()
    })

  }

  done() {
    this.element.remove()
    this.onComplete()
  }

  init(container) {
    this.createElement()
    container.appendChild(this.element)
    MathJax.Hub.Queue(["Typeset",MathJax.Hub])
  }

}