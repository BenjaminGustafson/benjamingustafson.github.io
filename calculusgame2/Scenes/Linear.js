import {Color, Shapes} from '../util/index.js'
import {TileMap, Grid, FunctionTracer, Button, ImageObject, IntegralTracer, MathBlock, MathBlockManager, MathBlockField, Slider, Target, TargetAdder, TextBox, DialogueBox} from '../GameObjects/index.js'
import * as Scene from '../Scene.js'
import { GameObject } from '../GameObjects/GameObject.js'
import { unlockScenes, planetScene, dialogueScene } from './Planet.js'
import * as Experiment from './Experiment.js'
import * as Planet from './Planet.js'

const tileMap = new TileMap({yTileOffset:-8, xImgOffset:-140, yImgOffset:192})

// [x,y,  dx,dy] where dx dy is the direction to face when stopped at node
// SW 0,1 NW -1,0 NE 0,-1 SE 1,0
const nodes = {
    'planetMap':         [8,9,  0,1],
    'linear.puzzle.1':   [8,7,  0,-1],
    'linear.puzzle.2':   [10,5, -1,0],
    'linear.puzzle.3':   [10,4, 0,-1],
    'linear.puzzle.4':   [12,4, 0,-1],
    'linear.dialogue.1': [13,4, 0,-1],
    'linear.puzzle.5':   [14,2, -1,0],
    'linear.puzzle.6':   [13,0, 0,-1],
    'linear.puzzle.7':   [11,0, 0,-1],
    'linear.puzzle.8':   [9,-1, -1,0],
    'linear.dialogue.2': [9,-2, -1,0],
    'linear.puzzle.9':   [3,-5, 0,-1],
    'linear.puzzle.10':  [2,-5,  0,-1],
    'linear.dialogue.3': [1,-4, -1,0],
    'linear.puzzle.11':  [0,-3, -1,0],
    'linear.puzzle.12':  [0,-1, -1,0],
    'linear.dialogue.4': [-1,0, -1,0],
    'linear.lab':        [-2,1, -1,0],
}

const alienDialogue = [
    "⯘Ⳃⱙⰺⳡ ⰺⳝ⯨⯃⯎ ⱤⳆⰸ⯃ ⳙ⯹ⱡ ⯷ⳞⳤⱭⰶ.",
    "ⳏⳐⰷ⯁Ⱨⰴ ⯢ⱋⳒⰳⳙ ⯚⯜⯍ ⳙⰿⱆ ⳨⯟ⳑ⳪⳰ ⰴⱢⳈⳡ ⱍ⳧Ⳑⰿ.",
    "ⳟ⯔ ⳓ⯥ⱄⰳ ⳉⳂⳙ⯎ ⱤⳆⰸ⯃ Ɀⰳⱅⰸⳝ ⯢ⳔⳂⳚ ⱇⱏⰴⳂ ⰳⳤⱑ⯅ⰴ!"
]


const paths = 
[
    {start: 'planetMap', end: 'linear.puzzle.1'},
    {start: 'linear.puzzle.1', end: 'linear.puzzle.2', steps: [[10,7]] },
    {start: 'linear.puzzle.2', end: 'linear.puzzle.3', steps: [] },
    {start: 'linear.puzzle.3', end: 'linear.puzzle.4', steps: [] },
    {start: 'linear.puzzle.4', end:  'linear.dialogue.1', steps: [] },
    {start: 'linear.dialogue.1', end:  'linear.puzzle.5', steps: [[14,4]] },
    {start: 'linear.puzzle.5', end: 'linear.puzzle.6', steps: [[14,0]] },
    {start: 'linear.puzzle.6', end: 'linear.puzzle.7', steps: [] },
    {start: 'linear.puzzle.7', end: 'linear.puzzle.8', steps: [[9,0]] },
    {start: 'linear.puzzle.8', end: 'linear.dialogue.2', steps: []},
    {start: 'linear.dialogue.2', end:  'linear.puzzle.9', steps: [[9,-4], [3,-4]] },
    {start: 'linear.puzzle.9', end: 'linear.puzzle.10', steps: [] },
    {start: 'linear.puzzle.10', end: 'linear.dialogue.3', steps: [[2,-4],] },
    {start: 'linear.dialogue.3', end:  'linear.puzzle.11', steps: [[1,-3]] },
    {start: 'linear.puzzle.11', end: 'linear.puzzle.12', steps: [] },
    {start: 'linear.puzzle.12', end: 'linear.dialogue.4', steps: [[0,0]]},
    {start: 'linear.dialogue.4', end: 'linear.lab', steps: [[-1,1]]},
]


