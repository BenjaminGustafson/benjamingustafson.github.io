class FlashCard {
    constructor({ question, answer, onComplete }) {
      this.question = question;
      this.answer = answer;
      this.onComplete = onComplete;
      this.color = "1px solid #ccc"
    }
  
    createElement(container, n) {
      var element = document.createElement("div");
      element.classList.add("FlashCard");
  
      element.innerHTML = (`<p class="FlashCard_p">${this.question}</p>`)

      element.style.border = this.color
      
      var field = document.createElement("input") 
      field.style.border = this.color
      field.type = "text";
      field.classList.add("FlashCard_field");
      if (n < this.answer.length){
        element.appendChild(field)
      }

      
      const actionListener = new KeyPressListener("Enter", () => {

        if (n < this.answer.length){
          if (this.answer[n] === field.value){
            this.color = "1px solid rgb(14, 255, 54)"
          }else{
            this.color = "1px solid rgb(255, 14, 54)"
          }
          const regex = /\\underline\{\s*\}|_+/
          this.question = this.question.replace(regex, this.answer[n])
          this.createElement(container, n+1)
        }else{
          this.onComplete();
        }
        actionListener.unbind();
        element.remove();
      })
      
      container. appendChild(element)
      MathJax.Hub.Queue(["Typeset",MathJax.Hub])
      field.focus()
    }

  
    init(container) {
      this.createElement(container, 0);
    }
  
  }