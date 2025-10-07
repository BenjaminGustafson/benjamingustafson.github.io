import {Color, Shapes} from '../util/index.js'
import {PuzzleComputer, Player, Grid, FunctionTracer, Button, ImageObject, IntegralTracer, MathBlock, MathBlockManager, MathBlockField, Slider, Target, TargetAdder, TextBox, DialogueBox} from '../GameObjects/index.js'
import * as Scene from '../Scene.js'

export function planetScene(gameState, {
    planetName,
    puzzleLocations,
    shipX, shipY, shipDir='SE',
    labX, labY, labDir='SE',
    tileMap,
    playerNodes,
    playerPaths,
    bgImg, fgImg,
    message
}){
    const gss = gameState.stored
    var transition = true

    if (gss.planetProgress[gss.planet] == 'unvisited'){
        gss.planetProgress[gss.planet] = 'visited'
    }

    // Player
    if (!playerNodes[gss.playerLocation]){
        gss.playerLocation = 'planetMap'
    }

    if (!gss.completedScenes[gss.planet + '.puzzle.1']){
        gss.completedScenes[gss.planet + '.puzzle.1'] = 'in progress'
    }

    const player = new Player({nodes:playerNodes, paths:playerPaths, currentNode:gss.playerLocation, tileMap:tileMap})     

    const sprites = []
    const buttons = []

    for (let node in playerNodes){
        const nodeNameSplit = node.toLowerCase().split('.')
        const pos = playerNodes[node]
        const canvasPos = tileMap.isometricToCanvas(pos[0]+pos[2], pos[1]+pos[3])  

        const button = new Button({
            originX:0,
            originY:0,
            onclick : () => player.moveTo(node),
            bgColor: `rgba(100,0,100,0.1)`,
            color: `rgba(100,0,100,0.1)`
        })
        button.visible = false
        buttons.push(button)
        
        if (nodeNameSplit.length >= 2){
            switch(nodeNameSplit[1]){
                case 'puzzle':
                    button.originX = canvasPos.x + 230
                    button.originY = canvasPos.y + 250
                    button.width = 50
                    button.height = 70
                    
                    const computer = new PuzzleComputer({x:canvasPos.x, y:canvasPos.y, text:nodeNameSplit[2]})
                    var id = 'computer'
                    // NW -> SE
                    if (pos[2] == -1 && pos[3] == 0){
                        computer.dir = 'SE'
                    }
                    // NE -> SW
                    else if (pos[2] == 0 && pos[3] == -1){
                        computer.dir = 'SW'
                    }else{
                        console.warn('unsupported computer direction', pos[2], pos[3])
                        continue
                    }

                    switch (gss.completedScenes[node]){
                        case 'complete':
                            computer.color = Color.adjustLightness(Color.blue, -50)
                            break
                        case 'in progress':
                            computer.color = Color.adjustLightness(Color.magenta, -50)
                            break
                        default:
                                button.active = false
                            break
                    }
                    sprites.push(computer)
                    break
                case 'dialogue':
                    var id = 'alienSE'
                    // NE -> SW
                    if (pos[2] == 0 && pos[3] == -1){
                        id = 'alienSW'
                    }
                    sprites.push(new ImageObject({originX:canvasPos.x, originY:canvasPos.y, id:id}))
                    button.originX = canvasPos.x + 230
                    button.originY = canvasPos.y + 250
                    button.width = 50
                    button.height = 70
                    button.onclick = ()=>{transition = false; player.moveTo(node)}
                    switch (gss.completedScenes[node]){
                        case 'complete':
                            break
                        case 'in progress':
                            break
                        default:
                                button.active = false
                            break
                    }
                    break 
                case 'lab':
                    sprites.push(new ImageObject({originX:labX, originY:labY, id:'lab'+labDir}))
                    button.originX = labX+130,
                    button.originY = labY+200,
                    button.width = 250
                    button.height = 150
                    switch (gss.completedScenes[node]){
                        case 'complete':
                            break
                        case 'in progress':
                            break
                        default:
                                button.active = false
                            break
                    }
                    break
                default:
                    console.warn('unknown node', node)
                    break
            }
        }else if (nodeNameSplit[0] == 'planetmap'){
            sprites.push(new ImageObject({originX:shipX, originY:shipY, id:'ship'+shipDir}))
            button.originX = shipX+100,
            button.originY = shipY+200,
            button.width = 250
            button.height = 150
        }else {
            console.warn('unknown node', node)
        }
    }

    // Update and objects
    gameState.update = () => {
        if (player.state == 'arrived'){
            gss.playerLocation = player.currentNode
            if (gss.playerLocation.split('.')[1] == 'dialogue'){
                Scene.loadScene(gameState,player.currentNode)
            }else {
                Scene.loadSceneWithTransition(gameState,player.currentNode, {x:player.cx,y:player.cy})
            }
        }
    }

    gameState.objects = [
        new ImageObject({originX:0, originY:0, id:bgImg}),
        ...sprites,
        player,
        new ImageObject({originX:0, originY:0, id:fgImg}),
        // experimentButton, shipButton, dialogueButton,
    ].concat(buttons)
    
    if (message && message.goTo){
        player.moveTo(message.goTo)
    }

}

