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
    'sum.puzzle.1': [6,1, 0,-1],
    'sum.puzzle.2': [7,1, 0,-1],
    'sum.puzzle.3': [8,1, 0,-1],
    'sum.puzzle.4': [9,1, 0,-1],
    'sum.dialogue.1':[9,3, 0,1],
    'sum.puzzle.5': [10,1, 0,-1],
    'sum.puzzle.6': [11,1, 0,-1],
    'sum.puzzle.7': [12,1, 0,-1],
    'sum.puzzle.8': [13,1, 0,-1],
    'sum.puzzle.9': [14,1, 0,-1],
    'sum.puzzle.10':[15,1, 0,-1],
    'sum.lab':      [16,1, 0,-1],
}

const paths = 
[
    {start: 'planetMap', end: 'sum.puzzle.1'},
    {start: 'sum.puzzle.1', end: 'sum.puzzle.2', steps: [] },
    {start: 'sum.puzzle.2', end: 'sum.puzzle.3', steps: [] },
    {start: 'sum.puzzle.3', end: 'sum.puzzle.4', steps: [] },
    {start: 'sum.puzzle.4', end:  'sum.puzzle.5', steps: [] },
    {start: 'sum.puzzle.4', end:  'sum.dialogue.1', steps: [] },
    {start: 'sum.puzzle.5', end: 'sum.puzzle.6', steps: [] },
    {start: 'sum.puzzle.6', end: 'sum.puzzle.7', steps: [] },
    {start: 'sum.puzzle.7', end: 'sum.puzzle.8', steps: [] },
    {start: 'sum.puzzle.8', end: 'sum.puzzle.9', steps: [] },
    {start: 'sum.puzzle.9', end: 'sum.puzzle.10', steps: [] },
    {start: 'sum.puzzle.10', end: 'sum.lab', steps: []},
]


const experimentData =  {
}


