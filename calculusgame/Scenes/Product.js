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
    'product.puzzle.1': [6,1, 0,-1],
    'product.puzzle.2': [7,1, 0,-1],
    'product.puzzle.3': [8,1, 0,-1],
    'product.puzzle.4': [9,1, 0,-1],
    'product.dialogue.1':[9,3, 0,1],
    'product.puzzle.5': [10,1, 0,-1],
    'product.puzzle.6': [11,1, 0,-1],
    'product.puzzle.7': [12,1, 0,-1],
    'product.puzzle.8': [13,1, 0,-1],
    'product.puzzle.9': [14,1, 0,-1],
    'product.puzzle.10':[15,1, 0,-1],
    'product.puzzle.11': [6, 3, 0,-1],
    'product.puzzle.12': [7, 3, 0,-1],
    'product.puzzle.13': [8, 3, 0,-1],
    'product.puzzle.14': [9, 3, 0,-1],
    'product.puzzle.15': [10,3, 0,-1],
    'product.puzzle.16': [11,3, 0,-1],
    'product.puzzle.17': [12,3, 0,-1],
    'product.puzzle.18': [13,3, 0,-1],
    'product.puzzle.19': [14,3, 0,-1],
    'product.puzzle.20': [15,3, 0,-1],
    'product.lab':      [16,1, 0,-1],
}

const paths = 
[
    {start: 'planetMap', end: 'product.puzzle.1'},
    {start: 'product.puzzle.1', end: 'product.puzzle.2', steps: [] },
    {start: 'product.puzzle.2', end: 'product.puzzle.3', steps: [] },
    {start: 'product.puzzle.3', end: 'product.puzzle.4', steps: [] },
    {start: 'product.puzzle.4', end:  'product.puzzle.5', steps: [] },
    {start: 'product.puzzle.4', end:  'product.dialogue.1', steps: [] },
    {start: 'product.puzzle.5', end: 'product.puzzle.6', steps: [] },
    {start: 'product.puzzle.6', end: 'product.puzzle.7', steps: [] },
    {start: 'product.puzzle.7', end: 'product.puzzle.8', steps: [] },
    {start: 'product.puzzle.8', end: 'product.puzzle.9', steps: [] },
    {start: 'product.puzzle.9', end: 'product.puzzle.10', steps: [] },
    {start: 'product.puzzle.10', end: 'product.puzzle.11', steps: [] },
    {start: 'product.puzzle.11', end: 'product.puzzle.12', steps: [] },
    {start: 'product.puzzle.12', end: 'product.puzzle.13', steps: [] },
    {start: 'product.puzzle.13', end: 'product.puzzle.14', steps: [] },
    {start: 'product.puzzle.14', end: 'product.puzzle.15', steps: [] },
    {start: 'product.puzzle.15', end: 'product.puzzle.16', steps: [] },
    {start: 'product.puzzle.16', end: 'product.puzzle.17', steps: [] },
    {start: 'product.puzzle.17', end: 'product.puzzle.18', steps: [] },
    {start: 'product.puzzle.18', end: 'product.puzzle.19', steps: [] },
    {start: 'product.puzzle.19', end: 'product.puzzle.20', steps: [] },
    {start: 'product.puzzle.20', end: 'product.lab', steps: []},
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
}


