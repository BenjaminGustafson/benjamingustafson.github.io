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
                case '1':
                    sumSliderLevel(gameState, {numSliders:4, sliderSize:15, gridYMin:-2, gridYMax:2,gridXMin:-2,gridXMax:2,
                        magentaTargetValues: [1,1,1,1], yellowTargetValues : [-1,-0.5,0,0.5],
                        greenTracerStart:-1.5, redTracerStart:1,
                         nextScenes:["sum.puzzle.2"]})
                    break

                case '2':
                    sumSliderLevel(gameState, {numSliders:4, sliderSize:15, gridYMin:-2, gridYMax:2,gridXMin:-2,gridXMax:2,
                        magentaTargetValues: [0,0,0,0], yellowTargetValues : [-2,-1,-2,-1],
                        greenTracerStart:-1, redTracerStart:0,whiteTracerStart:1,
                            nextScenes:["sum.puzzle.3"]})
                    break
                case '3':
                    sumSliderLevel(gameState, {numSliders:4, sliderSize:15, gridYMin:-2, gridYMax:2,gridXMin:-2,gridXMax:2,
                        magentaTargetValues: [0.5,1,1.5,2], yellowTargetValues : [-0.2,-0.4,-0.6,-0.8],
                        greenTracerStart:0, redTracerStart:0,whiteTracerStart:0,
                            nextScenes:["sum.puzzle.4"]})
                    break
                case '4':
                    sumSliderLevel(gameState, {numSliders:4, sliderSize:15, gridYMin:-2, gridYMax:2,gridXMin:-2,gridXMax:2,
                        magentaTargetValues: [0.5,1,0.5,0], yellowTargetValues : [-0.5,-1,-0.5,-1],
                        greenTracerStart:0, redTracerStart:0,whiteTracerStart:0,
                            nextScenes:["sum.puzzle.4"]})
                    break
            }
        break

        case 'dialogue':
            sumPlanet(gameState)
            switch(sceneNameSplit[2]){
                case '1':
                    dialogueScene(gameState, {exitTo:"sum", nextScenes:["sum.puzzle.5"], text: [    
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


function sumLevel (gameState, {
    numSliders,
    withMathBlock = false,
    tracerStart=0,
    targetSize = 20, sliderSize = 15,
    nextScenes, 
    gridXMax=5,
    gridYMax=2,
    gridYMin=-2,
    gridXMin=-5,
    increment=0.1,
    nSliderMin=0,nSliderMax=5,nSliderIncrement=1,
    fun1, fun2,
}){
    const gss = gameState.stored
    const backButton = Planet.backButton(gameState)
    const nextButton = Planet.nextButton(gameState, nextScenes)

    const gridLeft = new Grid({canvasX:50, canvasY:350, canvasWidth:400, canvasHeight:400, 
        gridXMin:gridXMin, gridYMin:gridYMin, gridXMax:gridXMax, gridYMax:gridYMax, labels:true, arrows:false, autoCellSize: true})
    const gridMiddle = new Grid({canvasX:500, canvasY:350, canvasWidth:400, canvasHeight:400, 
        gridXMin:gridXMin, gridYMin:gridYMin, gridXMax:gridXMax, gridYMax:gridYMax, labels:true, arrows:false, autoCellSize: true
    })
    const gridRight = new Grid({canvasX:950, canvasY:350, canvasWidth:400, canvasHeight:400, 
        gridXMin:gridXMin, gridYMin:gridYMin, gridXMax:gridXMax, gridYMax:gridYMax, labels:true, arrows:false, autoCellSize: true})
    
    const spacing = gridLeft.gridWidth/numSliders
    var greenSliders = []
    var whiteSliders = []
    for (let i = 0; i < numSliders; i++){
        greenSliders.push(new Slider({grid:gridMiddle, gridPos:gridMiddle.gridXMin + i * spacing,
            increment: increment,circleRadius:sliderSize,circleColor:new Color(0,200,50)}))
        whiteSliders.push(new Slider({grid:gridRight, gridPos:gridRight.gridXMin + i * spacing,
            increment: increment,circleRadius:sliderSize,circleColor:new Color(200,200,200)}))
    }
    

    var magentaTargets = []
    var yellowTargets = []
    for (let i = 0; i < numSliders; i++) {
        const x = gridLeft.gridXMin+(i+1)*spacing
        const y1 = fun1(x)
        if (gridLeft.isInBoundsGridY(y1))
            yellowTargets.push(new Target({grid: gridLeft, gridX:x, gridY:y1, size:targetSize,unhitColor:Color.yellow}))

        const y = fun1(x) + fun2(x)
        if (gridLeft.isInBoundsGridY(y))
            magentaTargets.push(new Target({grid: gridLeft, gridX:x, gridY:y, size:targetSize}))
    }
    

    const redTracer = new IntegralTracer({grid: gridLeft, sliders: whiteSliders, sliders2:greenSliders, type:'sumOfSliders',
         targets:magentaTargets, originGridY:tracerStart
    })
    const whiteTracer = new IntegralTracer({grid: gridLeft, sliders: whiteSliders, originGridY:tracerStart, 
        unsolvedColor:Color.white,
    })
    const greenTracer = new IntegralTracer({grid: gridLeft, sliders: greenSliders, targets:yellowTargets, originGridY:tracerStart,
        unsolvedColor:Color.green,
    })
    
    const blocks = [
        new MathBlock({type:MathBlock.VARIABLE, token:"x"}),
    ]
    // for (let b of gss.mathBlocksUnlocked){
    //     blocks.push(new MathBlock({type: b.type, token: b.token}))
    // }

    gameState.objects = [gridLeft, gridMiddle, gridRight, greenTracer, whiteTracer, redTracer,
         backButton, nextButton].concat(yellowTargets).concat(magentaTargets).concat(greenSliders).concat(whiteSliders)
    gameState.update = ()=> {
    }

    // if (withMathBlock){

    //     sliders.forEach(s => s.clickable = false)

    //     const sySlider = new Slider({canvasX: 1400, canvasY: 350, maxValue:2, sliderLength:4, startValue: 1, showAxis:true})
    //     const tySlider = new Slider({canvasX: 1480, canvasY: 350, maxValue:2, sliderLength:4, showAxis:true})
    //     const nSlider = new Slider({canvasX: 1560, canvasY: 350, maxValue:nSliderMax, sliderLength:nSliderMax-nSliderMin,
    //          increment:nSliderIncrement, showAxis:true})
    //     const mbField = new MathBlockField({minX:950, minY:100, maxX:1350, maxY:300, outputSliders:sliders})

    //     const mbm = new MathBlockManager({blocks : blocks, toolBarX: 1400, toolBarY:150, outputType:"sliders",
    //         scaleYSlider: sySlider, translateYSlider:tySlider, numSlider:nSlider,
    //         blockFields: [ mbField ],

    //     })
    //     gameState.objects = gameState.objects.concat([mbm, sySlider, tySlider, nSlider])
        
    //     const update = gameState.update
    //     gameState.update = ()=>{
    //         update()
    //         if (mbField.rootBlock != null){
    //             const fun = mbField.rootBlock.toFunction()
    //             if (fun != null){
    //                 for (let i = 0; i < numSliders; i++){
    //                     sliders[i].moveToValue(fun(sliders[i].gridPos))
    //                     //sliders[i].setValue(fun(sliders[i].gridPos))
    //                 }
    //             }
    //         }
    //     }
    // }

    Planet.winCon(gameState, ()=>redTracer.solved, nextButton)
    Planet.unlockScenes(nextScenes, gss)
}



function sumSliderLevel (gameState, {
    numSliders,
    whiteTracerStart=0,
    redTracerStart=0,
    greenTracerStart=0,
    targetSize = 20, sliderSize = 15,
    nextScenes, 
    gridXMax=2,
    gridYMax=2,
    gridYMin=-2,
    gridXMin=-2,
    increment=0.1,
    magentaTargetValues, 
    yellowTargetValues,
}){
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
    var greenSliders = []
    var whiteSliders = []
    for (let i = 0; i < numSliders; i++){
        greenSliders.push(new Slider({grid:gridMiddle, gridPos:gridMiddle.gridXMin + i * spacing,
            increment: increment,circleRadius:sliderSize,circleColor:new Color(0,200,50)}))
        whiteSliders.push(new Slider({grid:gridRight, gridPos:gridRight.gridXMin + i * spacing,
            increment: increment,circleRadius:sliderSize,circleColor:new Color(200,200,200)}))
    }
    
    var magentaTargets = []
    var yellowTargets = []
    for (let i = 0; i < numSliders; i++) {
        const x = gridLeft.gridXMin+(i+1)*spacing
        yellowTargets.push(new Target({grid: gridLeft, gridX:x, gridY:yellowTargetValues[i], size:targetSize,unhitColor:Color.yellow}))
        magentaTargets.push(new Target({grid: gridLeft, gridX:x, gridY:magentaTargetValues[i], size:targetSize}))
    }
    

    const redTracer = new IntegralTracer({grid: gridLeft, sliders: whiteSliders, sliders2:greenSliders, type:'sumOfSliders',
         targets:magentaTargets, originGridY:redTracerStart
    })
    const whiteTracer = new IntegralTracer({grid: gridLeft, sliders: whiteSliders, originGridY:whiteTracerStart, 
        unsolvedColor:Color.white,
    })
    const greenTracer = new IntegralTracer({grid: gridLeft, sliders: greenSliders, targets:yellowTargets, originGridY:greenTracerStart,
        unsolvedColor:Color.green, audioChannel:1,
    })
    

    gameState.objects = [gridLeft, gridMiddle, gridRight, greenTracer, whiteTracer, redTracer,
         backButton, nextButton].concat(yellowTargets).concat(magentaTargets).concat(greenSliders).concat(whiteSliders)
    gameState.update = ()=> {
    }

    Planet.winCon(gameState, ()=>redTracer.solved&&greenTracer.solved, nextButton)
    Planet.unlockScenes(nextScenes, gss)
}
