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
    'chain.puzzle.1': [6,1, 0,-1],
    'chain.puzzle.2': [7,1, 0,-1],
    'chain.puzzle.3': [8,1, 0,-1],
    'chain.puzzle.4': [9,1, 0,-1],
    'chain.dialogue.1':[9,3, 0,1],
    'chain.puzzle.5': [10,1, 0,-1],
    'chain.puzzle.6': [11,1, 0,-1],
    'chain.puzzle.7': [12,1, 0,-1],
    'chain.puzzle.8': [13,1, 0,-1],
    'chain.puzzle.9': [14,1, 0,-1],
    'chain.puzzle.10':[15,1, 0,-1],
    'chain.puzzle.11': [6, 3, 0,-1],
    'chain.puzzle.12': [7, 3, 0,-1],
    'chain.puzzle.13': [8, 3, 0,-1],
    'chain.puzzle.14': [9, 3, 0,-1],
    'chain.puzzle.15': [10,3, 0,-1],
    'chain.puzzle.16': [11,3, 0,-1],
    'chain.puzzle.17': [12,3, 0,-1],
    'chain.puzzle.18': [13,3, 0,-1],
    'chain.puzzle.19': [14,3, 0,-1],
    'chain.puzzle.20': [15,3, 0,-1],
    'chain.lab':      [16,1, 0,-1],
}

