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
    'power.puzzle.1': [6,1, 0,-1],
    'power.puzzle.2': [7,1, 0,-1],
    'power.puzzle.3': [8,1, 0,-1],
    'power.puzzle.4': [9,1, 0,-1],
    'power.puzzle.5': [10,1, 0,-1],
    'power.puzzle.6': [11,1, 0,-1],
    'power.puzzle.7': [12,1, 0,-1],
    'power.puzzle.8': [13,1, 0,-1],
    'power.puzzle.9': [14,1, 0,-1],
    'power.puzzle.10':[15,1, 0,-1],
    'power.lab':      [16,1, 0,-1],
}

const paths = 
[
    {start: 'planetMap', end: 'power.puzzle.1'},
    {start: 'power.puzzle.1', end: 'power.puzzle.2', steps: [] },
    {start: 'power.puzzle.2', end: 'power.puzzle.3', steps: [] },
    {start: 'power.puzzle.3', end: 'power.puzzle.4', steps: [] },
    {start: 'power.puzzle.4', end:  'power.puzzle.5', steps: [] },
    {start: 'power.puzzle.5', end: 'power.puzzle.6', steps: [] },
    {start: 'power.puzzle.6', end: 'power.puzzle.7', steps: [] },
    {start: 'power.puzzle.7', end: 'power.puzzle.8', steps: [] },
    {start: 'power.puzzle.8', end: 'power.puzzle.9', steps: [] },
    {start: 'power.puzzle.9', end: 'power.puzzle.10', steps: [] },
    {start: 'power.puzzle.10', end: 'power.lab', steps: []},
]


const experimentData =  {
}


