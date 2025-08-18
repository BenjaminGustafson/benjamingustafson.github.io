import {Color, Shapes} from '../util/index.js'
import {TileMap, Grid, FunctionTracer, Button, ImageObject, IntegralTracer, MathBlock, MathBlockManager, MathBlockField, Slider, Target, TargetAdder, TextBox, DialogueBox} from '../GameObjects/index.js'
import * as Scene from '../Scene.js'
import { GameObject } from '../GameObjects/GameObject.js'
import * as Planet from './Planet.js'
import * as Experiment from './Experiment.js'

const tileMap = new TileMap({yTileOffset:-3,xTileOffset:-7, xImgOffset:0, yImgOffset:0})

// [x,y,  dx,dy] where dx dy is the direction to face when stopped at node
// SW 0,1 NW -1,0 NE 0,-1 SE 1,0
const nodes = {
    'planetMap': [14,8,  0,1],
    'exponential.puzzle.1': [13,8,  0,-1],
    'exponential.puzzle.2': [11,8, 0,-1],
    'exponential.puzzle.3': [7,1, -1,0],
    'exponential.puzzle.4': [7,-2, -1,0],
    'exponential.puzzle.5': [10,-3, 0,-1],
    'exponential.puzzle.6': [13,1, -1,0],
    'exponential.puzzle.7': [16,3, 0,-1],
    'exponential.puzzle.8': [18,4, 0,-1],
    'exponential.puzzle.9': [22,0, -1,0],
    'exponential.puzzle.10': [17,-4, -1,0],
    'exponential.lab': [14,-6, 0,-1],
}

const paths = 
[
    {start: 'planetMap', end: 'exponential.puzzle.1'},
    {start: 'exponential.puzzle.1', end: 'exponential.puzzle.2', steps: [] },
    {start: 'exponential.puzzle.2', end: 'exponential.puzzle.3', steps: [[10,8],[10,7],[9,7],[9,2],[7,2]] },
    {start: 'exponential.puzzle.3', end: 'exponential.puzzle.4', steps: [] },
    {start: 'exponential.puzzle.4', end:  'exponential.puzzle.5', steps: [[7,-3]] },
    {start: 'exponential.puzzle.5', end: 'exponential.puzzle.6', steps: [[12,-3],[12,-1],[13,-1]] },
    {start: 'exponential.puzzle.6', end: 'exponential.puzzle.7', steps: [[13,3],[14,3],[14,4],[16,4]] },
    {start: 'exponential.puzzle.7', end: 'exponential.puzzle.8', steps: [[17,3],[17,4]] },
    {start: 'exponential.puzzle.8', end: 'exponential.puzzle.9', steps: [[22,4]] },
    {start: 'exponential.puzzle.9', end: 'exponential.puzzle.10', steps: [[22,-2],[21,-2],[21,-3],[17,-3]] },
    {start: 'exponential.puzzle.10', end: 'exponential.lab', steps: [[17,-5],[16,-5],[16,-6]]},
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
                    quadDiscLevel(gameState, {numSliders:4, nextScenes:["exponential.puzzle.2"], ddx: x=>x, tracerStart:2})
                    break
                case '2':
                    quadDiscLevel(gameState, {numSliders:8, nextScenes:["exponential.puzzle.3"], ddx: x=>x, tracerStart:2})
                    break
                case '3':
                    quadDiscLevel(gameState, {numSliders:20, withMathBlock:true, nextScenes:["exponential.puzzle.4"], ddx: x=>x, tracerStart:2})
                    break
                case '4':
                    quadDiscLevel(gameState, {numSliders:200, sliderSize:10, targetSize:10, withMathBlock:true, nextScenes:["exponential.puzzle.5"]})
                    break
                case '5':
                    quadDiscLevel(gameState, {numSliders:8, nextScenes:["exponential.puzzle.6"], ddx: x=> -x, tracerStart:-2})
                    break
                case '6':
                    quadDiscLevel(gameState, {numSliders:200, sliderSize:10, targetSize:10,
                        withMathBlock:true, nextScenes:["exponential.puzzle.7"], ddx: x=> -x, tracerStart:-2})
                    break
                case '7':
                    quadDiscLevel(gameState, {numSliders:200, sliderSize:10, targetSize:10,
                        withMathBlock:true, nextScenes:["exponential.puzzle.8"], ddx: x=> -0.5*x, tracerStart:0})
                    break
                case '8':
                    quadDiscLevel(gameState, {numSliders:200, sliderSize:10, targetSize:10,
                        withMathBlock:true, nextScenes:["exponential.lab"], func: x=>0.1*x*x})
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
        message
    })
}

