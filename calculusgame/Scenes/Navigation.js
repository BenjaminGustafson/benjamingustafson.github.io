import {Color, Shapes} from '../util/index.js'
import {Grid, FunctionTracer, Button, ImageObject, IntegralTracer, MathBlock, MathBlockManager, MathBlockField, Slider, Target, TargetAdder, TextBox} from '../GameObjects/index.js'
import { loadScene, CANVAS_HEIGHT } from '../Scene.js'

/**
 * NAVIGATION
 * 
 * When the player travels to a new planet, they must pass a series of navigation levels.
 * These levels are styled as navigating through asteroids.
 * 
 * The player gains mastery of a puzzle type by answering correctly and loses mastery
 * on an incorrect answer.
 * 
 *  
 * 
 * After a planet has been reached, the player can teleport to it at any time.
 * The player can also bring up practice puzzles from completed planets.
 * 
 * 
 * 
 */


/**
 * 
 * The randomly generated navigation levels
 * 
 * 
 * 
 * 
 */
export function navScene(gameState) {
    const gss = gameState.stored
    const prevPlanet = gss.planet
    const nextPlanet = gss.nextPlanet

    
    //gss.currentNavFunction = null
    var mathBlockFun = new MathBlock({})
    if (gss.currentNavFunction != null){
        // Rehydrate object
        mathBlockFun = MathBlock.rehydrate(gss.currentNavFunction)
    }else{
        mathBlockFun = newRNGPuzzle(gameState)
    }
    // DEBUG
    //mathBlockFun = newRNGPuzzle(gameState)
    var fun = mathBlockFun.toFunction()
    
    
    const padLeft = 100
    const gridDim = 400
    const padBottom = 100
    const intDist = Math.floor(gameState.stored.totalDistance)
    const gridY = CANVAS_HEIGHT-padBottom-gridDim

    const gridLeft = new Grid({
        canvasX:100, canvasY:400,
        canvasWidth:400, canvasHeight:400, 
        gridXMin:-10, gridXMax:10, gridYMin:-10, gridYMax:10,
        labels:true, arrows:false, 
        autoCellSize:true,
    })
    const gridRight = new Grid({
        canvasX:600, canvasY:gridY,
        canvasWidth:400, canvasHeight:400, 
        gridXMin:-10, gridXMax:10, gridYMin:-10, gridYMax:10,
        labels:true, arrows:false, 
        autoCellSize:true,
    })
    //const gridRight = new Grid(padLeft+gridDim+100, gridY, gridDim, gridDim, grid_setting.grid_width, grid_setting.grid_height, 5, 4, 0, labels=true)
    const tySlider = new Slider({
        canvasX: 1200, canvasY:gridY, canvasLength:400,
        sliderLength: 10, maxValue: 5, showAxis: true, lineWidth:3
    })
    const sySlider = new Slider({
        canvasX: 1100, canvasY: gridY, canvasLength: 400,
        sliderLength: 10, maxValue: 5, startValue: 1,showAxis: true, lineWidth:3
    })
    const funRight = new FunctionTracer({grid:gridRight, lineWidth:5, xStep:0.1})

    const funLeft = new FunctionTracer({grid:gridLeft, fun:fun, lineWidth:5, xStep:0.1, color:Color.magenta})

    const mathBlocks = [
        new MathBlock({type:MathBlock.CONSTANT}),
        new MathBlock({type:MathBlock.VARIABLE, token:'x'}),
        new MathBlock({type:MathBlock.POWER, token:'2'}),
        new MathBlock({type:MathBlock.POWER, token:'3'}),
        new MathBlock({type:MathBlock.EXPONENT}),
        new MathBlock({type:MathBlock.FUNCTION, token:'sin'}),
        new MathBlock({type:MathBlock.FUNCTION, token:'cos'}),
        new MathBlock({type:MathBlock.BIN_OP, token:'+'}),
        new MathBlock({type:MathBlock.BIN_OP, token:'*'}),
        new MathBlock({type:MathBlock.BIN_OP, token:'/'}),
    ]
    // const mathBlocks = [new MathBlock({type:MathBlock.VARIABLE, token:'x'})]
    // for (let b of gss.mathBlocksUnlocked){
    //     mathBlocks.push(new MathBlock({type: b.type, token: b.token}))
    // }


    const blockField = new MathBlockField({minX: 600, minY:250, maxX: 1200, maxY:350})
    const mngr = new MathBlockManager({
        blocks:mathBlocks, blockSize:26,
        translateYSlider:tySlider, scaleYSlider:sySlider, 
        toolBarX:1400, toolBarY: 250,
        blockFields: [blockField],
        funTracers: [funRight],
    })
    
    const targets = []
    const numTargets = 400
    for (let i = 0; i < numTargets - 1; i++) {
        const x = gridLeft.gridXMin + (i + 1) / numTargets * gridLeft.gridWidth
        const y = fun(x)
        if (y <= gridLeft.gridYMax && y >= gridLeft.gridYMin){
            targets.push(new Target({grid: gridLeft, gridX: x, gridY: y, size:5}))
        }
    }


    const tracer = new IntegralTracer({grid: gridLeft, blockField: blockField,
         targets:targets, originGridY: fun(gridLeft.gridXMin), pixelsPerSec:100, autoCalculate:false,
        precision:0.0001})

    const shipIcon = document.getElementById("shipicon_img");
    const linIcon = document.getElementById("linearicon_img");
    const quadIcon = document.getElementById("quadraticicon_img");
    const progressBar = {
        dist: 0,
        originX: 1100,
        length: 400,
        update: function(ctx){
            const originY = 100
            const numTicks = 10
            const tickLength = 10
            const lineWidth = 5
            const canvasDist = this.dist/planetDistance * this.length
            Color.setColor(ctx, Color.white)
            Shapes.RoundedLine(ctx, this.originX, originY, this.originX + this.length, originY, lineWidth)
            Color.setColor(ctx, Color.blue)
            Shapes.RoundedLine(ctx, this.originX, originY, this.originX + canvasDist, originY, lineWidth)
            Color.setColor(ctx, Color.white)
            ctx.font = '20px monospace'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'top'
            ctx.fillText(`${prevPlanet[0].toUpperCase() + prevPlanet.slice(1)} Planet`, this.originX, originY-60)
            ctx.fillText(`${nextPlanet[0].toUpperCase() + nextPlanet.slice(1)} Planet`, this.originX+this.length, originY-60)
            ctx.fillText(`${this.dist.toFixed(0)} u traveled`, this.originX+this.length/2, originY-60)
            ctx.fillText('0 u', this.originX, originY+25)
            ctx.fillText(`${planetDistance} u`, this.originX+this.length, originY+25)
            

            for (let i = 0; i < numTicks + 1; i++) {
                const tickX = this.originX + this.length / numTicks * i
                
                //ctx.fillText(i, tickX, originY + tickLength + 5)
                if (tickX < this.originX + canvasDist){
                    Color.setColor(ctx, Color.blue)
                }else{
                    Color.setColor(ctx, Color.white)
                }
                Shapes.RoundedLine(ctx, tickX, originY - tickLength, tickX, originY + tickLength, lineWidth)
            }
            const iconSize = 40
            ctx.drawImage(shipIcon, this.originX + canvasDist-iconSize/2, originY-iconSize/2, iconSize,iconSize)
            ctx.drawImage(linIcon, this.originX-70, originY-iconSize/2, iconSize,iconSize)
            ctx.drawImage(quadIcon, this.originX+this.length +30, originY - iconSize/2, iconSize,iconSize)

        }
    }

    // Asteroids
    const shipViewer = {
        shipImg: document.getElementById("shipSide"),
        asteroidImg: document.getElementById("asteroidImg"),
        originX: 300,
        originY:50,
        width:650,
        height:150,
        shipX: fun(-10),
        shipWidth:3,
        asteroids:[],
        update: function(ctx, audio, mouse){
            Color.setFill(ctx, Color.darkBlack)
            ctx.save()
            ctx.beginPath()
            ctx.rect(this.originX, this.originY, this.width, this.height)
            ctx.clip()
            Shapes.Rectangle({ctx:ctx, originX:this.originX, originY:this.originY, width:this.width,height:this.height,inset:true} )
            if (state == 'Trace'){
                this.shipX = tracer.currentValue
                this.shipXMin = this.shipX - this.shipWidth/2
                this.shipXMax = this.shipX + this.shipWidth/2
            }
            ctx.save() // Local coordinates at center of rect
            ctx.translate(this.originX + this.width/2, this.originY + this.height/2)
            ctx.scale((this.width-100)/20,(this.width-100)/20)
            ctx.save() // Flip ship if needed
            ctx.translate(this.shipX,0)
            if (tracer.currentDelta < 0) ctx.scale(-1,1)
            ctx.drawImage(this.shipImg, -this.shipWidth/2,-this.shipWidth/3/2,this.shipWidth,this.shipWidth/3)
            ctx.restore() // Back to local coords
            const t = tracer.currentX
            if (state == 'Trace'){
                var hit = false
                for (let asteroid of this.asteroids){
                    if (asteroid.y(t) > -5 && asteroid.y(t) < 5)
                        ctx.drawImage(this.asteroidImg, asteroid.x-0.5,asteroid.y(t)-0.5, 1,1)
                    if (this.checkCollision(asteroid, this.shipX, t)){
                        hit = true
                    }
                }
                if (hit){
                    ctx.fillStyle = `rgb(255,0,0,0.5)`
                    ctx.fillRect(this.shipX - this.shipWidth/2, - this.shipWidth/3/2, this.shipWidth,this.shipWidth/3)
                }
            }
            this.prevShipX = this.shipX
            ctx.restore() // back to global coords
            ctx.restore() // unclip
            // for (let asteroid of this.asteroids){
            //     Color.setColor(ctx,asteroid.color)
            //     ctx.fillRect(gridLeft.gridToCanvasX(asteroid.tIntercept)-10,gridLeft.gridToCanvasY(asteroid.x), 20,20)
            // }
            // for (let i = -10; i < 10; i+=0.1){
            //     Color.setColor(ctx,Color.magenta)
            //     ctx.strokeRect(gridLeft.gridToCanvasX(i)-30,gridLeft.gridToCanvasY(fun(i))-10, 60,20)
            // }
        },
        generateAsteroids: function(){

            outerLoop: for (let i = 0; i < 100; i++){
                const asteroid = {
                    x: Math.random()*20-10, 
                    tIntercept: Math.random()*20-10,
                    slope: (Math.floor(Math.random()*2)*4-2),
                    y: function(t){
                        return this.slope * t - this.tIntercept * this.slope
                    },
                    color: Color.red,
                }
                for (let t = asteroid.tIntercept-0.5; t <= asteroid.tIntercept + 0.5; t+=0.01){
                    if (this.checkCollision(asteroid, fun(t), t)){
                        continue outerLoop
                        //asteroid.color = Color.blue
                    }
                }
                this.asteroids.push(asteroid)
            }
        },
        checkCollision: function(asteroid, shipX, time){
            if (asteroid.y(time) -0.5 > 0.5 || asteroid.y(time) + 0.5 < -0.5 
            || asteroid.x > shipX + this.shipWidth/2 || asteroid.x+1 < shipX - this.shipWidth/2){
                 return false
            }else {
                return true
            }
        },
    }

    shipViewer.generateAsteroids()

    const backButton = new Button({originX: 50, originY: 50, width:50, height:50,
         onclick:(() => loadScene(gameState,"planetMap")), label:"↑", lineWidth:5})


    const startButton = new Button({originX: 150, originY: 50, width: 100, height:100,label:"Start"})


    //const targetText = new TextBox(padLeft, gridY-40, funString, font = '40px monospace', color = Color.white)
    const axisLabels = {
        update: function(ctx){
            ctx.font = '20px monospace'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'top'
            Color.setColor(ctx, Color.white)
            ctx.fillText("Time", padLeft + 200, gridY+gridDim+50)
            ctx.fillText("Time", 800, gridY+gridDim+50)
            ctx.translate(padLeft -70,600)
            ctx.rotate(-Math.PI/2)
            ctx.fillText("Position", 0, 0)
            ctx.resetTransform()
            ctx.translate(540,600)
            ctx.rotate(-Math.PI/2)
            ctx.fillText("Velocity", 0, 0)
            ctx.resetTransform()
        }
    }
    

    const strikes = {
        update: (ctx) => {
            for (let i = 0; i < 3; i++) {
                if (gameState.stored.strikes <= i) {
                    Color.setColor(ctx, Color.white)
                    if(state == "Solved" && gameState.stored.strikes == i) {
                        Color.setColor(ctx, Color.blue)
                    }
                } else {
                    Color.setColor(ctx, Color.red)
                }
                Shapes.Circle({ctx:ctx, centerX:160 + i * 40, centerY:200, radius:16})
            }
        }
    }

    const toolTip = {
        visible: true,
        update: function(ctx) {
            if (!this.visible){
                return
            }
            ctx.font = '20px monospace'
            ctx.textAlign = 'left'
            ctx.textBaseline = 'top'
            Color.setColor(ctx, Color.white)
            ctx.fillText("Drag a block", 1100, 360)
            ctx.fillText("to set function", 1100, 400)
            Shapes.Line(ctx, 1250,320,1100,320,5,"arrow",5,true)
        }
    }

    /**
     * Navigation level loop:
     * - Travel: The ship moves closer to destination, and the progress bar updates.
     *  UI elements are frozen until travelling is done and we go to Input
     * - Input: Asteroid field warning appears. The user puts in input with mathblocks.
     *  Waits until start button is pushed. 
     * - Trace: The input function is traced and we see if it hits any asteroids. 
     * - Strikeout: The result of the trace is a failure 3 times. Go back to Input with a new function.
     * - Success: The result of the trace is a success. Wait for continue button to go to travelling.
     */
    const mainObjs  = [gridLeft, gridRight, shipViewer, tySlider, sySlider, startButton, axisLabels, strikes, progressBar, backButton]
    
    var state = "Travel"

    var startTime = 0 // Date.now() for keeping track of time in state
    const travelDistance = 100 // how far is travelled at a time
    var startDistance = 0 // Distance at start of travel animation
    const planetDistance = 500 // Distance from start to destination
    const travelTime = 0.8 // Seconds of travel animation
    
    // DEBUG
    // progressBar.dist = 100
    // gss.navDistance = 100

    function changeToState(newState){
        switch (newState){
            case 'Travel':
                startButton.active = false
                startTime = Date.now()
                mngr.frozen = true
                startDistance = gss.navDistance - travelDistance
                gameState.objects = mainObjs.concat([])
                gameState.objects.push(mngr)
            break
            case 'Input':
                mngr.frozen = false
                startButton.label = "Start"
                startButton.onclick = () => {changeToState('Trace')}
                gameState.objects = mainObjs.concat([funLeft, funRight, tracer, mathBlockFun]).concat(targets)
                gameState.objects.push(mngr)
            break
            case 'Trace':
                tracer.frame = 0
                tracer.reset()
                tracer.start()
                startButton.active = false
                mngr.frozen = true
                gameState.objects = mainObjs.concat([funLeft, funRight, tracer, mathBlockFun]).concat(targets)
                gameState.objects.push(mngr)
            break
            case 'Solved':
                gss.navDistance += travelDistance
                startButton.active = true
                startButton.label = "Next"
                startButton.onclick = () => {
                    gss.currentNavFunction = null
                    gss.strikes = 0
                    loadScene(gameState, 'navigation')
                }
            break
            case 'Strikeout':
                startButton.active = true
                startButton.label = "Next"
                startButton.onclick = () => {
                    gss.currentNavFunction = null
                    gss.strikes = 0
                    loadScene(gameState, 'navigation')
                }
            break
            case 'Finish':
                startButton.active = true
                startButton.label = "Done"
                startButton.onclick = () => {
                    loadScene(gameState, gss.nextPlanet)
                }
                break
        }
        state = newState
    }
    changeToState('Travel')

    gameState.update = () => {
        switch (state) {
            case 'Travel':{
                const deltaTime = (Date.now() - startTime)/1000
                if (progressBar.dist >= planetDistance){
                    progressBar.dist = planetDistance
                    changeToState('Finish')
                } else if (progressBar.dist >= gss.navDistance){
                    progressBar.dist = gss.navDistance
                    changeToState('Input')
                }else{
                    progressBar.dist = startDistance + deltaTime / travelTime * travelDistance  
                }
            }
            break
            case "Input":{

                if (blockField.rootBlock != null && blockField.rootBlock.toFunction() != null) {
                    startButton.active = true
                } else {
                    startButton.active = false
                }
            }
                break
            case "Trace":{
                if (tracer.state == tracer.STOPPED_AT_END) {
                    // Correct answer
                    if (tracer.solved) {
                        updateNavigationProgress(gameState, gss.currentNavPuzzleType, 1)
                        changeToState('Solved')
                    // Incorrect answer
                    } else {
                        updateNavigationProgress(gameState, gss.currentNavPuzzleType, 0)
                        gameState.stored.strikes += 1
                        if (gameState.stored.strikes == 3) {
                            changeToState('Strikeout')
                        } else {
                            changeToState('Input')
                        }
                    }
                }
            }
                break
            case "Solved":
                break
            case "Strikeout":
                break
            default:
                break
        }
    }
    //gss.currentNavFunction = MathBlock.dehydrate(mathBlockFun)
}


