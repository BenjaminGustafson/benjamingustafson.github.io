import {Color, Shapes} from '../util/index.js'
import {Player, Grid, FunctionTracer, Button, ImageObject, IntegralTracer, MathBlock, MathBlockManager, MathBlockField, Slider, Target, TargetAdder, TextBox, DialogueBox} from '../GameObjects/index.js'
import * as Scene from '../Scene.js'


export function planetScene(gameState, {
    planetName,
    puzzleLocations,
    shipX, shipY,
    labX, labY,
    tileMap,
    playerNodes,
    playerPaths,
    bgImg, fgImg,
}){
    const gss = gameState.stored

    // Player
    if (!playerNodes[gss.playerLocation]){
        gss.playerLocation = 'planetMap'
    }

    const player = new Player({nodes:playerNodes, paths:playerPaths, currentNode:gss.playerLocation, tileMap:tileMap})     

    // Puzzles 
    var buttons = []
    const locations = [
        [700,600],[1088,603],[1388,707],[1416,505],
        [961,170],[1271,42],[753,28],[585,67]
    ] 
    // TODO make buttons invisible over computers 
    for (let i = 0; i < locations.length; i++) {
        const sceneName = planetName + ".puzzle." + (i+1)
        const button = new Button({
            originX:locations[i][0], originY:locations[i][1],
            width:50, height:50, fontSize: 20,
            onclick:(() => {
                gameState.stored.levelIndex = i;
                player.moveTo(sceneName)
            }),
            label: 1 + "." + (i + 1),
            bgColor: Color.black,
        })
        switch (gameState.stored.completedScenes[sceneName]){
            case 'complete':
                button.bgColor = Color.blue
                break
            case 'in progress':
                button.active = true
                break
            default:
                if (i != 0)
                    button.active = false
                break
        }
        buttons.push(button)
    }

    
    // Dialogue
    const dialogueButton = new Button({originX:1200, originY:300, width:50, height:50, fontSize: 20,
        onclick:(() => {
            Scene.loadScene(gameState,'linear.dialogue.1')
        }),
        label: "!",
    })


    // Ship
    const shipButton = new Button({
        originX:shipX,
        originY:shipY,
        width:100, height:60,
        onclick:(() => { Scene.loadScene(gameState,"planetMap") }),
        label:"Ship",
    })

    // Lab
    const experimentButton = new Button({
        originX:180, originY:130,
        width:100, height:60, 
        onclick:(() => { player.moveTo(planetName+".lab") }),
        label: "Lab"
    })

    // Update and objects
    gameState.update = () => {
        if (player.state == 'arrived'){
            gss.playerLocation = player.currentNode
            Scene.loadScene(gameState,player.currentNode)
        }
    }

    gameState.objects = [
        new ImageObject(0, 0, Scene.CANVAS_WIDTH, Scene.CANVAS_HEIGHT, bgImg),
        player,
        new ImageObject(0, 0, Scene.CANVAS_WIDTH, Scene.CANVAS_HEIGHT, fgImg),
        experimentButton, shipButton, dialogueButton,
    ].concat(buttons)
    
}

/**
 * 
 * Puts a dialogue pop up over the current scene.
 * 
 * @param {*} gameState 
 * @param {*} param1 
 */
export function dialogueScene(gameState, {nextScenes = [], exitTo, portraitId = 'glorpPortrait', text = ""}){
    const gss = gameState.stored
    gameState.objects.forEach(obj => obj.noInput = true)

    const exitButton = new Button( {originX:50, originY:50, width:50, height:50, 
        onclick: () => Scene.loadScene(gameState, exitTo), label:"↑"} )

    const dialogueBox = new DialogueBox({
        portraitId:portraitId,
        text: text,
        onComplete: function(){
            gss.completedScenes[gameState.stored.sceneName] = 'complete'
            Scene.loadScene(gameState, exitTo)
        }
    })
    
    gameState.objects = gameState.objects.concat([
        dialogueBox,
        exitButton
    ])
    unlockScenes(nextScenes, gss)
}

export function unlockScenes (scenes, gss){
    scenes.forEach(p => {
        if (gss.completedScenes[p] != 'complete') gss.completedScenes[p] = 'in progress'
    })
}
