import {Color, Shapes} from '../util/index.js'
import {TileMap, Grid, FunctionTracer, Button, ImageObject, IntegralTracer, MathBlock, MathBlockManager, MathBlockField, Slider, Target, TargetAdder, TextBox, DialogueBox} from '../GameObjects/index.js'
import * as Scene from '../Scene.js'
import { GameObject } from '../GameObjects/GameObject.js'
import * as Planet from './Planet.js'
import * as Experiment from './Experiment.js'

/**
 * 
 * Dialogue
 * 
 * That curve shape is called a quadratic.
 * 'Quad' means square. Like x^2.
 * Like if I have a square whose sides are x units,
 * 
 * 
 */



const tileMap = new TileMap({yTileOffset:-3,xTileOffset:-7, xImgOffset:0, yImgOffset:0})

// [x,y,  dx,dy] where dx dy is the direction to face when stopped at node
// SW 0,1 NW -1,0 NE 0,-1 SE 1,0
const nodes = {
    'planetMap': [14,8,  0,1],
    'quadratic.puzzle.1': [13,8,  0,-1],
    'quadratic.puzzle.2': [11,8, 0,-1],
    'quadratic.puzzle.3': [7,1, -1,0],
    'quadratic.puzzle.4': [7,-2, -1,0],
    'quadratic.dialogue.1': [7,-3, -1,0],
    'quadratic.puzzle.5': [10,-3, 0,-1],
    'quadratic.puzzle.6': [13,1, -1,0],
    'quadratic.puzzle.7': [16,3, 0,-1],
    'quadratic.puzzle.8': [18,4, 0,-1],
    'quadratic.dialogue.2': [22,1, -1,0],
    'quadratic.puzzle.9': [22,0, -1,0],
    'quadratic.puzzle.10': [17,-4, -1,0],
    'quadratic.dialogue.3': [16,-6, 0,-1],
    'quadratic.lab': [14,-6, 0,-1],
}

const paths = 
[
    {start: 'planetMap', end: 'quadratic.puzzle.1'},
    {start: 'quadratic.puzzle.1', end: 'quadratic.puzzle.2', steps: [] },
    {start: 'quadratic.puzzle.2', end: 'quadratic.puzzle.3', steps: [[10,8],[10,7],[9,7],[9,2],[7,2]] },
    {start: 'quadratic.puzzle.3', end: 'quadratic.puzzle.4', steps: [] },
    {start: 'quadratic.puzzle.4', end:  'quadratic.dialogue.1', steps: [] },
    {start: 'quadratic.dialogue.1', end:  'quadratic.puzzle.5', steps: [] },
    {start: 'quadratic.puzzle.5', end: 'quadratic.puzzle.6', steps: [[12,-3],[12,-1],[13,-1]] },
    {start: 'quadratic.puzzle.6', end: 'quadratic.puzzle.7', steps: [[13,3],[14,3],[14,4],[16,4]] },
    {start: 'quadratic.puzzle.7', end: 'quadratic.puzzle.8', steps: [[17,3],[17,4]] },
    {start: 'quadratic.puzzle.8', end: 'quadratic.dialogue.2', steps: [[22,4]] },
    {start: 'quadratic.dialogue.2', end: 'quadratic.puzzle.9', steps: [] },
    {start: 'quadratic.puzzle.9', end: 'quadratic.puzzle.10', steps: [[22,-2],[21,-2],[21,-3],[17,-3]] },
    {start: 'quadratic.puzzle.10', end: 'quadratic.dialogue.3', steps: [[17,-5],[16,-5]]},
    {start: 'quadratic.dialogue.3', end: 'quadratic.lab', steps: [] },
]