export function loadScene(gameState, sceneName, message = {}){
    gameState.stored.planet = 'sum'

    const sceneNameSplit = sceneName.toLowerCase().split('.')

    // Main scene
    if (sceneNameSplit.length == 1) {
        sumPlanet(gameState, message)
        return
    }

    // Sub-scenes
    switch(sceneNameSplit[1]){
        case "puzzle": 
            switch(sceneNameSplit[2]){
                // case '1':
                //     sumSliderLevel(gameState, {numSliders:4, sliderSize:15, gridYMin:-2, gridYMax:2,gridXMin:-2,gridXMax:2,
                //         sumTargetValues: [1,1,1,1], f1TargetValues : [-1,-0.5,0,0.5],
                //         f1TracerStart:-1.5, sumTracerStart:1,
                //          nextScenes:["sum.puzzle.2"]})
                //     break
                case '1':
                    sumSliderLevel(gameState, {numSliders:1, sliderSize:15, gridYMin:-2, gridYMax:2,gridXMin:0,gridXMax:1,
                        sumTargetValues: [1], f1TargetValues : [-0.5],
                        f1TracerStart:-1, sumTracerStart:0, f2TracerStart:1,
                            nextScenes:["sum.puzzle.2"]})
                    break

                case '2':
                    sumSliderLevel(gameState, {numSliders:4, sliderSize:15, gridYMin:-2, gridYMax:2,gridXMin:-2,gridXMax:2,
                        sumTargetValues: [0,0,0,0], f1TargetValues : [-2,-1,-2,-1],
                        f1TracerStart:-1, sumTracerStart:0,f2TracerStart:1,
                            nextScenes:["sum.puzzle.3"]})
                    break
                case '3':
                    sumSliderLevel(gameState, {numSliders:4, sliderSize:15, gridYMin:-2, gridYMax:2,gridXMin:-2,gridXMax:2,
                        sumTargetValues: [0.5,1,1.5,2], f1TargetValues : [-0.2,-0.4,-0.6,-0.8],
                        f1TracerStart:0, sumTracerStart:0,f2TracerStart:0,
                            nextScenes:["sum.puzzle.4"]})
                    break
                case '4':
                    sumSliderLevel(gameState, {numSliders:4, sliderSize:15, gridYMin:-2, gridYMax:2,gridXMin:-2,gridXMax:2,
                        sumTargetValues: [0.5,1,0.5,0], f1TargetValues : [-0.5,-1,-0.5,-1],
                        f1TracerStart:0, sumTracerStart:0,f2TracerStart:0,
                            nextScenes:["sum.puzzle.5", 'sum.dialogue.1']})
                    break
                case '5':
                    sumMathBlockLevel(gameState, {numSliders:4, sliderSize:15, gridYMin:-10, gridYMax:10,gridXMin:-10,gridXMax:10,
                        sumTargetValues: [0.5,1,0.5,0], f1TargetValues : [-0.5,-1,-0.5,-1],
                        f1TracerStart:0, sumTracerStart:0,f2TracerStart:0,
                            nextScenes:["sum.puzzle.6"]})
                    break
            }
        break

        case 'dialogue':
            sumPlanet(gameState)
            case '1':
                Planet.dialogueScene(gameState, {nextScenes:["linear.puzzle.5"], text: [
                    'The red line is the sum of the green and white lines.',
                    'The slope of red is the slope of green plus the slope of white.'
                ]})
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

function sumPlanet(gameState,message){
    Planet.planetScene(gameState, {
        planetName:'sum',
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



function sumMathBlockLevel (gameState, {
    numTargets = 100,
    targetSize = 10,
    f2TracerStart=0,
    sumTracerStart=0,
    f1TracerStart=0,
    gridXMax=2,
    gridYMax=2,
    gridYMin=-2,
    gridXMin=-2,
    targetSumFun = (x) => 0,
    targetPartFun = (x) => x+10,
    nextScenes, 
}){
    const gss = gameState.stored
    const backButton = Planet.backButton(gameState)
    const nextButton = Planet.nextButton(gameState, nextScenes)

    // Grids
    const gridLeft = new Grid({canvasX:50, canvasY:350, canvasWidth:400, canvasHeight:400, 
        gridXMin:gridXMin, gridYMin:gridYMin, gridXMax:gridXMax, gridYMax:gridYMax, labels:true, arrows:false, autoCellSize: true})
    const gridRight = new Grid({canvasX:600, canvasY:350, canvasWidth:400, canvasHeight:400, 
        gridXMin:gridXMin, gridYMin:gridYMin, gridXMax:gridXMax, gridYMax:gridYMax, labels:true, arrows:false, autoCellSize: true})
    
    // Function tracers
    const greenFunTracer = new FunctionTracer({grid: gridRight, color:Color.green, lineWidth:7})
    const whiteFunTracer = new FunctionTracer({grid: gridRight, color:Color.yellow, lineWidth:7})
    const redFunTracer = new FunctionTracer({grid: gridRight, color:Color.red, lineWidth:7})
    
    // Targets
    var sumTargets = []
    var f1Targets = []
    const spacing = gridLeft.gridWidth/numTargets
    for (let i = 0; i < numTargets; i++) {
        const x = gridLeft.gridXMin+(i+1)*spacing
        const y1 = targetPartFun(x)
        if (gridLeft.isInBoundsGridY(y1))
            f1Targets.push(new Target({grid: gridLeft, gridX:x, gridY:y1, size:targetSize,unhitColor:Color.yellow}))
        const y2 = targetSumFun(x)
        if (gridLeft.isInBoundsGridY(y2))
            sumTargets.push(new Target({grid: gridLeft, gridX:x, gridY:y2, size:targetSize}))
    }

    // Mathblocks
    const blocks = [
        new MathBlock({type:MathBlock.VARIABLE, token:"x"}),
        new MathBlock({type:MathBlock.CONSTANT, token:'0.0'}),
        new MathBlock({type:MathBlock.POWER, token:'2'}),
        new MathBlock({type:MathBlock.EXPONENT, token:'e'}),
        new MathBlock({type:MathBlock.FUNCTION, token:'sin'}),
    ]
    const sySlider = new Slider({canvasX: 1100, canvasY: 350, maxValue:2, sliderLength:4, startValue: 1, showAxis:true})
    const tySlider = new Slider({canvasX: 1200, canvasY: 350, maxValue:2, sliderLength:4, showAxis:true})
    const nSlider = new Slider({canvasX: 1300, canvasY: 350, maxValue:3, sliderLength:3, increment:1, showAxis:true})
    const mbFieldLeft = new MathBlockField({minX:600, minY:100, maxX:950, maxY:300})
    const mbFieldRight = new MathBlockField({minX:1000, minY:100, maxX:1350, maxY:300})

    const mbm = new MathBlockManager({blocks : blocks, toolBarX: 1400, toolBarY:150, outputType:"sliders",
        scaleYSlider: sySlider, translateYSlider:tySlider, numSlider:nSlider,
        blockFields: [ mbFieldLeft, mbFieldRight ],
    })

    // Tracers
    const sumTracer = new IntegralTracer({grid: gridLeft, 
        input:{
            inputFunction: (x) => {
                return redFunTracer.fun(x)
            }, 
            resetCondition:()=>{
                return sySlider.grabbed || tySlider.grabbed || nSlider.grabbed || (mbm.grabbed != null)
            }
        ,autoStart:true},

        targets:sumTargets, originGridY:sumTracerStart
    })
    const f2Tracer = new IntegralTracer({grid: gridLeft, 
        input:{
            inputFunction: (x) => {
                return whiteFunTracer.fun(x)
            }, 
            resetCondition:()=>{
                return sySlider.grabbed || tySlider.grabbed || nSlider.grabbed || (mbm.grabbed != null)
            }
        ,autoStart:true},
        originGridY:f2TracerStart, 
        unsolvedColor:Color.white,
    })
    const f1Tracer = new IntegralTracer({grid: gridLeft, 
        input:{
            inputFunction: (x) => {
                return greenFunTracer.fun(x)
            }, 
            resetCondition:()=>{
                return sySlider.grabbed || tySlider.grabbed || nSlider.grabbed || (mbm.grabbed != null)
            }
        ,autoStart:true},
        targets:f1Targets, originGridY:f1TracerStart,
        unsolvedColor:Color.green, audioChannel:0,
    })
    f1Tracer.autoStart = true
    
    const plusText = new TextBox({originX:975,originY:200, content:'+', font:'40px monospace', baseline:'middle', align:'center'})

    gameState.objects = [gridLeft, gridRight, f1Tracer, f2Tracer, sumTracer, greenFunTracer, whiteFunTracer, redFunTracer,
        ...f1Targets, ...sumTargets, backButton, nextButton, sySlider, tySlider, nSlider, plusText, mbm]


    gameState.update = ()=> {
        redFunTracer.fun = (x) => mbFieldLeft.outputFunction()(x) + mbFieldRight.outputFunction()(x)
        greenFunTracer.fun = mbFieldLeft.outputFunction()
        whiteFunTracer.fun = mbFieldRight.outputFunction()
        if (sySlider.grabbed ){

        }
    }

    Planet.winCon(gameState, ()=>sumTracer.solved&&f1Tracer.solved, nextButton)
    Planet.unlockScenes(nextScenes, gss)
}


function sumSliderLevel (gameState, {
    numSliders,
    sumTracerStart=0,
    f1TracerStart=0,
    f2TracerStart=0,
    targetSize = 20, sliderSize = 15,
    nextScenes, 
    gridXMax=2,
    gridYMax=2,
    gridYMin=-2,
    gridXMin=-2,
    increment=0.1,
    sumTargetValues, 
    f1TargetValues,
}){
    const f1Color = Color.yellow
    const f2Color = Color.magenta
    const sumColor = Color.red
    const gss = gameState.stored
    const backButton = Planet.backButton(gameState)
    const nextButton = Planet.nextButton(gameState, nextScenes)

    const gridLeft = new Grid({canvasX:100, canvasY:350, canvasWidth:400, canvasHeight:400, 
        gridXMin:gridXMin, gridYMin:gridYMin, gridXMax:gridXMax, gridYMax:gridYMax, labels:true, arrows:false, autoCellSize: true})
    const gridMiddle = new Grid({canvasX:600, canvasY:350, canvasWidth:400, canvasHeight:400, 
        gridXMin:gridXMin, gridYMin:gridYMin, gridXMax:gridXMax, gridYMax:gridYMax, labels:true, arrows:false, autoCellSize: true
    })
    const gridRight = new Grid({canvasX:1100, canvasY:350, canvasWidth:400, canvasHeight:400, 
        gridXMin:gridXMin, gridYMin:gridYMin, gridXMax:gridXMax, gridYMax:gridYMax, labels:true, arrows:false, autoCellSize: true})
    
    const spacing = gridLeft.gridWidth/numSliders
    var f1Sliders = []
    var f2Sliders = []
    for (let i = 0; i < numSliders; i++){
        f1Sliders.push(new Slider({grid:gridMiddle, gridPos:gridMiddle.gridXMin + i * spacing,
            increment: increment,circleRadius:sliderSize,circleColor:f1Color}))
        f2Sliders.push(new Slider({grid:gridRight, gridPos:gridRight.gridXMin + i * spacing,
            increment: increment,circleRadius:sliderSize,circleColor:f2Color}))
    }
    
    var sumTargets = []
    var f1Targets = []
    for (let i = 0; i < numSliders; i++) {
        const x = gridLeft.gridXMin+(i+1)*spacing
        f1Targets.push(new Target({grid: gridLeft, gridX:x, gridY:f1TargetValues[i], size:targetSize,unhitColor:f1Color}))
        sumTargets.push(new Target({grid: gridLeft, gridX:x, gridY:sumTargetValues[i], size:targetSize, unhitColor:sumColor}))
    }
    

    const sumTracer = new IntegralTracer({grid: gridLeft, 
        input:{type:'comboSliders', sliders1:f2Sliders, sliders2:f1Sliders, combo: (x,y)=>x+y},
         targets:sumTargets, originGridY:sumTracerStart
    })
    const f2Tracer = new IntegralTracer({grid: gridLeft, input:{type:'sliders', sliders: f2Sliders}, originGridY:f2TracerStart, 
        unsolvedColor:f2Color,
    })
    const f1Tracer = new IntegralTracer({grid: gridLeft, input:{type:'sliders', sliders: f1Sliders}, targets:f1Targets, originGridY:f1TracerStart,
        unsolvedColor:f1Color,
    })

    gameState.objects = [gridLeft, gridMiddle, gridRight, f1Tracer, f2Tracer, sumTracer,
         backButton, nextButton].concat(f1Targets).concat(sumTargets).concat(f1Sliders).concat(f2Sliders)
    gameState.update = ()=> {
    }

    Planet.winCon(gameState, ()=>sumTracer.solved&&f1Tracer.solved, nextButton)
    Planet.unlockScenes(nextScenes, gss)
}