const experimentData =  {
    '1':{
        solutionFun: x=>0.5*x,
        solutionDdx:x=>0.5,
        solutionFunString:"0.5t",
        solutionDdxString:"0.5",
        syFunMax: 2, syFunLen: 4, tyFunMax: 10, tyFunLen: 10,
        syDdxMax: 2,
        syDdxLen: 4,
        tyDdxMax: 2,
        tyDdxLen: 4,
        numMeasurement:5,
        ddxSliderSpacing:2,
    },
    '2': {
        solutionFun: x=>5-0.5*x,
        solutionDdx: x=>-0.5,
        solutionFunString:"-0.5t + 5",
        solutionDdxString:"-0.5",
        syFunMax: 2, syFunLen: 4, tyFunMax: 10, tyFunLen: 10,
        syDdxMax: 2,
        syDdxLen: 4,
        tyDdxMax: 2,
        tyDdxLen: 4,
        numMeasurement:5,
        ddxSliderSpacing:2,
    },
    '3':{
        solutionFun: x=>1+1.5*x,
        solutionDdx: x=>1.5,
        solutionFunString:"1.5t + 1",
        solutionDdxString:"1.5",
        syFunMax: 2, syFunLen: 4, tyFunMax: 10, tyFunLen: 10,
        syDdxMax: 2,
        syDdxLen: 4,
        tyDdxMax: 2,
        tyDdxLen: 4,
        numMeasurement:4,
        ddxSliderSpacing:2,
    },
    '4':{
        solutionFun: x=>2*x,
        solutionDdx: x=>2,
        solutionFunString:"2 t",
        solutionDdxString:"2",
        syFunMax: 2, syFunLen: 4, tyFunMax: 10, tyFunLen: 10,
        syDdxMax: 2,
        syDdxLen: 4,
        tyDdxMax: 2,
        tyDdxLen: 4,
        numMeasurement:5,
        ddxSliderSpacing:1,
    },
    '5':{
        solutionFun: x=>10-x,
        solutionDdx: x=>-1,
        solutionFunString:"-1t + 10",
        solutionDdxString:"-1",
        syFunMax: 2, syFunLen: 4, tyFunMax: 10, tyFunLen: 10,
        syDdxMax: 2,
        syDdxLen: 4,
        tyDdxMax: 2,
        tyDdxLen: 4,
        numMeasurement:5,
        ddxSliderSpacing:2,
    }
}