const paths = 
[
    {start: 'planetMap', end: 'chain.puzzle.1'},
    {start: 'chain.puzzle.1', end: 'chain.puzzle.2', steps: [] },
    {start: 'chain.puzzle.2', end: 'chain.puzzle.3', steps: [] },
    {start: 'chain.puzzle.3', end: 'chain.puzzle.4', steps: [] },
    {start: 'chain.puzzle.4', end:  'chain.puzzle.5', steps: [] },
    {start: 'chain.puzzle.4', end:  'chain.dialogue.1', steps: [] },
    {start: 'chain.puzzle.5', end: 'chain.puzzle.6', steps: [] },
    {start: 'chain.puzzle.6', end: 'chain.puzzle.7', steps: [] },
    {start: 'chain.puzzle.7', end: 'chain.puzzle.8', steps: [] },
    {start: 'chain.puzzle.8', end: 'chain.puzzle.9', steps: [] },
    {start: 'chain.puzzle.9', end: 'chain.puzzle.10', steps: [] },
    {start: 'chain.puzzle.10', end: 'chain.puzzle.11', steps: [] },
    {start: 'chain.puzzle.11', end: 'chain.puzzle.12', steps: [] },
    {start: 'chain.puzzle.12', end: 'chain.puzzle.13', steps: [] },
    {start: 'chain.puzzle.13', end: 'chain.puzzle.14', steps: [] },
    {start: 'chain.puzzle.14', end: 'chain.puzzle.15', steps: [] },
    {start: 'chain.puzzle.15', end: 'chain.puzzle.16', steps: [] },
    {start: 'chain.puzzle.16', end: 'chain.puzzle.17', steps: [] },
    {start: 'chain.puzzle.17', end: 'chain.puzzle.18', steps: [] },
    {start: 'chain.puzzle.18', end: 'chain.puzzle.19', steps: [] },
    {start: 'chain.puzzle.19', end: 'chain.puzzle.20', steps: [] },
    {start: 'chain.puzzle.20', end: 'chain.lab', steps: []},
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
    gameState.stored.planet = 'chain'

    const sceneNameSplit = sceneName.toLowerCase().split('.')

    // Main scene
    if (sceneNameSplit.length == 1) {
        chainPlanet(gameState, message)
        return
    }

    // Sub-scenes
    switch(sceneNameSplit[1]){
        case "puzzle": 
            switch(sceneNameSplit[2]){
                case '1':
                    compositeFunctionTargetAdder(gameState, {innerFun: x=> Math.sin(x), outerFun: x=>x*x*x,
                        xMinInner:0, xMaxInner:10, yMinInner:-1, yMaxInner:1,  xMinOuter:-1, xMaxOuter:1, yMinOuter:-1, yMaxOuter:1, 
                        nextScenes:['chain.puzzle.2']})
                break
                // case '2':
                //     compositeFunctionTargetAdder(gameState, {innerFun: x=> Math.sin(x), outerFun: x=>x*x*x,
                //         xMinInner:0, xMaxInner:10, yMinInner:-1, yMaxInner:1,  xMinOuter:-1, xMaxOuter:1, yMinOuter:-1, yMaxOuter:1, 
                //         nextScenes:['chain.puzzle.2']})
                // break
            }
        break

        case 'dialogue':
            chainPlanet(gameState)
            case '1':
                Planet.dialogueScene(gameState, {nextScenes:["chain.puzzle.5"], text: [
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

function chainPlanet(gameState,message){
    Planet.planetScene(gameState, {
        planetName:'chain',
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

function chainMeasureDiscrete(gameState, {nextScenes=[], innerFun, outerFun,
    xMinOuter, xMaxOuter, xMinInner, xMaxInner,
    yMinOuter, yMaxOuter, yMinInner, yMaxInner,
 }){
    const gss = gameState.stored
    const backButton = Planet.backButton(gameState)
    const nextButton = Planet.nextButton(gameState, nextScenes)

    const compFun = x => outerFun(innerFun(x))
    
    const compGrid = new Grid({canvasX:100, canvasY:350, canvasWidth:400, canvasHeight:400, 
        gridXMin:xMinInner, gridXMax:xMaxInner, gridYMin:yMinInner, gridYMax:yMaxInner,
        labels:true, arrows:false, autoCellSize: true})

    const turtleGrid = new Grid({canvasX:1100, canvasY:350, canvasWidth:400, canvasHeight:400, 
        gridXMin:xMinOuter, gridXMax:xMaxOuter, gridYMin:yMinOuter, gridYMax:yMaxOuter,
        labels:true, arrows:false, autoCellSize: true})

    const ddxGrid = new Grid ({canvasX:600, canvasY:350, canvasWidth:400, canvasHeight:400, 
        gridXMin:xMinInner, gridXMax:xMaxInner, gridYMin:yMinInner, gridYMax:yMaxInner,
        labels:true, arrows:false, autoCellSize: true})

    const outerTracer = new FunctionTracer({
        grid: turtleGrid, inputFunction: outerFun,
    })

    const adder = new TargetAdder({grid: compGrid, precision: 1, solutionFun: compFun})

    /**
     * The turtle moves on top of the outer function f(x), according to the inner function g(t)
     */
    var time = 0
    var playing = true
    var startTime = Date.now()
    var startValue = 0
    const maxTime = 10

    const turtle = {
        y: 0,
        x: 0,
        size: 50,
        update: function(ctx){
            this.x = innerFun(time)
            this.y = outerFun(this.x)
            ctx.font = "50px monospace"
            ctx.translate(turtleGrid.gridToCanvasX(this.x),turtleGrid.gridToCanvasY(this.y))
            ctx.scale(-1,1)
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText("🐢", 0, 0)
            ctx.resetTransform()
        }
    }


    const tSlider = new Slider({canvasX:1100,canvasY:150,canvasLength:450,
        sliderLength:10, maxValue:10, vertical:false, increment:0.1})
    const timeLabel = new TextBox({originX:1000,originY:250, font:'26px monospace'})
    const xLabel = new TextBox({originX:1200,originY:250, font:'26px monospace'})
    const playPauseButton = new Button({originX:1000,originY:120,width:50,height:50,
        onclick: function(){
            if (time >= maxTime){
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
    

    const yLine = {
        update: (ctx, audio, mouse) => {
            Color.setColor(ctx, Color.green)
            const turtleY = turtleGrid.gridToCanvasY(turtle.y)
            Shapes.Line(ctx, compGrid.originX, turtleY, turtleGrid.originX + turtleGrid.canvasWidth, turtleY)
        }
    }
    yLine.hidden = true

    const ddxDrawer = new DrawFunction({grid: ddxGrid, numPoints:400})

    const intTracer = new IntegralTracer({grid: compGrid, input: {type:'drawFunction', drawFunction: ddxDrawer}, animated:false})

    gameState.objects = [backButton, nextButton, compGrid,turtleGrid, adder, outerTracer, turtle, timeLabel,
        ddxGrid, ddxDrawer, intTracer,
         xLabel, playPauseButton, tSlider, yLine]
    gameState.update = ()=> {
        console.log(intTracer.state, intTracer.pixelIndex, intTracer.currentY, intTracer.currentX)
        if (playing){
            time = (Date.now() - startTime)/1000 + startValue // time in secs to 1 decimal
            tSlider.moveToValue(time)
            playPauseButton.label =  '⏸'
        }else{
            playPauseButton.label =  '⏵'
            if (adder.overGrid){
                tSlider.moveToValue(adder.targetGX)
            }
            yLine.hidden = !adder.overGrid
            time = tSlider.value
        }
        if (time >= maxTime){
            time = maxTime
            playing = false
        }
        timeLabel.content = "t = " + time.toFixed(1)
        xLabel.content = "x = " + innerFun(time).toFixed(1)
        intTracer.targets = adder.targets
    }
    
    Planet.winCon(gameState, ()=> false, nextButton)
    Planet.unlockScenes(nextScenes, gss)
}


function compositeFunctionTargetAdder(gameState, {nextScenes=[], innerFun, outerFun,
    xMinOuter, xMaxOuter, xMinInner, xMaxInner,
    yMinOuter, yMaxOuter, yMinInner, yMaxInner,
 }){
    const gss = gameState.stored
    const backButton = Planet.backButton(gameState)
    const nextButton = Planet.nextButton(gameState, nextScenes)

    const compFun = x => outerFun(innerFun(x))
    
    const compGrid = new Grid({canvasX:900, canvasY:350, canvasWidth:400, canvasHeight:400, 
        gridXMin:xMinInner, gridXMax:xMaxInner, gridYMin:yMinInner, gridYMax:yMaxInner,
        labels:true, arrows:false, autoCellSize: true,
        xAxisLabel:"t", yAxisLabel:"y",
    })

    const turtleGrid = new Grid({canvasX:300, canvasY:350, canvasWidth:400, canvasHeight:400, 
        gridXMin:xMinOuter, gridXMax:xMaxOuter, gridYMin:yMinOuter, gridYMax:yMaxOuter,
        labels:true, arrows:false, autoCellSize: true,
        xAxisLabel:"x", yAxisLabel:"y",
    })

    const outerTracer = new FunctionTracer({
        grid: turtleGrid, inputFunction: outerFun,
    })

    const adder = new TargetAdder({grid: compGrid, xPrecision: 0.01, yPrecision:0.01, solutionFun: compFun})

    /**
     * The turtle moves on top of the outer function f(x), according to the inner function g(t)
     */
    var time = 0
    var playing = true
    var startTime = Date.now()
    var startValue = 0
    const maxTime = 10

    const turtle = {
        y: 0,
        x: 0,
        size: 50,
        update: function(ctx){
            this.x = innerFun(time)
            this.y = outerFun(this.x)
            ctx.font = "50px monospace"
            ctx.translate(turtleGrid.gridToCanvasX(this.x),turtleGrid.gridToCanvasY(this.y))
            ctx.scale(-1,1)
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            ctx.fillText("🐢", 0, 0)
            ctx.resetTransform()
        }
    }


    const tSlider = new Slider({canvasX:900,canvasY:150,canvasLength:400,
        sliderLength:10, maxValue:10, vertical:false, increment:0.1})
    const timeLabel = new TextBox({originX:1000,originY:250, font:'26px monospace'})
    const xLabel = new TextBox({originX:1200,originY:250, font:'26px monospace'})
    const playPauseButton = new Button({originX:800,originY:120,width:50,height:50,
        onclick: function(){
            if (time >= maxTime){
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
    

    const yLine = {
        update: (ctx, audio, mouse) => {
            Color.setColor(ctx, Color.green)
            const turtleY = turtleGrid.gridToCanvasY(turtle.y)
            Shapes.Line(ctx, turtleGrid.gridToCanvasX(turtle.x), turtleY,compGrid.originX, turtleY)
        }
    }
    yLine.hidden = true

    gameState.objects = [backButton, nextButton, compGrid,turtleGrid, adder, outerTracer, turtle, timeLabel,
         xLabel, playPauseButton, tSlider, yLine]
    gameState.update = ()=> {
        if (playing){
            time = (Date.now() - startTime)/1000 + startValue // time in secs to 1 decimal
            tSlider.moveToValue(time)
            playPauseButton.label =  '⏸'
        }else{
            playPauseButton.label =  '⏵'
            if (adder.overGrid){
                tSlider.moveToValue(adder.targetGX)
            }
            yLine.hidden = !adder.overGrid
            time = tSlider.value
        }
        if (time >= maxTime){
            time = maxTime
            playing = false
        }
        timeLabel.content = "t = " + time.toFixed(1)
        xLabel.content = "x = " + innerFun(time).toFixed(1)
    }
    
    Planet.winCon(gameState, ()=> false, nextButton)
    Planet.unlockScenes(nextScenes, gss)
}