const experimentData =  {
    '1':{
        solutionFun: x=> -x*x+10,
        solutionDdx:x=>-2*x,
        solutionFunString:"-t^2+10",
        solutionDdxString:"-2t",
        syFunMax: 2, syFunLen: 4, tyFunMax: 10, tyFunLen: 10,
        syDdxMax: 2,
        syDdxLen: 4,
        tyDdxMax: 2,
        tyDdxLen: 4,
        tMax:5,
        numMeasurement:5,
        ddxSliderSpacing:0.5,
        ddxMax: 0, ddxMin:-10,
        funMax: 10, funMin:0, 
    },
    '2': {
        solutionFun: x=> -2*x*x+10,
        solutionDdx:x=>-4*x,
        solutionFunString:"-2t^2+10",
        solutionDdxString:"-4t",
        syFunMax: 5, syFunLen: 10, tyFunMax: 10, tyFunLen: 10,
        syDdxMax: 5,
        syDdxLen: 10,
        tyDdxMax: 0,
        tyDdxLen: 10,
        tMax:5,
        numMeasurement:5,
        ddxSliderSpacing:0.5,
        ddxMax: 0, ddxMin:-10,
        funMax: 10, funMin:0, 
    },
    '3':{
        solutionFun: x=> -0.5*x*x+8,
        solutionDdx:x=>-x,
        solutionFunString:"-0.5t^2+5",
        solutionDdxString:"-t",
        syFunMax: 5, syFunLen: 10, tyFunMax: 10, tyFunLen: 10,
        syDdxMax: 5,
        syDdxLen: 10,
        tyDdxMax: 0,
        tyDdxLen: 10,
        tMax:5,
        numMeasurement:5,
        ddxSliderSpacing:0.5,
        ddxMax: 0, ddxMin:-10,
        funMax: 10, funMin:0, 
    },
    '4':{
        solutionFun: x=> -5*x*x+10,
        solutionDdx:x=>-10*x,
        solutionFunString:"-5t^2+10",
        solutionDdxString:"-10t",
        syFunMax: 5, syFunLen: 10, tyFunMax: 10, tyFunLen: 10,
        syDdxMax: 0,
        syDdxLen: 10,
        tyDdxMax: 0,
        tyDdxLen: 10,
        tMax:5,
        numMeasurement:5,
        ddxSliderSpacing:0.5,
        ddxMax: 0, ddxMin:-20,
        funMax: 10, funMin:0, 
    },
    '5':{
        solutionFun: x=> x*x,
        solutionDdx:x=> 2*x,
        solutionFunString:"t^2",
        solutionDdxString:"2 t",
        syFunMax: 5, syFunLen: 10, tyFunMax: 10, tyFunLen: 10,
        syDdxMax: 5,
        syDdxLen: 10,
        tyDdxMax: 5,
        tyDdxLen: 10,
        tMax:5,
        numMeasurement:5,
        ddxSliderSpacing:0.5,
        ddxMax: 10, ddxMin:0,
        funMax: 10, funMin:0, 
    }
}