/**
 * 
 * Puts a dialogue pop up over the current scene.
 * 
 * @param {*} gameState 
 * @param {*} param1 
 */
export function dialogueScene(gameState, {nextScenes = [], portraitId = 'glorpPortrait', text = "", onComplete=  ()=>{}}){
    const gss = gameState.stored
    gameState.objects.forEach(obj => obj.noInput = true)

    const exitButton = new Button( {originX:50, originY:50, width:50, height:50, 
        onclick: () => Scene.loadScene(gameState, exitTo), label:"↑"} )

    const dialogueBox = new DialogueBox({
        portraitId:portraitId,
        text: text,
        onComplete: function(){
            gss.completedScenes[gameState.stored.sceneName] = 'complete'
            Scene.loadScene(gameState, gss.planet)
            onComplete(gameState)
        }
    })
    
    gameState.objects = gameState.objects.concat([
        dialogueBox,
        exitButton
    ])
    unlockScenes(nextScenes, gss)
}

export function unlockPopup(gameState, {itemImage, topText, onComplete = () => {}, bottomText=''}){
    const gss = gameState.stored
    gameState.objects.forEach(obj => obj.noInput = true)

    const popup = {
        textBox: new TextBox({originX:800, originY: 300, content: topText, align: 'center', color: Color.white,
             font:'30px monospace'}),
        bottomTextBox: new TextBox({originX:800, originY: 550, content: bottomText, align: 'center', color: Color.white,
        font:'20px monospace'}),
        playedAudio: false,
        image: new ImageObject({originX:700, originY: 350, id:itemImage}),
        startTime : Date.now(),
        update: function(ctx, audio, mouse){
            if (!this.playedAudio){
                this.playedAudio = true
                audio.play('confirmation_001')
            }
            Color.setColor(ctx, Color.black)
            Shapes.Rectangle({ctx: ctx, originX: 400, originY:200, width:800, height: 400, inset:true, shadow:8})
            this.textBox.update(ctx)
            this.bottomTextBox.update(ctx)
            this.image.update(ctx)
            if (Date.now() - this.startTime > 500){
                mouse.cursor = 'pointer'
                if (mouse.down) {
                    this.hidden = true
                    gameState.objects.forEach(obj => obj.noInput = false)
                    onComplete(gameState)
                }
            }
            
        }
    }
    gameState.objects.push(popup)
}

export function unlockScenes (scenes, gss){
    scenes.forEach(p => {
        if (gss.completedScenes[p] != 'complete') gss.completedScenes[p] = 'in progress'
    })
}

export function backButton (gameState){
    return new Button({originX:50, originY: 50, width:100, height: 100,
        onclick: ()=>Scene.loadScene(gameState,gameState.stored.planet),
        label:"↑"
    })
}

export function nextButton (gameState, nextScenes){
    const button = new Button({originX:200, originY: 50, width:100, height: 100,
        onclick: ()=>Scene.loadScene(gameState, gameState.stored.planet, {goTo:nextScenes[0]}), label:"→"})
    button.active = false
    return button
}

export function winCon(gameState, condition, nextButton){
    const oldUpdate = gameState.update
    gameState.update = () => {
        oldUpdate()
        if (condition()){
            gameState.stored.completedScenes[gameState.stored.sceneName] = 'complete'
            if (nextButton != null){
                nextButton.active = true
                nextButton.bgColor = Color.blue
            }
        }
    }
}