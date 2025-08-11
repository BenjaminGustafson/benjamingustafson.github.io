import {Color, Shapes} from '../util/index.js'
import {Grid, FunctionTracer, Button, ImageObject, IntegralTracer, MathBlock, MathBlockManager, MathBlockField, Slider, Target, TargetAdder, TextBox, DialogueBox} from '../GameObjects/index.js'
import * as Scene from '../Scene.js'


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

export function createPuzzleButtons(gameState, {levels, locations, player}){
    var buttons = []
    for (let i = 0; i < levels.length; i++) {
        const button = new Button({
            originX:locations[i][0], originY:locations[i][1],
            width:50, height:50, fontSize: 20,
            onclick:(() => {
                gameState.stored.levelIndex = i;
                player.moveTo(levels[i])
            }),
            label: 1 + "." + (i + 1),
            bgColor: Color.black,
        })
        switch (gameState.stored.completedScenes[levels[i]]){
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

    return buttons
}