export function loadScene(gameState, sceneName, message = {}){
    gameState.stored.planet = 'quadratic'

    const sceneNameSplit = sceneName.toLowerCase().split('.')

    // Main scene
    if (sceneNameSplit.length == 1) {
        quadraticPlanet(gameState, message)
        return
    }

    // Sub-scenes
    switch(sceneNameSplit[1]){
        case "puzzle": 
            switch(sceneNameSplit[2]){
                case '1':
                    quadDiscLevel(gameState, {numSliders:4, nextScenes:["quadratic.puzzle.2"], ddx: x=>x, tracerStart:2})
                    break
                case '2':
                    quadDiscLevel(gameState, {numSliders:8, nextScenes:["quadratic.puzzle.3"], ddx: x=>x, tracerStart:2})
                    break
                case '3':
                    quadDiscLevel(gameState, {numSliders:20, withMathBlock:true, nextScenes:["quadratic.puzzle.4"], ddx: x=>x, tracerStart:2})
                    break
                case '4':
                    quadDiscLevel(gameState, {numSliders:200, sliderSize:10, targetSize:10, withMathBlock:true, nextScenes:["quadratic.dialogue.1"]})
                    break
                case '5':
                    quadDiscLevel(gameState, {numSliders:8, nextScenes:["quadratic.puzzle.6"], ddx: x=> -x, tracerStart:-1})
                    break
                case '6':
                    quadDiscLevel(gameState, {numSliders:200, sliderSize:10, targetSize:10,
                        withMathBlock:true, nextScenes:["quadratic.puzzle.7"], ddx: x=> -x, tracerStart:-1})
                    break
                case '7':
                    quadDiscLevel(gameState, {numSliders:200, sliderSize:10, targetSize:10,
                        withMathBlock:true, nextScenes:["quadratic.puzzle.8"], ddx: x=> -0.5*x, tracerStart:0})
                    break
                case '8':
                    quadDiscLevel(gameState, {numSliders:200, sliderSize:10, targetSize:10,
                        withMathBlock:true, nextScenes:["quadratic.dialogue.2"], func: x=>0.1*x*x})
                    break
                case '9':
                    quadMathBlockTutorial(gameState, {
                        targetVals: [0.5,0,0.5,2], 
                        nextScenes: ["quadratic.puzzle.10"],
                    })
                    break
                case '10':
                    quadMathBlockTutorial(gameState, {
                        targetVals: [1,2,1,-2], 
                        nextScenes: ["quadratic.dialogue.3"],
                    })
                    break
            }
        break

        case 'dialogue':
            quadraticPlanet(gameState)
            switch(sceneNameSplit[2]){
                case '1':
                    Planet.dialogueScene(gameState, {nextScenes:["quadratic.puzzle.5"], text: [
                        'The more points you add, the smoother the line gets.',    
                    ]})
                break
                case '2':
                    Planet.dialogueScene(gameState, {nextScenes:["quadratic.puzzle.9"], text: [
                        'Did you recognize that curved graph in the last few levels?',
                        'It\'s the graph of x^2!',
                        'Take this, it will let you make x^2 graphs.'
                    ],
                    onComplete:(gameState)=>{
                        Planet.unlockPopup(gameState, {itemImage:'squareBlock', topText: 'You got a Square Block!', bottomText:''})
                    }})
                break
                case '3':
                    Planet.dialogueScene(gameState, {nextScenes:["quadratic.lab"], text: [  
                        'Have you ever noticed that things speed up as they fall?',
                    ]})
                break
            }
            break

        case "lab":
            Experiment.experimentMenu(gameState, {experimentData: experimentData, ruleFunString:'ax^2+b', ruleDdxString:'2ax'})
            break
        
        case "trial":
            if (sceneNameSplit[2] == 'rule') {
                const targetBlock = new MathBlock({type: MathBlock.BIN_OP, token:"+", originX: 200, originY: 200})
                const multBlock = new MathBlock({type: MathBlock.BIN_OP, token:"*"})
                multBlock.setChild(0, new MathBlock({type: MathBlock.VARIABLE, token:"a"})) 
                const squareBlock = new MathBlock({type: MathBlock.POWER, token:'2'})
                multBlock.setChild(1, squareBlock)
                squareBlock.setChild(0, new MathBlock({type: MathBlock.VARIABLE, token:"x"})) 
                targetBlock.setChild(0, multBlock) 
                targetBlock.setChild(1, new MathBlock({type: MathBlock.VARIABLE, token:"b"}))
                const blocks = [
                    new MathBlock({type:MathBlock.CONSTANT}),
                    new MathBlock({type:MathBlock.VARIABLE, token:"a"}),
                    new MathBlock({type:MathBlock.VARIABLE, token:"b"}),
                    new MathBlock({type:MathBlock.VARIABLE, token:"x"}),
                    new MathBlock({type:MathBlock.BIN_OP, token:"*"}),
                ]
                Experiment.ruleGuess(gameState, {planetUnlock:'exponential', targetBlock:targetBlock, blocks: blocks,
                    correctDdx:(x,a,b) => 2 * a * x,
                })
            } else {
                quadExperimentTrial(gameState, experimentData[sceneNameSplit[2]])
            } 
            break
    }
}

