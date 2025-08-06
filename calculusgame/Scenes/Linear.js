import {Color, Shapes} from '../util/index.js'
import {Grid, FunctionTracer, Button, ImageObject, IntegralTracer, MathBlock, MathBlockManager, MathBlockField, Slider, Target, TargetAdder, TextBox, DialogueBox} from '../GameObjects/index.js'
import * as Scene from '../Scene.js'


/**
 * The map is isometric tiles of 128 x 64. 
 * The map is 1600 x 900, so that is 12.5 x 14.0625 tiles
 * The top left corner should be right at a tile intersection
 * Then to move along the path we just need the path coordinates
 * 
 */

export function linearPlanet(gameState){
    const gss = gameState.stored
    const door_button = new Button({originX:200, originY:600, width:100, height:60, onclick:(() => { Scene.loadScene(gameState,"planetMap") }), label:"Ship"})
    
    const experimentButton = new Button({originX:180, originY:130, width:100, height:60, 
        onclick:(() => { Scene.loadScene(gameState, "linearExperiment") }), label: "Lab"})


    // ---------------------------- Puzzle buttons ----------------------------------
    const levels = Scene.PLANET_DATA['Linear']['puzzles']
    var buttons = []
    for (let i = 0; i < levels.length; i++) {
        const button = new Button({originX:0, originY:0, width:50, height:50, fontSize: 20,
            onclick:(() => {
                gss.levelIndex = i;
                Scene.loadScene(gameState,levels[i])
            }),
            label: 1 + "." + (i + 1),
            bgColor: Color.black,
        })
        switch (gss.completedScenes[levels[i]]){
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


    const buttonLocations = [
        [700,600],[1088,603],[1388,707],[1416,505],
        [961,170],[1271,42],[753,28],[585,67]
    ]

    for (let i = 0; i < buttons.length; i++) {
        buttons[i].originX = buttonLocations[i][0]
        buttons[i].originY = buttonLocations[i][1]
    }

    //-------------------------------- Dialogue Buttons -----------------------------

    const dialogueButton = new Button({originX:1200, originY:300, width:50, height:50, fontSize: 20,
        onclick:(() => {
            Scene.loadScene(gameState,'linearDialogue1')
        }),
        label: "!",
    })

    switch (gss.completedScenes['linearDialogue1']){
        case 'complete':
            dialogueButton.bgColor = Color.blue
            break
        case 'in progress':
            dialogueButton.active = true
            break
        default:
            dialogueButton.active = false
            break
    }

    gameState.objects = [
        new ImageObject(0, 0, Scene.CANVAS_WIDTH, Scene.CANVAS_HEIGHT, "linearPlanetBg"),
        new ImageObject(0, 0, Scene.CANVAS_WIDTH, Scene.CANVAS_HEIGHT, "linearPlanetFg"),
        experimentButton,
        door_button,
        dialogueButton,
    ]
    gameState.objects = gameState.objects.concat(buttons)

}


function unlockScenes (scenes, gss){
    scenes.forEach(p => {
        if (gss.completedScenes[p] != 'complete') gss.completedScenes[p] = 'in progress'
    })
}

export function linearPuzzle1 (gameState, {nextScenes}){
    const gss = gameState.stored
    const gridLeft = new Grid({
        canvasX:560, canvasY:430, canvasWidth:100, canvasHeight:100, 
        gridXMin:0, gridYMin:0, gridXMax:1, gridYMax:1, labels:false, arrows:false
    })

    const gridRight = new Grid({canvasX:900, canvasY:430, canvasWidth:100, canvasHeight:100,
        gridXMin:0, gridYMin:0, gridXMax:1, gridYMax:1, labels:false, arrows:false
    })
    
    const slider = new Slider({grid:gridRight, gridPos:0})

    const target = new Target({grid: gridLeft, gridX:1, gridY:1, size:20})
    const tracer = new IntegralTracer({grid: gridLeft, sliders: [slider], targets:[target]})
    const backButton = new Button({originX:50, originY: 50, width:100, height: 100,
        onclick: ()=>Scene.loadScene(gameState,"linearPlanet"), label:"↑"})
    
    unlockScenes(nextScenes, gss)
    // Objects and update
    gameState.objects = [gridLeft, gridRight, slider, target, tracer, backButton]
    gameState.update = () => {
        if (tracer.solved){
            gameState.stored.completedScenes[gameState.stored.sceneName] = 'complete'
        }
    }
    
}

export function linearPuzzle2 (gameState, {nextScenes}){
    const gss = gameState.stored
    const gridLeft = new Grid({canvasX:560, canvasY:430, canvasWidth:200, canvasHeight:200, 
        gridXMin:-1, gridYMin:0, gridXMax:1, gridYMax:2, labels:false, arrows:false})
    //const gridLeft = new Grid(560, 430, 200, 200, 2, 2, 5)
    const gridRight = new Grid({canvasX:900, canvasY:430, canvasWidth:200, canvasHeight:200, 
        gridXMin:-1, gridYMin:-1, gridXMax:1, gridYMax:1, labels:false, arrows:false})
    const sliders = [
        new Slider({grid:gridRight, gridPos:-1}),
        new Slider({grid:gridRight, gridPos:0}),
    ]
    const targets = [
        new Target({grid: gridLeft, gridX:0, gridY:1, size:20}),
        new Target({grid: gridLeft, gridX:1, gridY:2, size:20})
    ]
    const tracer =  new IntegralTracer({grid: gridLeft, sliders: sliders, targets:targets})
    const backButton = new Button({originX:50, originY: 50, width:100, height: 100, 
        onclick: ()=>Scene.loadScene(gameState,"linearPlanet"), label:"↑"})
        
    gameState.objects = [gridLeft, gridRight, tracer, backButton].concat(sliders).concat(targets)
    gameState.update = () => {
        if (tracer.solved){
            gameState.stored.completedScenes[gameState.stored.sceneName] = 'complete'
        }
    }
    unlockScenes(nextScenes, gss)
}

/**
 * A 4x4 discrete level with given targets.
 * 
 * @param {*} gameState 
 * @param {*} targetVals The y-values of the targets
 * @param {*} tracerStart y-intercept where the tracer starts from
 * @param {number} targetSize The size of the targets and sliders
 */
export function simpleDiscLevel(gameState, {
    targetVals, tracerStart = 0,
    targetSize = 20, sliderSize = 15,
    exitTo = 'linearPlanet',
    nextScenes
}) {
    const gss = gameState.stored
    const backButton = new Button({originX:50, originY: 50, width:100, height: 100, onclick: ()=>Scene.loadScene(gameState,exitTo), label:"↑"})
    const gridLeft = new Grid({canvasX:300, canvasY:250, canvasWidth:400, canvasHeight:400, 
        gridXMin:-2, gridYMin:-2, gridXMax:2, gridYMax:2, labels:false, arrows:true})
    const gridRight = new Grid({canvasX:900, canvasY:250, canvasWidth:400, canvasHeight:400, 
        gridXMin:-2, gridYMin:-2, gridXMax:2, gridYMax:2, labels:false, arrows:true})
    const spacing = gridLeft.gridWidth/targetVals.length
    var sliders = []
    for (let i = gridRight.gridXMin; i < gridRight.gridXMax; i+=spacing) {
        sliders.push(new Slider({grid:gridRight, gridPos:i,increment:0.1,circleRadius:sliderSize}))
    }
    var targets = []
    for (let i = 0; i < targetVals.length; i++) {
        targets.push(new Target({grid: gridLeft, gridX:gridLeft.gridXMin+(i+1)*spacing, gridY:targetVals[i], size:targetSize}))
    }
    const tracer = new IntegralTracer({grid: gridLeft, sliders: sliders, targets:targets, gridY:tracerStart})
    const objs = [gridLeft, gridRight, tracer, backButton].concat(targets).concat(sliders)
    gameState.objects = objs
    gameState.update = () => {
        if (tracer.solved){
            gameState.stored.completedScenes[gameState.stored.sceneName] = 'complete'
        }
    }
    unlockScenes(nextScenes, gss)
}

const dialogue1 = [
    "⯘Ⳃⱙⰺⳡ ⰺⳝ⯨⯃⯎ ⱤⳆⰸ⯃ ⳙ⯹ⱡ ⯷ⳞⳤⱭⰶ ...",
    "ⳏⳐⰷ⯁Ⱨⰴ ⯢ⱋⳒⰳⳙ ⯚⯜⯍ ⳙⰿⱆ ⳨⯟ⳑ⳪⳰ ⰴⱢⳈⳡ ⱍ⳧Ⳑⰿ ⰽⳮⳃ Ⳙⰻⰾⰸ. ...",
    "ⳟ⯔ ⳓ⯥ⱄⰳ ⳉⳂⳙ⯎ ⱤⳆⰸ⯃ Ɀⰳⱅⰸⳝ ⯢ⳔⳂⳚ ⱇⱏⰴⳂ ⰳⳤⱑ⯅ⰴ!"
]

export function linearDialogueScene(gameState, {nextScenes, exitTo}){
    const gss = gameState.stored
    const exitButton = new Button( {originX:50, originY:50, width:50, height:50, 
        onclick: () => Scene.loadScene(gameState, exitTo), label:"↑"} )

    const dialogueBox = new DialogueBox({
        portraitId:'glorpPortrait', 
        text: dialogue1,
        onComplete: function(){
            gss.completedScenes[gameState.stored.sceneName] = 'complete'
            Scene.loadScene(gameState, exitTo)
        }
    })
    
    gameState.objects = [
        new ImageObject(0, 0, Scene.CANVAS_WIDTH, Scene.CANVAS_HEIGHT, "linearPlanetBg"),
        new ImageObject(0, 0, Scene.CANVAS_WIDTH, Scene.CANVAS_HEIGHT, "linearPlanetFg"),
        dialogueBox,
        exitButton
    ]
    unlockScenes(nextScenes, gss)
}