import {Color, Shapes} from '../util/index.js'
import {TileMap, Grid, FunctionTracer, Button, ImageObject, IntegralTracer, MathBlock, MathBlockManager, MathBlockField, Slider, Target, TargetAdder, TextBox, DialogueBox, DrawFunction} from '../GameObjects/index.js'
import * as Scene from '../Scene.js'
import { GameObject } from '../GameObjects/GameObject.js'
import * as Planet from './Planet.js'
import * as Experiment from './Experiment.js'

const tileMap = new TileMap({yTileOffset:-3,xTileOffset:-7, xImgOffset:0, yImgOffset:0})

// [x,y,  dx,dy] where dx dy is the direction to face when stopped at node
// SW 0,1 NW -1,0 NE 0,-1 SE 1,0
const nodes = {
    'planetMap':            [5,1, 0,-1],
    'sine.puzzle.1': [6,1, 0,-1],
    'sine.puzzle.2': [7,1, 0,-1],
    'sine.puzzle.3': [8,1, 0,-1],
    'sine.puzzle.4': [9,1, 0,-1],
    'sine.puzzle.5': [10,1, 0,-1],
    'sine.puzzle.6': [11,1, 0,-1],
    'sine.puzzle.7': [12,1, 0,-1],
    'sine.puzzle.8': [13,1, 0,-1],
    'sine.puzzle.9': [14,1, 0,-1],
    'sine.puzzle.10':[15,1, 0,-1],
    'sine.lab':      [16,1, 0,-1],
}

const paths = 
[
    {start: 'planetMap', end: 'sine.puzzle.1'},
    {start: 'sine.puzzle.1', end: 'sine.puzzle.2', steps: [] },
    {start: 'sine.puzzle.2', end: 'sine.puzzle.3', steps: [] },
    {start: 'sine.puzzle.3', end: 'sine.puzzle.4', steps: [] },
    {start: 'sine.puzzle.4', end:  'sine.puzzle.5', steps: [] },
    {start: 'sine.puzzle.5', end: 'sine.puzzle.6', steps: [] },
    {start: 'sine.puzzle.6', end: 'sine.puzzle.7', steps: [] },
    {start: 'sine.puzzle.7', end: 'sine.puzzle.8', steps: [] },
    {start: 'sine.puzzle.8', end: 'sine.puzzle.9', steps: [] },
    {start: 'sine.puzzle.9', end: 'sine.puzzle.10', steps: [] },
    {start: 'sine.puzzle.10', end: 'sine.lab', steps: []},
]