export function loadScene(gameState, sceneName, message = {}){
    gameState.stored.planet = 'linear'

    const sceneNameSplit = sceneName.toLowerCase().split('.')

    // Main scene
    if (sceneNameSplit.length == 1) {
        linearPlanet(gameState, message)
        return
    }

    // Sub-scenes
    switch(sceneNameSplit[1]){
        case "puzzle": 
            switch(sceneNameSplit[2]){
                case '1':
                    linearPuzzle1(gameState, {nextScenes:["linear.puzzle.2"]})
                    break
                case '2':
                    linearPuzzle2(gameState,  {nextScenes:["linear.puzzle.3"]})
                    break
                case '3':
                    simpleDiscLevel(gameState, {targetVals:[0, 1, 1, 2],  nextScenes:["linear.puzzle.4"]})
                    break
                case '4':
                    simpleDiscLevel(gameState, {targetVals:[1, 0, -1, 0], nextScenes:["linear.dialogue.1"]})
                    break
                case '5':
                    simpleDiscLevel(gameState, {targetVals:[0.5, 1, 0.5, 1.5], nextScenes:["linear.puzzle.6"]})
                    break
                case '6':
                    simpleDiscLevel(gameState, {targetVals:[2, 1.5, -0.5, -2], nextScenes:["linear.puzzle.7"]})
                    break
                case '7':
                    simpleDiscLevel(gameState, {targetVals:[1, 0.5, -0.1, -0.8, -0.4, 0.6, 0.2, 0.4], nextScenes:["linear.puzzle.8"]})
                    break
                case '8':
                    simpleDiscLevel(gameState, {targetVals:[0.25, 0.5, 0.75, 1, 1.25, 1, 0.75, 0.5,
                        0.25, 0, 0.5, 1, 0.5, 0, 0.5, 1],  targetSize:15,  sliderSize:12, nextScenes:["linear.dialogue.2"]})
                    break
                case '9':
                    mathBlockTutorials(gameState, {targetVals:[1,1,1,1,1,1,1,1], nextScenes:["linear.puzzle.10"]})
                    break
                case '10':
                    mathBlockTutorials(gameState, {targetVals:[-1.5,-1.5,-1.5,-1.5,-1.5,-1.5,-1.5,-1.5], nextScenes:["linear.dialogue.3"]})
                    break
                case '11':
                    mathBlockTutorials(gameState, {targetVals:[1.5,1,0.5,0,-0.5,-1,-1.5,-2], withLinear:true, nextScenes:["linear.puzzle.12"]})
                    break
                case '12':
                    mathBlockTutorials(gameState, {targetVals:[0.25,0.5,0.75,1,1.25,1.5,1.75,2], withLinear:true, nextScenes:["linear.dialogue.4"]})
                    break
            }
        break

        case 'dialogue':
            linearPlanet(gameState)
            switch(sceneNameSplit[2]){
                case '1':
                    dialogueScene(gameState, {nextScenes:["linear.puzzle.5"], text: [
                        'Hi there.',    
                        'I\'m trying to figure out how these computers work.', 
                        'It seems like value of graph on the right becomes the slope of the graph on the left.',
                        'Or something like that.',
                    ]})
                break
                case '2':
                    dialogueScene(gameState, {exitTo:"linear", nextScenes:["linear.puzzle.9"], text: [
                        'These next puzzles are a little different.',
                        'You\'ll need one of these...',
                    ],
                    onComplete:(gameState)=>{
                        Planet.unlockPopup(gameState, {itemImage:'constantBlock', topText: 'You got a Number Block!', bottomText:''})
                    }})
                break
                case '3':
                    dialogueScene(gameState, {exitTo:"linear", nextScenes:["linear.puzzle.11"], text: [
                        'That building up ahead is the lab.',
                        'You\'ll need to go in there if you want to travel to the next planet.',
                        'But first, take this...'
                    ],
                    onComplete:(gameState)=>{
                        Planet.unlockPopup(gameState, {itemImage:'linearBlock', topText: 'You got a Variable Block!', bottomText:''})
                    }})
                break
                case '4':
                    dialogueScene(gameState, {exitTo:"linear", nextScenes:["linear.lab"], text: [  
                        'You should go into the lab and run a few trials.',
                        'When you think you\'ve found a pattern you can guess the rule.',
                    ]})
                break
            }
            break

        case "lab":
            Experiment.experimentMenu(gameState, {experimentData: experimentData, ruleFunString:'ax+b', ruleDdxString:'a'})
            break
        
        case "trial":
            if (sceneNameSplit[2] == 'rule') {
                const targetBlock = new MathBlock({type: MathBlock.BIN_OP, token:"+", originX: 200, originY: 200})
                const multBlock = new MathBlock({type: MathBlock.BIN_OP, token:"*"})
                multBlock.setChild(0, new MathBlock({type: MathBlock.VARIABLE, token:"a"})) 
                multBlock.setChild(1, new MathBlock({type: MathBlock.VARIABLE, token:"x"})) 
                targetBlock.setChild(0, multBlock) 
                targetBlock.setChild(1, new MathBlock({type: MathBlock.VARIABLE, token:"b"}))
                const blocks = [
                    new MathBlock({type:MathBlock.CONSTANT}),
                    new MathBlock({type:MathBlock.VARIABLE, token:"a"}),
                    new MathBlock({type:MathBlock.VARIABLE, token:"b"}),
                    new MathBlock({type:MathBlock.VARIABLE, token:"x"}),
                ]
                Experiment.ruleGuess(gameState, {planetUnlock:'quadratic', targetBlock:targetBlock, blocks: blocks,
                    correctDdx:(x,a,b) => a,
                })
            } else {
                Experiment.experimentTrial(gameState, experimentData[sceneNameSplit[2]])
            } 
            break
    }
}

function linearPlanet(gameState, message = {}){
    planetScene(gameState, {
        planetName:'linear',
        shipX:50, shipY: 450,
        labX: 70, labY:-150,
        tileMap:tileMap,
        playerNodes:nodes,
        playerPaths:paths,
        bgImg: 'linearPlanetBg',
        fgImg: 'linearPlanetFg',
        message
    })
}