function quadraticPlanet(gameState,message={}){
    Planet.planetScene(gameState, {
        planetName:'quadratic',
        shipX:20, shipY: 450,
        labX: 1150, labY:-150, labDir:'SW',
        tileMap:tileMap,
        playerNodes:nodes,
        playerPaths:paths,
        bgImg: 'riverPlanetBg',
        fgImg: 'riverPlanetFg',
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
    
    
    const tracer = new IntegralTracer({grid: gridLeft, input: {type:'sliders', sliders:sliders}, targets:targets, originGridY:tracerStart})
    
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


function quadExperimentTrial(gameState, {
    solutionFun, solutionDdx,
    solutionFunString,
    solutionDdxString,
    syFunMax, syFunLen, tyFunMax, tyFunLen,
    syDdxMax, syDdxLen, tyDdxMax, tyDdxLen,
    numMeasurement,
    ddxSliderSpacing,
    tMax, ddxMax, ddxMin,
    funMax= 10, funMin=0, 
}){

    const gss = gameState.stored

    // Back button
    const backButton = new Button({originX:50, originY:50, width:50, height:50,
        onclick:(() => loadScene(gameState,gss.planet + ".lab")), label:"↑"})

    // Grid
    const gridLeft = new Grid({canvasX:100, canvasY:400, canvasWidth:400, canvasHeight:400, 
        gridXMin:0, gridXMax:tMax, gridYMin:funMin, gridYMax:funMax, labels:true})

    const gridRight = new Grid({canvasX:580, canvasY:400, canvasWidth:400, canvasHeight:400, 
        gridXMin:0, gridXMax:tMax, gridYMin:ddxMin, gridYMax:ddxMax, labels:true})

    const sySlider = new Slider({canvasX: 580, canvasY:400, canvasLength:400, sliderLength:10, maxValue:5, showAxis: true})
    const tySlider = new Slider({canvasX: 650, canvasY:400, canvasLength:400, sliderLength:10, maxValue:5, showAxis: true})
    const adder = new TargetAdder({grid:gridLeft, precision:1, solutionFun:solutionFun})
    const funTracer = new FunctionTracer({grid:gridLeft})

    const blocks = [ new MathBlock({type:MathBlock.CONSTANT}), new MathBlock({type:MathBlock.VARIABLE, token:'t'}),
        new MathBlock({type:MathBlock.POWER, token:'2'}),
    ]
    // for (let b of gss.mathBlocksUnlocked){
    //     blocks.push(new MathBlock({type: b.type, token: b.token}))
    // }
    const mngr = new MathBlockManager({
        blocks:blocks, toolBarX:750, toolBarY:400,
        translateYSlider:tySlider, scaleYSlider:sySlider, blockSize:26,
        blockFields: [
            new MathBlockField({minX:100, minY:200, maxX:500, maxY:300}),
        ],
        funTracers: [funTracer],
    })

    // Experiment
    const bgImage = {
        update: function(ctx){
            //const image = document.getElementById("quad_img")
            Color.setColor(ctx,Color.darkBlack)
            const x = 1000
            const y = 200
            const w = 600
            const h = 700
            Shapes.Rectangle({ctx:ctx, originX:x, originY:y, width:w, height:h, inset:true})
            //ctx.drawImage(image, 0,0, 1600*600/900,900, x+10, y+10, w-20, h-20)
        }
    }

    // TURTLE
    var time = 0
    var playing = true
    var startTime = Date.now()
    var startValue = 0
    const maxDist = 500
    const apple = {
        originX:1300,
        originY:800,
        update: function(ctx){
            const y = this.originY - (Math.max(0,solutionFun(time)) * maxDist / 10)
            ctx.font = "50px monospace"
            ctx.textAlign = 'center'
            ctx.fillText("🍎", this.originX, y)
        }
    }


    // TIME CONTROLS
    const tSlider = new Slider({canvasX:1100,canvasY:150,canvasLength:450,
        sliderLength:tMax, maxValue:tMax, vertical:false, increment:0.1})
    const timeLabel = new TextBox({originX:1000,originY:80, font:'26px monospace'})
    const playPauseButton = new Button({originX:1000,originY:120,width:50,height:50,
        onclick: function(){
            if (time >= tMax){
                playing = true
                time = 0
                startTime = Date.now()
                startValue = 0
                tSlider.setValue(0)
            }else{
                if (playing){
                    playing = false
                }else{
                    startTime = Date.now()
                    startValue = time
                    playing = true
                }
            } 
        },
        label:"⏸", lineWidth:5
    }) 

    const numberLine = {
        update: function(ctx){
            const originX = 1070 
            const originY = apple.originY
            const length = maxDist
            const numTicks = 10
            const lineWidth = 5
            const tickLength = 10
            Color.setColor(ctx, Color.white)
            Shapes.RoundedLine(ctx, originX, originY, originX, originY - length, lineWidth)

            ctx.font = '24px monospace'
            ctx.textAlign = 'left'
            ctx.textBaseline = 'top'
            ctx.fillText('p(t) = ' + Math.max(0,solutionFun(time)).toFixed(1), 1050, 220)
            
            ctx.font = '20px monospace'
            for (let i = 0; i < numTicks + 1; i++) {
                const tickY = originY - length / numTicks * i
                ctx.textBaseline = 'middle'
                ctx.textAlign = 'right'
                ctx.fillText(i, originX-30, tickY)
                Shapes.RoundedLine(ctx, originX - tickLength, tickY, originX + tickLength, tickY, lineWidth)
            }
        }
    }

    const sliders = []
    const spacing = ddxSliderSpacing
    for (let i = gridRight.gridXMin; i < gridRight.gridXMax; i+=spacing) {
        sliders.push(new Slider({grid:gridRight, gridPos:i,increment:0.1,circleRadius:15}))
    }
    const tracer = new IntegralTracer({grid: gridLeft, originGridY: solutionFun(0), 
        input:{type:'sliders', sliders:sliders}, targets:adder.targets})

    const ddxTargets = []



    const text1 = {
        update: function(ctx){
            Color.setColor(ctx,Color.white)
            ctx.font = '20px monospace'
            ctx.textAlign = 'start'
            ctx.textBaseline = 'top'
            ctx.fillText('Step 1: Measure the apple\'s position over time.', 150,50)
            ctx.fillText("Click on the graph to add measurements.", 150,80)
            ctx.fillText(`Make at least ${numMeasurement} measurements, and then click continue.`, 150,110)
            ctx.translate(25,700)
            ctx.rotate(-Math.PI/2)
            ctx.fillText("Position p(t)", 0,0)
            ctx.resetTransform()
            ctx.fillText("Time t", 250, 850)
        }
    }

    const mDdxText = {
        update: function(ctx){
            Color.setColor(ctx,Color.white)
            ctx.font = '20px monospace'
            ctx.textAlign = 'start'
            ctx.textBaseline = 'top'
            ctx.fillText('Step 2: Compute the turle\'s velocity, v(t).', 150,50)
            ctx.fillText("Use the sliders to set the velocity.", 150,80)
            ctx.translate(25,700)
            ctx.rotate(-Math.PI/2)
            ctx.fillText("Position p(t)", 0,0)
            ctx.resetTransform()
            ctx.fillText("Time t", 250, 850)
            ctx.fillText("p(t) = ", 20,200)
        }
    }

    const text2 = {
        update: function(ctx){
            Color.setColor(ctx,Color.white)
            ctx.font = '20px monospace'
            ctx.textAlign = 'start'
            ctx.textBaseline = 'top'
            ctx.fillText('Step 3: Guess the apple\'s position function, p(t).', 150,50)
            ctx.fillText("Use the blocks to set the function.", 150,80)
            ctx.fillText("Click continue when you think you have it.", 150,110)
            ctx.translate(25,700)
            ctx.rotate(-Math.PI/2)
            ctx.fillText("Position p(t)", 0,0)
            ctx.resetTransform()
            ctx.fillText("Time t", 250, 850)
            ctx.fillText("p(t) = ", 20,200)
        }
    }

    const text3 = {
        update: function(ctx){
            Color.setColor(ctx,Color.white)
            ctx.font = '20px monospace'
            ctx.textAlign = 'start'
            ctx.textBaseline = 'top'
            ctx.fillText('Step 4: Guess the apple\'s velocity function, v(t).', 150,50)
            ctx.fillText("Use the blocks to set the function.", 150,80)
            ctx.fillText("Click continue when you think you have it.", 150,110)
            ctx.translate(25,700)
            ctx.rotate(-Math.PI/2)
            ctx.fillText("Velocity v(t)", 0,0)
            ctx.resetTransform()
            ctx.fillText("Time t", 250, 850)
            ctx.fillText("v(t) = ", 20,200)
            ctx.fillText("p(t) = "+solutionFunString, 600,200)
        }
    }

    const text4 = {
        update: function(ctx){
            Color.setColor(ctx,Color.white)
            ctx.font = '20px monospace'
            ctx.textAlign = 'start'
            ctx.textBaseline = 'top'
            ctx.fillText('Experiment complete!', 150,50)
            //ctx.fillText("", 150,80)
            ctx.translate(25,700)
            ctx.rotate(-Math.PI/2)
            ctx.fillText("Velocity v(t)", 0,0)
            ctx.resetTransform()
            ctx.fillText("Time t", 250, 850)
            ctx.font = '30px monospace'
            ctx.fillText("v(t) = " + solutionDdxString, 70,320)
            ctx.fillText("p(t) = "+solutionFunString, 600,200)
        }
    }

    const smallGrid = new Grid({canvasX:600, canvasY:250, canvasWidth:100, canvasHeight:100, 
        gridXMin:0, gridXMax:10, gridYMin:0, gridYMax:10, labels:false, arrows:false, lineWidthMax: 1})

    const smallTracer = new FunctionTracer({grid:smallGrid, lineWidth:4})
    
    function checkTargets(){
        var numCorrect = 0
        for (let i = 0; i < adder.targets.length; i++){
            const target = adder.targets[i]
            const gx = gridLeft.canvasToGridX(target.x)
            const gy = gridLeft.canvasToGridY(target.y)
            if (Math.abs(solutionFun(gx) - gy) < 0.3){
                numCorrect++
            }else{
                target.unhitColor = Color.gray
            }
        }
        return numCorrect
    }


    function checkFunctionsEqual(fun1, fun2){
        for (let x = 0; x <= 10; x++){
            if (Math.abs(fun1(x) - fun2(x)) > 0.00001){
                return {res:false, x:x}
            }
        }
    
        for (let x = 0; x < 10; x+= 0.1){
            if (Math.abs(fun1(x) - fun2(x)) > 0.00001){
                return {res:false, x:x}
            }
        }
        return {res:true}
    }

    const errorText = new TextBox({originX:950, originY:160, align: 'right'})

    var step = 'measureF'
    const minCorrectTargets = numMeasurement
    const SKIP_CHECKS = false // debug option
    const continueButton = new Button({originX:840, originY:50, width:100, height:60, fontSize:16,
        onclick:((audio) => {
            if (step == 'measureF'){
                const numCorrect = checkTargets()
                if (numCorrect >= minCorrectTargets || SKIP_CHECKS){
                    adder.targets = adder.targets.filter(t => t.unhitColor == Color.magenta)
                    gameState.objects = mainObjs.concat(meaureDdxObjs).concat(adder.targets)
                    funTracer.targets = adder.targets
                    tracer.targets = adder.targets
                    errorText.content = ''
                    step = 'measureDdx'
                    audio.play('confirmation_001')
                }else{
                    errorText.content = numCorrect + '/' + minCorrectTargets + ' correct measurements'
                }
            }else if (step == 'measureDdx'){
                if (tracer.solved || SKIP_CHECKS){
                    sySlider.setSize(syFunMax, syFunLen)
                    tySlider.setSize(tyFunMax, tyFunLen)

                    gameState.objects = mainObjs.concat(fitFObjs).concat(adder.targets)
                    step = 'fitF'
                }
            }else if (step == 'fitF'){
                const check = checkFunctionsEqual(solutionFun, funTracer.fun)
                if (check.res || SKIP_CHECKS){
                    audio.play('confirmation_001')
                    sySlider.setSize(syDdxMax, syDdxLen)
                    tySlider.setSize(tyDdxMax, tyDdxLen)
                    gridLeft.setYBounds(ddxMin,ddxMax)
                    for (let i = gridRight.gridXMin; i < gridRight.gridXMax; i+=spacing) {
                        ddxTargets.push(new Target({grid: gridLeft, gridX:i,
                            gridY:solutionDdx(i), size:20}))
                    }
                    smallTracer.fun = solutionFun
                    funTracer.targets = ddxTargets
                    mngr.reset()
                    errorText.content = ''
                    step = 'fitDdx'
                    gameState.objects = mainObjs.concat(fitDdxObjs).concat(ddxTargets)
                }else{
                    errorText.content = 'p(' + check.x + ') should be ' + solutionFun(check.x).toFixed(2) + ' not ' + funTracer.fun(check.x).toFixed(2)
                }
            }else if (step == 'fitDdx'){
                const check = checkFunctionsEqual(solutionDdx, funTracer.fun)
                if (check.res || SKIP_CHECKS){
                    audio.play('confirmation_001')
                    funTracer.fun = solutionDdx
                    errorText.content = ''
                    step = 'solved'
                    gameState.objects = mainObjs.concat(solvedObjs)
                    gameState.stored.completedScenes[gameState.stored.sceneName] = true
                }else{
                    errorText.content = 'v(' + check.x + ') should be ' + solutionDdx(check.x).toFixed(2) + ' not ' + funTracer.fun(check.x).toFixed(2)
                }
            }else if (step == 'solved'){ // SOLVED
                loadScene(gameState,gss.planet + '.lab')
            }
        }),
         label:"Continue"})

    const mainObjs = [backButton, gridLeft, continueButton, errorText, bgImage, tSlider, timeLabel, apple, numberLine, playPauseButton,]
    const measureFObjs = [text1, adder, ]
    const meaureDdxObjs = [mDdxText, gridRight, tracer].concat(sliders)
    const fitFObjs = [sySlider, tySlider, text2, funTracer, mngr]
    const fitDdxObjs = [sySlider, tySlider, text3, funTracer, smallGrid, smallTracer, mngr]
    const solvedObjs = [text4, funTracer, smallGrid, smallTracer]
    gameState.objects = mainObjs.concat(measureFObjs)
    gameState.update = () => {
        tSlider.active = !playing
        if (playing){
            time = (Date.now() - startTime)/1000 + startValue // time in secs to 1 decimal
            tSlider.setValue(time)
            playPauseButton.label =  '⏸'
        }else{
            playPauseButton.label =  '⏵'
            time = tSlider.value
        }
        if (time >= tMax){
            time = tMax
            playing = false
            playPauseButton.label = '⏮'
        }
        timeLabel.content = "t = " + time.toFixed(1)
    }

}



function quadMathBlockTutorial(gameState, {
    targetVals, tracerStart = 0,
    targetSize = 20, sliderSize = 15,
    nextScenes,
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
        new MathBlock({type: MathBlock.VARIABLE, token:'x'}),
        new MathBlock({type: MathBlock.POWER, token:'2'})
    ]
    const sySlider = new Slider({canvasX: 1200, canvasY: 350, maxValue:2, sliderLength:4, startValue: 1, showAxis:true})
    const tySlider = new Slider({canvasX: 1300, canvasY: 350, maxValue:2, sliderLength:4, showAxis:true})

    const mbField = new MathBlockField({minX:600, minY:100, maxX:1000, maxY:300})
    const mbm = new MathBlockManager({blocks : blocks, toolBarX: 1400, toolBarY:100, outputType:"sliders",
        scaleYSlider: sySlider, translateYSlider:tySlider,
        blockFields: [ mbField ],
        funTracers: [functionTracer],
    })

    gameState.update = ()=>{

    }

    gameState.objects = [grid, functionTracer, backButton, nextButton, mbm, sySlider, tySlider].concat(targets)
    Planet.winCon(gameState, ()=>functionTracer.solved, nextButton)
    Planet.unlockScenes(nextScenes, gss)
}