export function loadScene(gameState, sceneName, message = {}){
    gameState.stored.planet = 'sine'

    const sceneNameSplit = sceneName.toLowerCase().split('.')

    // Main scene
    if (sceneNameSplit.length == 1) {
        sinePlanet(gameState, message)
        return
    }

    // Sub-scenes
    switch(sceneNameSplit[1]){
        case "puzzle": 
            switch(sceneNameSplit[2]){
                case '1':
                    sineLevel(gameState, {numSliders:4, sliderSize:15, gridYMin:-2, gridYMax:2,gridXMin:0,gridXMax:4,
                         nextScenes:["sine.puzzle.2"], tracerLeftStart:0, tracerMiddleStart:-1})
                    break
                case '2':
                    sineLevel(gameState, {numSliders:8, sliderSize:15, gridYMin:-2, gridYMax:2,gridXMin:0,gridXMax:4,
                            nextScenes:["sine.puzzle.3"]})
                    break
                case '3':
                    // Solution: sin(x)
                    sineLevel(gameState, {numSliders:40, sliderSize:10, gridYMin:-2, gridYMax:2,gridXMin:0,gridXMax:4,
                            nextScenes:["sine.puzzle.4"], withMathBlock:true, tracerLeftStart:0, tracerMiddleStart:-1})
                    break
                case '4':
                    // Solution: -sin(x)
                    sineLevel(gameState, {numSliders:100, sliderSize:5, targetSize:10, gridYMin:-2, gridYMax:2,gridXMin:0,gridXMax:6,
                            nextScenes:["sine.puzzle.7"], withMathBlock:true, increment:0.05, tracerLeftStart:0, tracerMiddleStart:1})
                    break
                case '5':
                    // Too hard
                    sineLevel(gameState, {numSliders:100, sliderSize:5, targetSize:10, gridYMin:-2, gridYMax:2,gridXMin:0,gridXMax:6,
                            nextScenes:["sine.puzzle.6"], withMathBlock:true, increment:0.05, tracerLeftStart:1, tracerMiddleStart:0})
                    break
                case '7':
                    sineLevel(gameState, {numSliders:200, sliderSize:5, targetSize:12, gridYMin:-3, gridYMax:3,gridXMin:0,gridXMax:6,
                            nextScenes:["sine.puzzle.8"], withMathBlock:true, increment:0.05, tracerLeftStart:0, tracerMiddleStart:-2})
                    break
                case '8':
                    sineLevel(gameState, {numSliders:100, sliderSize:5, targetSize:12, gridYMin:-2, gridYMax:2,gridXMin:0,gridXMax:6,
                            nextScenes:["sine.puzzle.9"], withMathBlock:true, increment:0.05, tracerLeftStart:0, tracerMiddleStart:-0.5})
                    break
                case '9':
                    // I can't solve my own puzzle! Maybe I just put those starting numbers in by accident
                    sineLevel(gameState, {numSliders:100, sliderSize:5, targetSize:12, gridYMin:-2, gridYMax:2,gridXMin:0,gridXMax:6,
                            nextScenes:["sine.puzzle.10"], withMathBlock:true, increment:0.05, tracerLeftStart:1, tracerMiddleStart:-1})
                    break
            }
        break

        case 'dialogue':
            sinePlanet(gameState)
            switch(sceneNameSplit[2]){
                case '1':
                    dialogueScene(gameState, {exitTo:"sine", nextScenes:["sine.puzzle.5"], text: [    
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
            if (sceneNameSplit[2] == 'rule') {
                Experiment.ruleGuess(gameState, {})
            } else {
                Experiment.experimentTrial(gameState, experimentData[sceneNameSplit[2]])
            } 
            break
    }
}

function sinePlanet(gameState,message){
    console.log('Quadratic function')
    Planet.planetScene(gameState, {
        planetName:'sine',
        shipX:20, shipY: 450,
        labX: 1150, labY:-150, labDir:'SW',
        tileMap:tileMap,
        playerNodes:nodes,
        playerPaths:paths,
        bgImg: 'placeholderBg',
        fgImg: 'placeholderFg',
        message,
        
    })
}


function sineLevel (gameState, {
    numSliders,
    withMathBlock = false,
    tracerLeftStart=0,
    tracerMiddleStart=1,
    targetSize = 20, sliderSize = 15,
    nextScenes, 
    gridXMax=5,
    gridYMax=2,
    gridYMin=-2,
    gridXMin=-5,
    increment=0.1,
    firstTarget,
    oneSlider = false,
    nSliderMin=0,nSliderMax=5,nSliderIncrement=0.1,
}){
    const gss = gameState.stored
    const backButton = Planet.backButton(gameState)
    const nextButton = Planet.nextButton(gameState, nextScenes)

    const gridLeft = new Grid({canvasX:50, canvasY:350, canvasWidth:400, canvasHeight:400, 
        gridXMin:gridXMin, gridYMin:gridYMin, gridXMax:gridXMax, gridYMax:gridYMax, labels:true, arrows:false, autoCellSize: true})
    const gridMiddle = new Grid({canvasX: 500, canvasY:350, canvasWidth:400, canvasHeight:400, 
        gridXMin:gridXMin, gridYMin:gridYMin, gridXMax:gridXMax, gridYMax:gridYMax, labels:true, arrows:false, autoCellSize: true})
    const gridRight = new Grid({canvasX:950, canvasY:350, canvasWidth:400, canvasHeight:400, 
        gridXMin:gridXMin, gridYMin:gridYMin, gridXMax:gridXMax, gridYMax:gridYMax, labels:true, arrows:false, autoCellSize: true})
    
    const spacing = gridLeft.gridWidth/numSliders
    var sliders = []
    for (let i = 0; i < numSliders; i++){
        sliders.push(new Slider({grid:gridRight, gridPos:gridRight.gridXMin + i * spacing,
            increment: increment,circleRadius:sliderSize}))
    }
    
    // var targets = []
    // for (let i = 0; i < numSliders; i++) {
    //     const x = gridLeft.gridXMin+(i+1)*spacing
    //     targets.push(new Target({grid: gridLeft, gridX:x, gridY:func(x), size:targetSize}))
    // }

    var targets = []
    if (firstTarget != null)
        targets.push(new Target({grid: gridLeft, gridX:gridLeft.gridXMin, gridY:firstTarget, size:targetSize}))
    
    for (let i = 0; i < numSliders; i++) {
        const x = gridLeft.gridXMin+(i)*spacing
        targets.push(new Target({grid: gridLeft, gridX:x, gridY:0, size:targetSize}))
    }
    
    const tracerMiddle = new IntegralTracer({grid: gridMiddle, input:{type:'sliders', sliders: sliders}, targets:targets, originGridY:tracerMiddleStart, 
        spacing: gridLeft.gridWidth / (numSliders)
    })
    const tracerLeft = new IntegralTracer({grid: gridLeft, input:{type:'tracer', tracer: tracerMiddle}, targets:targets, originGridY:tracerLeftStart, 
    })
    
    
    const blocks = [
        new MathBlock({type:MathBlock.VARIABLE, token:"x"}),
        new MathBlock({type:MathBlock.FUNCTION, token:'sin'}),
    ]
    // for (let b of gss.mathBlocksUnlocked){
    //     blocks.push(new MathBlock({type: b.type, token: b.token}))
    // }

    gameState.objects = [gridLeft, gridMiddle, gridRight, tracerLeft,
        tracerMiddle, backButton, nextButton].concat(targets).concat(sliders)
    gameState.update = ()=> {
        for (let i = 0; i < numSliders; i++) {
            targets[i].setGridYPosition(-sliders[i].value)
        }
    }

    if (withMathBlock){

        sliders.forEach(s => s.clickable = false)

        const sySlider = new Slider({canvasX: 1420, canvasY: 350, maxValue:2, sliderLength:4, startValue: 1, showAxis:true})
        const tySlider = new Slider({canvasX: 1520, canvasY: 350, maxValue:2, sliderLength:4, showAxis:true})
        const nSlider = new Slider({canvasX: 1550, canvasY: 350, maxValue:nSliderMax, sliderLength:nSliderMax-nSliderMin,
             increment:nSliderIncrement, showAxis:true})
        nSlider.hidden = true
        const mbField = new MathBlockField({minX:950, minY:100, maxX:1350, maxY:300, outputSliders:sliders})
        if (oneSlider){
            sySlider.hidden = true
            tySlider.hidden = true
            nSlider.canvasX = 1450
        }
        const mbm = new MathBlockManager({blocks : blocks, toolBarX: 1400, toolBarY:150, outputType:"sliders",
            scaleYSlider: sySlider, translateYSlider:tySlider,
            blockFields: [ mbField ],

        })
        gameState.objects = gameState.objects.concat([mbm, sySlider, tySlider, nSlider])
        
        const update = gameState.update
        gameState.update = ()=>{
            update()
            if (mbField.rootBlock != null){
                const fun = mbField.rootBlock.toFunction()
                if (fun != null){
                    for (let i = 0; i < numSliders; i++){
                        sliders[i].moveToValue(fun(sliders[i].gridPos))
                        //sliders[i].setValue(fun(sliders[i].gridPos))
                    }
                }
            }
        }
    }

    Planet.winCon(gameState, ()=>tracerLeft.solved, nextButton)
    Planet.unlockScenes(nextScenes, gss)
}

function pendulumLevel(gameState, {

}){

}

class Pendulum extends GameObject{
    constructor({
        
    }){
        super()
    }

    update(ctx, audio, mouse){

    }
}