/**
 * Create a random mathblock
 */
function randSimpleBlock (composable = false) {
    const i = Math.floor(Math.random()*(composable ? 3 : 4)) 
    const block = new MathBlock({})
    const m = Math.floor((Math.random()*10-5)*10)/10
    switch (i){
        case 0:
            block.type = MathBlock.POWER
            const p = Math.floor(Math.random()*2)+2
            block.token = p.toString()
            block.scaleY = Math.floor((Math.random()*10-5)*10 / (p+0.2))/10
            block.setChild(0,new MathBlock({type:MathBlock.VARIABLE, token:'x'}))
            break
        case 1:
            block.type = MathBlock.EXPONENT
            block.token = 'e'
            block.scaleY = m
            block.setChild(0,new MathBlock({type:MathBlock.VARIABLE, token:'x'}))
            break
        case 2:
            block.type = MathBlock.FUNCTION
            block.token = 'sin'
            block.scaleY = m
            block.setChild(0,new MathBlock({type:MathBlock.VARIABLE, token:'x'}))
            break
        // Non-composable
        case 3:
            block.type = MathBlock.VARIABLE
            block.token = 'x'
            block.scaleY = m
            break
    }
    return block
}

/**
 * 
 * Assuming that there is one type of puzzle for each planet,
 * gameState.stored.puzzleMastery is indexed the same as other planet arrays.
 * 
 * @param {*} gameState 
 * @returns 
 */
