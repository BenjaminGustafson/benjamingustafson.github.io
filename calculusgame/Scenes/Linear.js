import {Color, Shapes} from '../util/index.js'
import {TileMap, Grid, FunctionTracer, Button, ImageObject, IntegralTracer, MathBlock, MathBlockManager, MathBlockField, Slider, Target, TargetAdder, TextBox, DialogueBox} from '../GameObjects/index.js'
import * as Scene from '../Scene.js'
import { GameObject } from '../GameObjects/GameObject.js'
import { unlockScenes, planetScene, dialogueScene } from './Planet.js'
import * as Experiment from './Experiment.js'

const tileMap = new TileMap({yTileOffset:-8})

// [x,y,  dx,dy] where dx dy is the direction to face when stopped at node
// SW 0,1 NW -1,0 NE 0,-1 SE 1,0
const nodes = {
    'planetMap': [8,9,  0,1],
    'linear.puzzle.1': [8,7,  0,-1],
    'linear.puzzle.2': [11,4, 0,-1],
    'linear.puzzle.3': [14,2, 1,0],
    'linear.puzzle.4': [12,0, 0,-1],
    'linear.puzzle.5': [3,-5, -1,0],
    'linear.puzzle.6': [2,-7, 0,-1],
    'linear.puzzle.7': [0,-5, -1,0],
    'linear.puzzle.8': [0,-2, -1,0],
    'linear.lab': [-2,1, -1,0],
}

const paths = 
[
    {start: 'planetMap', end: 'linear.puzzle.1'},
    {start: 'linear.puzzle.1', end: 'linear.puzzle.2', steps: [[10,7],[10,4]] },
    {start: 'linear.puzzle.2', end: 'linear.puzzle.3', steps: [[14,4]] },
    {start: 'linear.puzzle.3', end: 'linear.puzzle.4', steps: [[14,0]] },
    {start: 'linear.puzzle.4', end:  'linear.puzzle.5', steps: [[9,0],[9,-4], [3,-4]] },
    {start: 'linear.puzzle.5', end: 'linear.puzzle.6', steps: [[3,-7]] },
    {start: 'linear.puzzle.6', end: 'linear.puzzle.7', steps: [[1,-7],[1,-6],[0,-6]] },
    {start: 'linear.puzzle.7', end: 'linear.puzzle.8', steps: [] },
    {start: 'linear.puzzle.8', end: 'linear.lab', steps: [[0,0],[-1,0],[-1,1]]},

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
        solutionDdx: x=>-0.5,
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

export function loadScene(gameState, sceneName){
    gameState.stored.planet = 'Linear'

    const sceneNameSplit = sceneName.toLowerCase().split('.')

    // Main scene
    if (sceneNameSplit.length == 1) {
        linearPlanet(gameState)
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
                        0.25, 0, 0.5, 1, 0.5, 0, 0.5, 1],  targetSize:15,  sliderSize:12, nextScenes:["linear.lab"]})
                    break
            }
        break

        case 'dialogue':
            linearPlanet(gameState)
            switch(sceneNameSplit[2]){
                case '1':
                    dialogueScene(gameState, {exitTo:"linear", nextScenes:["linear.puzzle.5"], text: [    
                        "⯘Ⳃⱙⰺⳡ ⰺⳝ⯨⯃⯎ ⱤⳆⰸ⯃ ⳙ⯹ⱡ ⯷ⳞⳤⱭⰶ.",
                        "ⳏⳐⰷ⯁Ⱨⰴ ⯢ⱋⳒⰳⳙ ⯚⯜⯍ ⳙⰿⱆ ⳨⯟ⳑ⳪⳰ ⰴⱢⳈⳡ ⱍ⳧Ⳑⰿ.",
                        "ⳟ⯔ ⳓ⯥ⱄⰳ ⳉⳂⳙ⯎ ⱤⳆⰸ⯃ Ɀⰳⱅⰸⳝ ⯢ⳔⳂⳚ ⱇⱏⰴⳂ ⰳⳤⱑ⯅ⰴ!"
                    ]})
                break
            }
            break

        case "lab":
            Experiment.experimentMenu(gameState, {experimentData: experimentData})
            break
        
        case "trial":
            if (sceneName[2] == 'rule') {
                Experiment.ruleGuess(gameState)
            } else {
                Experiment.experimentTrial(gameState, experimentData[sceneName[2]])
            } 
            break
    }
}

function linearPlanet(gameState){
    planetScene(gameState, {
        planetName:'linear',
        shipX:200, shipY: 600,
        labX: 180, labY:130,
        tileMap:tileMap,
        playerNodes:nodes,
        playerPaths:paths,
        bgImg: 'linearPlanetBg',
        fgImg: 'linearPlanetFg',
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
    
    const slider = new Slider({grid:gridRight, gridPos:0})

    const target = new Target({grid: gridLeft, gridX:1, gridY:1, size:20})
    const tracer = new IntegralTracer({grid: gridLeft, sliders: [slider], targets:[target]})
    const backButton = new Button({originX:50, originY: 50, width:100, height: 100,
        onclick: ()=>Scene.loadScene(gameState,"linear"), label:"↑"})
    
    unlockScenes(nextScenes, gss)
    // Objects and update
    gameState.objects = [gridLeft, gridRight, slider, target, tracer, backButton]
    gameState.update = () => {
        if (tracer.solved){
            gameState.stored.completedScenes[gameState.stored.sceneName] = 'complete'
        }
    }
    
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
    const tracer =  new IntegralTracer({grid: gridLeft, sliders: sliders, targets:targets})
    const backButton = new Button({originX:50, originY: 50, width:100, height: 100, 
        onclick: ()=>Scene.loadScene(gameState,"linear"), label:"↑"})
        
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
function simpleDiscLevel(gameState, {
    targetVals, tracerStart = 0,
    targetSize = 20, sliderSize = 15,
    exitTo = 'linear',
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