function quadDiscLevel (gameState, {
    numSliders,
    withMathBlock = false,
    func, ddx, tracerStart,
    targetSize = 20, sliderSize = 15,
    nextScenes, 
}){
    if (func == null && ddx == null)
        func = x => x*x/2
    
    const gss = gameState.stored
    const backButton = Planet.backButton(gameState)
    const nextButton = Planet.nextButton(gameState, nextScenes)

    const gridLeft = new Grid({canvasX:withMathBlock ? 150 : 300, canvasY:350, canvasWidth:400, canvasHeight:400, 
        gridXMin:-2, gridYMin:-2, gridXMax:2, gridYMax:2, labels:false, arrows:true})
    const gridRight = new Grid({canvasX:withMathBlock ? 700 : 900, canvasY:350, canvasWidth:400, canvasHeight:400, 
        gridXMin:-2, gridYMin:-2, gridXMax:2, gridYMax:2, labels:false, arrows:true})
    
    const spacing = gridLeft.gridWidth/numSliders
    var sliders = []
    for (let i = 0; i < numSliders; i++){
        sliders.push(new Slider({grid:gridRight, gridPos:gridRight.gridXMin + i * spacing,
            increment: withMathBlock ? 0.05 : 0.1,circleRadius:sliderSize}))
    }
    
    // var targets = []
    // for (let i = 0; i < numSliders; i++) {
    //     const x = gridLeft.gridXMin+(i+1)*spacing
    //     targets.push(new Target({grid: gridLeft, gridX:x, gridY:func(x), size:targetSize}))
    // }

    var targets = []
    if (func != null)
        tracerStart = func(gridLeft.gridXMin)
    var y = tracerStart
    for (let i = 0; i < numSliders; i++) {
        const x = gridLeft.gridXMin+(i+1)*spacing
        if (func != null)
            y = func(x)
        else 
            y += ddx(gridLeft.gridXMin+i*spacing)*spacing
        targets.push(new Target({grid: gridLeft, gridX:x, gridY:y, size:targetSize}))
    }
    
    
    const tracer = new IntegralTracer({grid: gridLeft, sliders: sliders, targets:targets, originGridY:tracerStart})
    
    const blocks = [
        new MathBlock({type:MathBlock.VARIABLE, token:"x"}),
    ]
    for (let b of gss.mathBlocksUnlocked){
        blocks.push(new MathBlock({type: b.type, token: b.token}))
    }

    gameState.objects = [gridLeft, gridRight, tracer, backButton, nextButton].concat(targets).concat(sliders)


    if (withMathBlock){

        const sySlider = new Slider({canvasX: 1200, canvasY: 350, maxValue:2, sliderLength:4, startValue: 1, showAxis:true})
        const tySlider = new Slider({canvasX: 1300, canvasY: 350, maxValue:2, sliderLength:4, showAxis:true})
        const mbField = new MathBlockField({minX:700, minY:100, maxX:1100, maxY:300, outputSliders:sliders})
        const mbm = new MathBlockManager({blocks : blocks, toolBarX: 1400, toolBarY:150, outputType:"sliders",
            scaleYSlider: sySlider, translateYSlider:tySlider,
            blockFields: [ mbField ],

        })
        gameState.objects = gameState.objects.concat([mbm, sySlider, tySlider])
        gameState.update = ()=>{
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