function newRNGPuzzle (gameState){

    const gss = gameState.stored
    gss.strikes = 0
    var puzzleMastery = gss.navPuzzleMastery

    const DEBUG = true
    if (DEBUG){
        puzzleMastery = {
            'linear':0,
            'quadratic':0,
            'cubic':0,
            'exponential':0,
            'sine':0,
            'sum':0,
            'product':0,
            'chain':0,
        }
    }
    // Pick puzzle type so that probability of each type is proportional to (1-mastery)
    var sum = 0
    for (const key in puzzleMastery){
        sum += 1 - puzzleMastery[key]
    }
    const randNum = Math.random()*sum
    var puzzleType = ''
    var sum2 = 0
    for (const key in puzzleMastery){
        sum2 += 1 - puzzleMastery[key]
        if (randNum < sum2){
            puzzleType = key
            break
        }
    }
    gss.currentNavPuzzleType = puzzleType

    var mathBlockFun = null
    switch (puzzleType.toLowerCase()){
        case "chain":{ 
            mathBlockFun = randSimpleBlock(true)
            mathBlockFun.setChild(0, randSimpleBlock())
        }
            break
        case "product":{ 
            mathBlockFun = new MathBlock({type:MathBlock.BIN_OP , token:'*'})
            mathBlockFun.setChild(0, randSimpleBlock())
            mathBlockFun.setChild(1, randSimpleBlock())
        }
            break
        case "sum":{ 
            mathBlockFun = new MathBlock({type:MathBlock.BIN_OP , token:'+'})
            mathBlockFun.setChild(0, randSimpleBlock())
            mathBlockFun.setChild(1, randSimpleBlock())
        }
            break
        case "exponential":{
            // m e^x + b -> m e^x
            const m = Math.floor((Math.random()*10-5)*10)/10
            const b = Math.floor((Math.random()*10-5)*10)/10
            mathBlockFun = new MathBlock({type: MathBlock.EXPONENT, token:'e'})
            mathBlockFun.translateY = b
            mathBlockFun.scaleY = m
            mathBlockFun.children[0] = new MathBlock({type:MathBlock.VARIABLE,token: 'x'})
            break
        }
        case "sine":{
            // m sine(x) + b -> m cos (x)
            const m = Math.floor((Math.random()*10-5)*10)/10
            const b = Math.floor((Math.random()*10-5)*10)/10
            mathBlockFun = new MathBlock({type: MathBlock.FUNCTION, token:'sin'})
            mathBlockFun.translateY = b
            mathBlockFun.scaleY = m
            mathBlockFun.children[0] = new MathBlock({type:MathBlock.VARIABLE,token: 'x'})
            break
        }
        case "cubic":{
            // m x^3 + b -> 3 m x
            const m = Math.floor((Math.random()*3.2-1.6)*10)/10
            const b = Math.floor((Math.random()*10-5)*10)/10
            mathBlockFun = new MathBlock({type: MathBlock.POWER, token:'3'})
            mathBlockFun.translateY = b
            mathBlockFun.scaleY = m
            mathBlockFun.children[0] = new MathBlock({type:MathBlock.VARIABLE,token: 'x'})
            break
        }
        case "quadratic":{
            // m x^2 + b -> 2 m x
            const m = Math.floor((Math.random()*5-2.5)*10)/10
            const b = Math.floor((Math.random()*10-5)*10)/10
            mathBlockFun = new MathBlock({type: MathBlock.POWER, token:'2'})
            mathBlockFun.translateY = b
            mathBlockFun.scaleY = m
            mathBlockFun.children[0] = new MathBlock({type:MathBlock.VARIABLE,token: 'x'})
            break
        }
        default:
        case "linear":{
            // Random slope and intercept in [-5,5]
            const m = Math.floor((Math.random()*10-5)*10)/10
            const b = Math.floor((Math.random()*10-5)*10)/10
            mathBlockFun = new MathBlock({type:MathBlock.VARIABLE, token:'x'})
            mathBlockFun.translateY = b
            mathBlockFun.scaleY = m
        }
        break
    }
    
    const fun = mathBlockFun.toFunction()
    var maxOnInterval = fun(-10)
    var minOnInterval = fun(-10)
    for (let x = -10; x <= 10; x+= 0.1){
        const y = fun(x)
        if (maxOnInterval < y) maxOnInterval = y
        if (minOnInterval > y) minOnInterval = y
    }
    // Extra space below
    if (maxOnInterval >= 10 && minOnInterval >= -10){
        mathBlockFun.translateY += -10 - Math.floor(minOnInterval)
    }
    // Extra space above
    else if (maxOnInterval <= 10 && minOnInterval <= -10){
        mathBlockFun.translateY += 10 - Math.ceil(maxOnInterval)
    }

    mathBlockFun.x = 100
    mathBlockFun.y = 250
    gss.currentNavFunction = MathBlock.dehydrate(mathBlockFun)
    return mathBlockFun
}

/**
 * 
 * puzzleMastery is the exponential moving average of the .
 * It is a score from 0 to 1.
 * 
 * alpha is a parameter of how quickly the mastery changes 
 * 
 * @param {*} gameState
 * @param {number} puzzleType  
 * @param {number} wasCorrect 0 if incorrect, 1 if correct
 */
function updateNavigationProgress(gameState, puzzleType, wasCorrect){
    if (gameState.stored.navPuzzleAttempts[puzzleType] == null)
        gameState.stored.navPuzzleAttempts[puzzleType] = 0
    gameState.stored.navPuzzleAttempts[puzzleType] ++
    const alpha = 0.3
    gameState.stored.navPuzzleMastery[puzzleType] = alpha * wasCorrect + (1-alpha) * gameState.stored.navPuzzleMastery[puzzleType]
}


