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
    'exponential.puzzle.1': [6,1, 0,-1],
    'exponential.puzzle.2': [7,1, 0,-1],
    'exponential.puzzle.3': [8,1, 0,-1],
    'exponential.puzzle.4': [9,1, 0,-1],
    'exponential.puzzle.5': [10,1, 0,-1],
    'exponential.puzzle.6': [11,1, 0,-1],
    'exponential.puzzle.7': [12,1, 0,-1],
    'exponential.puzzle.8': [13,1, 0,-1],
    'exponential.puzzle.9': [14,1, 0,-1],
    'exponential.puzzle.10':[15,1, 0,-1],
    'exponential.lab':      [16,1, 0,-1],
}

const paths = 
[
    {start: 'planetMap', end: 'exponential.puzzle.1'},
    {start: 'exponential.puzzle.1', end: 'exponential.puzzle.2', steps: [] },
    {start: 'exponential.puzzle.2', end: 'exponential.puzzle.3', steps: [] },
    {start: 'exponential.puzzle.3', end: 'exponential.puzzle.4', steps: [] },
    {start: 'exponential.puzzle.4', end:  'exponential.puzzle.5', steps: [] },
    {start: 'exponential.puzzle.5', end: 'exponential.puzzle.6', steps: [] },
    {start: 'exponential.puzzle.6', end: 'exponential.puzzle.7', steps: [] },
    {start: 'exponential.puzzle.7', end: 'exponential.puzzle.8', steps: [] },
    {start: 'exponential.puzzle.8', end: 'exponential.puzzle.9', steps: [] },
    {start: 'exponential.puzzle.9', end: 'exponential.puzzle.10', steps: [] },
    {start: 'exponential.puzzle.10', end: 'exponential.lab', steps: []},
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

function demoEnd(gameState){
    gameState.objects = [
       new TextBox({originX:800, originY:450, content: 'You have reached the end of the demo.',
        align:'center', color:Color.white, font:'40px monospace'}),
        new Button({originX: 700, originY:600, width:250, height: 100, label:'Back to game', onclick: ()=>Scene.loadScene(gameState, 'quadratic')})
    ]
}

export function loadScene(gameState, sceneName, message = {}){
    gameState.stored.planet = 'exponential'

    const sceneNameSplit = sceneName.toLowerCase().split('.')

    // Main scene
    if (sceneNameSplit.length == 1) {
        exponentialPlanet(gameState, message)
        return
    }

    // Sub-scenes
    switch(sceneNameSplit[1]){
        case "puzzle": 
            switch(sceneNameSplit[2]){
                case '1':
                    exponentialLevel(gameState, {numSliders:4, nextScenes:["exponential.puzzle.2"], gridXMax:4,gridYMax:16, lastTarget:16})
                    break
                // case '2':
                //     exponentialLevel(gameState, {numSliders:8, nextScenes:["exponential.puzzle.3"],  gridXMax:4,gridYMax:30,
                //         sliderSize: 15, targetSize:16, lastTarget:27, increment:0.5}
                //     )
                //     break
                case '2':
                    exponentialLevel(gameState, {numSliders:4, nextScenes:["exponential.puzzle.3"], withMathBlock:true,
                        gridXMax:4,gridYMax:16,
                        lastTarget:16,
                        increment: 0.2,
                        oneSlider:true,
                    })
                    break
                case '3':
                    exponentialLevel(gameState, {numSliders:8, nextScenes:["exponential.puzzle.4"], withMathBlock:true,
                        gridXMax:4,gridYMax:30,
                        lastTarget:27,
                        sliderSize: 12, targetSize:16, increment: 0.2,
                        oneSlider:true,
                    })
                    break
                case '4':
                    exponentialLevel(gameState, {numSliders:16, nextScenes:["exponential.puzzle.5"], withMathBlock:true,
                        gridXMax:4,gridYMax:40,
                        lastTarget:38,
                        sliderSize: 10, targetSize:15, increment: 0.2,
                        oneSlider:true,
                    })
                    break
                case '5':
                    exponentialLevel(gameState, {numSliders:200, nextScenes:["exponential.puzzle.6"], withMathBlock:true,
                        gridXMax:4,gridYMax:60,
                        lastTarget:53,
                        sliderSize: 5, targetSize:10, increment: 0.1,
                        oneSlider:true,
                    })
                    break
                case '6':
                    exponentialLevel(gameState, {numSliders:5, nextScenes:["exponential.puzzle.7"],
                        gridXMax:1,gridYMax:3,
                        increment: 0.1,
                    })
                    break
                case '7':
                    exponentialLevel(gameState, {numSliders:200, nextScenes:["exponential.puzzle.8"],
                        gridXMax:1,gridYMax:3,
                        sliderSize: 5, targetSize:4, increment: 0.01,
                        withMathBlock:true, oneSlider:true,
                    })
                    break
                case '8':
                    exponentialLevel(gameState, {numSliders:400, nextScenes:["exponential.puzzle.8"],
                        gridXMax:1,gridYMax:3,
                        sliderSize: 5, targetSize:5, increment: 0.01,
                        withMathBlock:true, oneSlider:true,
                        nSliderMin:2,nSliderMax:3,nSliderIncrement:0.01,
                    })
                    break
            }
        break

        case 'dialogue':
            exponentialPlanet(gameState)
            switch(sceneNameSplit[2]){
                case '1':
                    dialogueScene(gameState, {exitTo:"exponential", nextScenes:["exponential.puzzle.5"], text: [    
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

function exponentialPlanet(gameState,message){
    console.log('Quadratic function')
    Planet.planetScene(gameState, {
        planetName:'exponential',
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


function drawFunctionLevel (gameState, {
     tracerStart=1,
    targetSize = 20, sliderSize = 15,
    nextScenes = [], 
}){
    const gss = gameState.stored
    const backButton = Planet.backButton(gameState)
    const nextButton = Planet.nextButton(gameState, nextScenes)

    console.log('DRAW FUNCTION LEVEL')

    const gridLeft = new Grid({canvasX: 300, canvasY:350, canvasWidth:400, canvasHeight:400, 
        gridXMin:-5, gridYMin:-5, gridXMax:5, gridYMax:5, labels:false, arrows:true})
    const gridRight = new Grid({canvasX: 900, canvasY:350, canvasWidth:400, canvasHeight:400, 
        gridXMin:-5, gridYMin:-5, gridXMax:5, gridYMax:5, labels:false, arrows:true})
    
    const drawFunction = new DrawFunction ({grid: gridRight})


    const numTargets = 10
    const spacing = gridLeft.gridWidth / numTargets
    var targets = []
    for (let i = 0; i < numTargets; i++) {
        const x = gridLeft.gridXMin+(i)*spacing
        targets.push(new Target({grid: gridLeft, gridX:x, gridY:0, size:targetSize}))
    }
    
    
    const tracer = new IntegralTracer({grid: gridLeft, drawFunction:drawFunction, targets:targets,
    })
    

    gameState.objects = [gridLeft, gridRight, backButton, nextButton, drawFunction, tracer].concat(targets)    

    //Planet.winCon(gameState, ()=>tracer.solved, nextButton)
    Planet.unlockScenes(nextScenes, gss)
}

function exponentialLevel (gameState, {
    numSliders,
    withMathBlock = false,
     tracerStart=1,
    targetSize = 20, sliderSize = 15,
    nextScenes, 
    gridXMax=4,gridYMax=16, increment=1,
    lastTarget,
    oneSlider = false,
    nSliderMin=0,nSliderMax=5,nSliderIncrement=0.1,
}){
    const gss = gameState.stored
    const backButton = Planet.backButton(gameState)
    const nextButton = Planet.nextButton(gameState, nextScenes)

    const gridLeft = new Grid({canvasX:withMathBlock ? 150 : 300, canvasY:350, canvasWidth:400, canvasHeight:400, 
        gridXMin:0, gridYMin:0, gridXMax:gridXMax, gridYMax:gridYMax, labels:true, arrows:false, autoCellSize: true})
    const gridRight = new Grid({canvasX:withMathBlock ? 700 : 900, canvasY:350, canvasWidth:400, canvasHeight:400, 
        gridXMin:0, gridYMin:0, gridXMax:gridXMax, gridYMax:gridYMax, labels:true, arrows:false, autoCellSize: true})
    
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
    for (let i = 0; i < numSliders; i++) {
        const x = gridLeft.gridXMin+(i)*spacing
        targets.push(new Target({grid: gridLeft, gridX:x, gridY:0, size:targetSize}))
    }
    if (lastTarget != null)
        targets.push(new Target({grid: gridLeft, gridX:gridLeft.gridXMax, gridY:lastTarget, size:targetSize}))
    
    
    const tracer = new IntegralTracer({grid: gridLeft, sliders: sliders, targets:targets, originGridY:tracerStart, 
        spacing: gridLeft.gridWidth / (numSliders)
    })
    
    const blocks = [
        new MathBlock({type:MathBlock.VARIABLE, token:"x"}),
        new MathBlock({type:MathBlock.EXPONENT, token:'n'}),
    ]
    // for (let b of gss.mathBlocksUnlocked){
    //     blocks.push(new MathBlock({type: b.type, token: b.token}))
    // }

    gameState.objects = [gridLeft, gridRight, tracer, backButton, nextButton].concat(targets).concat(sliders)
    gameState.update = ()=> {
        for (let i = 0; i < numSliders; i++) {
            targets[i].setGridYPosition(sliders[i].value)
        }
    }

    if (withMathBlock){

        sliders.forEach(s => s.clickable = false)

        const sySlider = new Slider({canvasX: 1180, canvasY: 350, maxValue:2, sliderLength:4, startValue: 1, showAxis:true})
        const tySlider = new Slider({canvasX: 1260, canvasY: 350, maxValue:2, sliderLength:4, showAxis:true})
        const nSlider = new Slider({canvasX: 1340, canvasY: 350, maxValue:nSliderMax, sliderLength:nSliderMax-nSliderMin, increment:nSliderIncrement, showAxis:true})
        const mbField = new MathBlockField({minX:700, minY:100, maxX:1100, maxY:300, outputSliders:sliders})
        if (oneSlider){
            sySlider.hidden = true
            tySlider.hidden = true
            nSlider.canvasX = 1200
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

    Planet.winCon(gameState, ()=>tracer.solved, nextButton)
    Planet.unlockScenes(nextScenes, gss)
}

function placeHolderLevel(gameState){

}
