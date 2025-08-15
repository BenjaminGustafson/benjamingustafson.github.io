import { GameObject } from "./GameObject.js";
import { ImageObject } from "./ImageObject.js";
import { Button } from "./Button.js";
import { Color, Shapes } from "../util/index.js";

export class DialogueBox extends GameObject{

    constructor({portraitId,
        text = [], 
        onComplete = () => {}
     }){
        super()
        Object.assign(this, {portraitId, text, onComplete})

        this.msPerLetter = 50
        this.stopped = true
        this.textIndex = -1
        this.time = 0
        this.portraitImage = new ImageObject({originX:0, originY:550, width:300,height:300, id:portraitId})
        this.letterIndex = 0

        this.start()
    }

    start(){
        this.hidden = false
        this.textIndex = -1
        this.next()
    }

    next(){
        if (this.textIndex < this.text.length-1){
            this.stopped = false
            this.time = Date.now()
            this.textIndex ++
        }else{
            this.onComplete()
        }
    }
    

    update(ctx, audioManager, mouse){
        Color.setFill(ctx,Color.black)
        Shapes.Rectangle({ctx:ctx, originX: 50, originY: 600, width:1500, height:200, inset: true, shadow:8})
        
        Color.setColor(ctx,Color.white)
        const string = this.text[this.textIndex]
        if (!this.stopped){
            const elapsedTime = Date.now() - this.time
            this.letterIndex = Math.floor(elapsedTime / this.msPerLetter)
            if (this.letterIndex >= string.length){
                this.letterIndex = string.length
                this.stopped = true
            } 
            if (string[this.letterIndex] != ' '){
                audioManager.play('bong_001', 6 - Math.random()*12,0.5)
            }
        }else{
            this.letterIndex = string.length
        }
        const substring = string.substring(0, this.letterIndex)
        ctx.font = '40px monospace'
        ctx.textAlign = 'left'
        ctx.textBaseline = 'top'
        ctx.fillText(substring, 300, 650)

        if (mouse.down && this.stopped){
            this.next()
        }else if (mouse.down && !this.stopped){
            this.time = 0
        }

        this.portraitImage.update(ctx,audioManager,mouse)

        mouse.cursor = 'pointer'
    }
} 