export function loadScene(gameState, sceneName, message = {}){
    gameState.stored.planet = 'product'

    const sceneNameSplit = sceneName.toLowerCase().split('.')

    // Main scene
    if (sceneNameSplit.length == 1) {
        productPlanet(gameState, message)
        return
    }

    // Sub-scenes
    switch(sceneNameSplit[1]){
        case "puzzle": 
            switch(sceneNameSplit[2]){
                case '1':
                    productSliderLevel(gameState, {numSliders:1, sliderSize:15, gridYMin:-2, gridYMax:2,gridXMin:0,gridXMax:1,
                        productTargetValues: [0.5], f1TargetValues : [-1],
                        f1TracerStart:-0.5, prodTracerStart:0, f2TracerStart:0.5,
                            nextScenes:["product.puzzle.2"]})
                break
                case '2':
                    productSliderLevel(gameState, {numSliders:1, sliderSize:15, gridYMin:-2, gridYMax:2,gridXMin:0,gridXMax:1,
                        productTargetValues: [1], f1TargetValues : [2],
                        f1TracerStart:0, prodTracerStart:0, f2TracerStart:0,
                            nextScenes:["product.puzzle.3"]})
                break
                case '3':
                    productSliderLevel(gameState, {numSliders:1, sliderSize:15, gridYMin:-2, gridYMax:2,gridXMin:0,gridXMax:1,
                        productTargetValues: [-2], f1TargetValues : [2],
                        f1TracerStart:0, prodTracerStart:0, f2TracerStart:0,
                            nextScenes:["product.puzzle.4"]})
                break
                case '4':
                    productSliderLevel(gameState, {numSliders:1, sliderSize:15, gridYMin:-2, gridYMax:2,gridXMin:0,gridXMax:1,
                        productTargetValues: [0], f1TargetValues : [1],
                        f1TracerStart:0, prodTracerStart:0, f2TracerStart:0,
                            nextScenes:["product.puzzle.5"]})
                break
                case '5':
                    productSliderLevel(gameState, {numSliders:2, sliderSize:15, gridYMin:-2, gridYMax:2,gridXMin:0,gridXMax:2,
                        productTargetValues: [-1,0], f1TargetValues : [1,1.5],
                        f1TracerStart:0, prodTracerStart:0, f2TracerStart:0,
                            nextScenes:["product.puzzle.6"]})
                break
                case '6':
                    productSliderLevel(gameState, {numSliders:2, sliderSize:15, gridYMin:-2, gridYMax:2,gridXMin:0,gridXMax:2,
                        productTargetValues: [1,1], f1TargetValues : [2,0.5],
                        f1TracerStart:0, prodTracerStart:0, f2TracerStart:0,
                            nextScenes:["product.puzzle.7"]})
                break
                case '7':
                    productSliderLevel(gameState, {numSliders:4, sliderSize:15, gridYMin:-2, gridYMax:2,gridXMin:0,gridXMax:4,
                        productTargetValues: [-0.25,0.5,-1.5,1.5], f1TargetValues : [0.5,1,1.5,2],
                        f1TracerStart:0, prodTracerStart:0, f2TracerStart:0,
                            nextScenes:["product.puzzle.8"]})
                break
                case '8':
                    productSliderLevel(gameState, {numSliders:4, sliderSize:15, gridYMin:-2, gridYMax:2,gridXMin:0,gridXMax:4,
                        productTargetValues: [-0.25,0.5,-1.5,2], f1TargetValues : [0.5,1,1.5,2],
                        f1TracerStart:0, prodTracerStart:2, f2TracerStart:0,
                            nextScenes:["product.puzzle.9"]})
                break
                case '9':
                    productSliderLevel(gameState, {numSliders:4, sliderSize:15, gridYMin:-2, gridYMax:2,gridXMin:0,gridXMax:1,
                        productTargetValues: [-0.25,0.5,-1.5,2], f1TargetValues : [0.5,1,1.5,2],
                        f1TracerStart:0, prodTracerStart:2, f2TracerStart:0,
                            nextScenes:["product.puzzle.10"]})
                break
                
            }
        break

        case 'dialogue':
            productPlanet(gameState)
            case '1':
                Planet.dialogueScene(gameState, {nextScenes:["product.puzzle.5"], text: [
                    'Dialogue',
                ]})
            break

        case "lab":
            Experiment.experimentMenu(gameState, {experimentData: experimentData})
            break
        
        case "trial":
            if (sceneNameSplit[2] == 'rule') {
                Experiment.ruleGuess(gameState, {})
            } else {
                quadExperimentTrial(gameState, experimentData[sceneNameSplit[2]])
            } 
            break
    }
}

function productPlanet(gameState,message){
    Planet.planetScene(gameState, {
        planetName:'product',
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



function productExperimentTrial(gameState, {
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

    const rectangle = {
        originX:1100,
        originY:800,
        update: function(ctx){
            const y = this.originY - (Math.max(0,solutionFun(time)) * maxDist / 10)
            
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

    const rectGrid = new Grid({canvasX:1100, canvasY:400, width:400, height:400,
    })

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
            ctx.fillText('Step 1: Measure the area of the rectangle.', 150,50)
            ctx.fillText("Width: sin(t). Height: x^2.", 150,80)
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


function productSliderLevel (gameState, {
    numSliders,
    prodTracerStart=0,
    f1TracerStart=0,
    f2TracerStart=0,
    targetSize = 20, sliderSize = 15,
    nextScenes, 
    gridXMax=2,
    gridYMax=2,
    gridYMin=-2,
    gridXMin=-2,
    increment=0.1,
    productTargetValues, 
    f1TargetValues,
}){
    const f1Color = Color.yellow
    const f2Color = Color.magenta
    const productColor = Color.red
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
            increment: increment,circleRadius:sliderSize,circleColor:f1Color,
        }))
        f2Sliders.push(new Slider({grid:gridRight, gridPos:gridRight.gridXMin + i * spacing,
            increment: increment,circleRadius:sliderSize,circleColor:f2Color}))
    }
    
    var productTargets = []
    var f1Targets = []
    for (let i = 0; i < numSliders; i++) {
        const x = gridLeft.gridXMin+(i+1)*spacing
        f1Targets.push(new Target({grid: gridLeft, gridX:x, gridY:f1TargetValues[i], size:targetSize,unhitColor:f1Color}))
        productTargets.push(new Target({grid: gridLeft, gridX:x, gridY:productTargetValues[i], size:targetSize, unhitColor:productColor}))
    }
    

    
    const f2Tracer = new IntegralTracer({grid: gridLeft, input:{type:'sliders', sliders: f2Sliders}, originGridY:f2TracerStart, 
        unsolvedColor:f2Color,
    })
    const f1Tracer = new IntegralTracer({grid: gridLeft, input:{type:'sliders', sliders: f1Sliders}, targets:f1Targets, originGridY:f1TracerStart,
        unsolvedColor:f1Color,
    })
    const prodTracer = new FunctionTracer({grid: gridLeft, 
        inputFunction: x => {
            return f1Tracer.outputY(x)*f2Tracer.outputY(x)
        },
        targets:productTargets, originGridY:0, animated:true, autoStart:true,
        resetCondition: ()=> f1Tracer.state == FunctionTracer.STOPPED_AT_BEGINNING || f2Tracer.state == FunctionTracer.STOPPED_AT_BEGINNING
    })

    gameState.objects = [gridLeft, gridMiddle, gridRight, f1Tracer, f2Tracer, prodTracer,
         backButton, nextButton].concat(f1Targets).concat(productTargets).concat(f1Sliders).concat(f2Sliders)
    gameState.update = ()=> {
    }

    Planet.winCon(gameState, ()=>prodTracer.solved&&f1Tracer.solved, nextButton)
    Planet.unlockScenes(nextScenes, gss)
}