export function loadScene(gameState, sceneName, message = {}){
    gameState.stored.planet = 'power'

    const sceneNameSplit = sceneName.toLowerCase().split('.')

    // Main scene
    if (sceneNameSplit.length == 1) {
        powerPlanet(gameState, message)
        return
    }

    // Sub-scenes
    switch(sceneNameSplit[1]){
        case "puzzle": 
            switch(sceneNameSplit[2]){
                case '1':
                    powerLevel(gameState, {numSliders:4, sliderSize:15, gridYMin:-2, gridYMax:2,gridXMin:-2,gridXMax:2,tracerMiddleStart:-2,
                         nextScenes:["power.puzzle.2"]})
                    break
                case '2':
                    powerLevel(gameState, {numSliders:4, sliderSize:15, gridYMin:-2, gridYMax:2,gridXMin:-2,gridXMax:2,tracerMiddleStart:2,
                        targetFun: x => x*x*x/6, nextScenes:["power.puzzle.3"]})
                    break
                case '3':
                    powerLevel(gameState, {numSliders:8, sliderSize:15, gridYMin:-2, gridYMax:2,gridXMin:-2,gridXMax:2,tracerMiddleStart:2,
                        targetFun: x => x*x*x/6, nextScenes:["power.puzzle.4"]})
                    break
                case '4':
                    powerLevel(gameState, {numSliders:8, sliderSize:15, gridYMin:-12, gridYMax:12,gridXMin:-2,gridXMax:2,tracerMiddleStart:-8,
                        increment:0.2,
                        targetFun: x => x*x*x*x/4, nextScenes:["power.puzzle.5"]})
                    break

                case '5':
                    powerLevel(gameState, {numSliders:200, sliderSize:5, targetSize:15, gridYMin:-3, gridYMax:3,gridXMin:-2,gridXMax:2,tracerMiddleStart:-2,
                        increment:0.1,
                        targetFun: x => -x*x*x/6, nextScenes:["power.puzzle.6"],
                        withPowerBlock:false,
                    withMathBlock:true})
                    break
                case '6':
                    powerLevel(gameState, {numSliders:20, sliderSize:15, gridYMin:-10, gridYMax:10,gridXMin:-2,gridXMax:2,tracerMiddleStart:-16/3,
                        increment:0.2,
                        targetFun: x => x*x*x*x/6, nextScenes:["power.puzzle.7"],
                    withMathBlock:true})
                    break
                case '7':
                    powerLevel(gameState, {numSliders:20, sliderSize:15, gridYMin:-8, gridYMax:8,gridXMin:-2,gridXMax:2,tracerMiddleStart:16/3,
                        increment:0.2,
                        targetFun: x => -x*x*x*x/6, nextScenes:["power.puzzle.8"],
                    withMathBlock:true})
                    break

                
            }
        break

        case 'dialogue':
            powerPlanet(gameState)
            switch(sceneNameSplit[2]){
                case '1':
                    dialogueScene(gameState, {exitTo:"power", nextScenes:["power.puzzle.5"], text: [    
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

function powerPlanet(gameState,message){
    console.log('Quadratic function')
    Planet.planetScene(gameState, {
        planetName:'power',
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


function powerLevel (gameState, {
    numSliders,
    withMathBlock = false,
    tracerLeftStart,
    tracerMiddleStart=1,
    targetSize = 20, sliderSize = 15,
    nextScenes, 
    gridXMax=5,
    gridYMax=2,
    gridYMin=-2,
    gridXMin=-5,
    increment=0.1,
    oneSlider = false,
    nSliderMin=0,nSliderMax=5,nSliderIncrement=1,
    withPowerBlock = true,
    targetFun = x => x*x/2
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

    var targets = []

    for (let i = 0; i < numSliders; i++) {
        const x = gridLeft.gridXMin+(i+1)*spacing
        const y = targetFun(x)
        if (gridLeft.isInBoundsGridY(y))
            targets.push(new Target({grid: gridLeft, gridX:x, gridY:targetFun(x), size:targetSize}))
    }
    
    const tracerMiddle = new IntegralTracer({grid: gridMiddle, sliders: sliders, targets:targets, originGridY:tracerMiddleStart, 
        spacing: gridLeft.gridWidth / (numSliders)
    })
    if (tracerLeftStart == null){
        tracerLeftStart = targetFun(gridXMin)
    }
    const tracerLeft = new IntegralTracer({grid: gridLeft, inputTracer: tracerMiddle, targets:targets, originGridY:tracerLeftStart, 
    })
    
    
    const blocks = [
        new MathBlock({type:MathBlock.VARIABLE, token:"x"}),
    ]
    if (withPowerBlock) blocks.push(new MathBlock({type:MathBlock.POWER, token:'n'}))
    // for (let b of gss.mathBlocksUnlocked){
    //     blocks.push(new MathBlock({type: b.type, token: b.token}))
    // }

    gameState.objects = [gridLeft, gridMiddle, gridRight, tracerLeft,
        tracerMiddle, backButton, nextButton].concat(targets).concat(sliders)
    gameState.update = ()=> {
    }

    if (withMathBlock){

        sliders.forEach(s => s.clickable = false)

        const sySlider = new Slider({canvasX: 1400, canvasY: 350, maxValue:2, sliderLength:4, startValue: 1, showAxis:true})
        const tySlider = new Slider({canvasX: 1480, canvasY: 350, maxValue:2, sliderLength:4, showAxis:true})
        const nSlider = new Slider({canvasX: 1560, canvasY: 350, maxValue:nSliderMax, sliderLength:nSliderMax-nSliderMin,
             increment:nSliderIncrement, showAxis:true})
        const mbField = new MathBlockField({minX:950, minY:100, maxX:1350, maxY:300, outputSliders:sliders})
        if (oneSlider){
            sySlider.hidden = true
            tySlider.hidden = true
            nSlider.canvasX = 1450
        }
        const mbm = new MathBlockManager({blocks : blocks, toolBarX: 1400, toolBarY:150, outputType:"sliders",
            scaleYSlider: sySlider, translateYSlider:tySlider, numSlider:nSlider,
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