// A 1x1 puzzle
function linearPuzzle1 (gameState, {nextScenes}){
    const gss = gameState.stored
    const gridLeft = new Grid({
        canvasX:560, canvasY:430, canvasWidth:100, canvasHeight:100, 
        gridXMin:0, gridYMin:0, gridXMax:1, gridYMax:1, labels:false, arrows:false
    })

    const gridRight = new Grid({canvasX:900, canvasY:430, canvasWidth:100, canvasHeight:100,
        gridXMin:0, gridYMin:0, gridXMax:1, gridYMax:1, labels:false, arrows:false
    })
    
    const slider = new Slider({grid:gridRight, gridPos:0, valueLabel:false})

    const target = new Target({grid: gridLeft, gridX:1, gridY:1, size:20})
    const tracer = new IntegralTracer({grid: gridLeft, input: {type:'sliders', sliders:[slider]}, targets:[target]})

    const backButton = Planet.backButton(gameState)
    const nextButton = Planet.nextButton(gameState, nextScenes)
    
    Planet.unlockScenes(nextScenes, gss)

    // Objects and update
    gameState.objects = [gridLeft, gridRight, slider, target, tracer, backButton, nextButton]
    Planet.winCon(gameState, ()=>tracer.solved, nextButton)
}

// A 2x2 puzzle
function linearPuzzle2 (gameState, {nextScenes}){
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
    const tracer =  new IntegralTracer({grid: gridLeft, input: {type:'sliders', sliders:sliders}, targets:targets})

    const backButton = Planet.backButton(gameState)
    const nextButton = Planet.nextButton(gameState, nextScenes)
        
    gameState.objects = [gridLeft, gridRight, tracer, backButton, nextButton].concat(sliders).concat(targets)
    Planet.winCon(gameState, ()=>tracer.solved, nextButton)
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
function simpleDiscLevel(gameState, {
    targetVals, tracerStart = 0,
    targetSize = 20, sliderSize = 15,
    exitTo = 'linear',
    nextScenes
}) {
    const gss = gameState.stored
    const backButton = Planet.backButton(gameState)
    const nextButton = Planet.nextButton(gameState, nextScenes)

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
    
    const tracer = new IntegralTracer({grid: gridLeft, input: {type:'sliders', sliders:sliders}, targets:targets, gridY:tracerStart})
    
    gameState.objects = [gridLeft, gridRight, tracer, backButton, nextButton].concat(targets).concat(sliders)
    Planet.winCon(gameState, ()=>tracer.solved, nextButton)
    unlockScenes(nextScenes, gss)
}



function mathBlockTutorials(gameState, {
    targetVals, tracerStart = 0,
    targetSize = 20, sliderSize = 15,
    nextScenes, withLinear = false,
}) {
    const gss = gameState.stored
    const backButton = Planet.backButton(gameState)
    const nextButton = Planet.nextButton(gameState, nextScenes)

    const grid = new Grid({canvasX:600, canvasY:350, canvasWidth:400, canvasHeight:400, 
        gridXMin:-2, gridYMin:-2, gridXMax:2, gridYMax:2, labels:false, arrows:true})

    const spacing = grid.gridWidth/targetVals.length

    var targets = []
    for (let i = 0; i < targetVals.length; i++) {
        targets.push(new Target({grid: grid, gridX:grid.gridXMin+(i+1)*spacing, gridY:targetVals[i], size:targetSize}))
    }
     
    const functionTracer = new FunctionTracer({grid: grid, targets: targets, solvable:true})

    const blocks = [
        new MathBlock({type:MathBlock.CONSTANT}),
    ]
    if (withLinear) blocks.push(new MathBlock({type: MathBlock.VARIABLE, token:'x'}))
    const sySlider = new Slider({canvasX: 1200, canvasY: 350, maxValue:2, sliderLength:4, startValue: 1, showAxis:true})
    const tySlider = new Slider({canvasX: withLinear ? 1300 : 1200, canvasY: 350, maxValue:2, sliderLength:4, showAxis:true})

    const mbField = new MathBlockField({minX:600, minY:100, maxX:1000, maxY:300})
    const mbm = new MathBlockManager({blocks : blocks, toolBarX: 1150, toolBarY:150, outputType:"sliders",
        scaleYSlider: sySlider, translateYSlider:tySlider,
        blockFields: [ mbField ],
        funTracers: [functionTracer],
    })

    if (!withLinear){
        sySlider.hidden = true
        mbm.scaleIcon.hidden = true
    }


    gameState.update = ()=>{
        functionTracer.solvable = !sySlider.grabbed && !tySlider.grabbed
    }

    gameState.objects = [grid, functionTracer, backButton, nextButton, mbm, sySlider, tySlider].concat(targets)
    Planet.winCon(gameState, ()=>functionTracer.solved, nextButton)
    unlockScenes(nextScenes, gss)
}

