/**
 * This file contains all of the data for the levels.
 * 
 * The canvas is set to 1600 x 900 px, and scaled down if the window is too small.
 * We do all layout math relative to the 1600 x 900 px. * 
 * 
 * 
 * 
*/

const CANVAS_WIDTH = 1600
const CANVAS_HEIGHT = 900



/**
 * name: the name of the planet
 * distance: the distance from the start to the planet
 * scene: the scene that the ship door exits to when we land on the planet
 * puzzles: the scenes that need to be completed in order to 
 * 
 * PLANET_DATA should be accessed using gameState.stored.planetIndex
 * 
 */
const PLANET_DATA = [
    {name: "Linear", distance: 0, scene:"introDoor", imgId :"linear_img",
        puzzles: ["intro1", "intro2", "intro4Pos", "introNeg", "introFrac", "introCombined", "intro8", "intro16"],
        trials: ["linearTrial1","linearTrial2","linearTrial3","linearTrial4","linearTrial5"],
    },
    {name: "Quadratic", distance: 10, scene:"quadDoor",
         puzzles:["quad4", "quad8", "quad16", "quad32", "quadSmooth", "quadShort4", "quadShort8", "quadShort16", "quadShort32", "quadShortSmooth",
            "quadNeg4", "quadNeg8", "quadNeg16", "quadNeg32", "quadNegSmooth",
         ],
          imgId :"quad_img",
          trials:[],
    },
    {name: "Exponential", distance: 30, scene:"expDoor", 
        puzzles: ["exp1", "exp2"],
        trials:[],
    },
]

/**
 * Checks how many of the levels on the current planet have been completed.
 * 
 * @param {*} gameState the current game state
 * @returns the percent of levels complete
 */
function planetCompletion(gameState){
    const id = gameState.stored.planetIndex
    const puzzles = PLANET_DATA[id].puzzles
    const progress = gameState.stored.planetCompletedLevels[id]
    console.log(id,puzzles,progress)
    var numComplete = 0
    for(let i = 0; i < puzzles.length; i++){
        if (progress[puzzles[i]]){
            numComplete++
        }
    } 
    return numComplete / puzzles.length
}

/**
 * 
 * puzzleMastery is the exponential moving average of the .
 * It is a score from 0 to 1.
 * 
 * 
 * alpha is a parameter of how quickly the mastery changes 
 * 
 * @param {*} gameState
 * @param {number} puzzleType  
 * @param {number} wasCorrect 0 if incorrect, 1 if correct
 */
function updateNavigationProgress(gameState, puzzleType, wasCorrect){
    gameState.stored.numPuzzles[puzzleType] ++
    const alpha = 0.3
    gameState.stored.puzzleMastery[puzzleType] = alpha * wasCorrect + (1-alpha) * gameState.stored.puzzleMastery[puzzleType]
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

    // Pick puzzle type so that probability of each type is proportional to (1-mastery)
    var sum = 0
    for (let i = 0; i <= gss.planetIndex; i++){
        sum += 1- gss.puzzleMastery[i]
        if (build == 'dev') console.log("mastery",i,gss.puzzleMastery[i])
    }
    const randPuzzleType = Math.random()*sum
    var puzzleType = 0
    var sum2 = 0
    for (let i = 0; i <= gss.planetIndex; i++){
        sum2 += 1- gss.puzzleMastery[i]
        if (randPuzzleType < sum2){
            puzzleType = i
            break
        }
    }
    console.log(gss.planetIndex, sum, randPuzzleType,puzzleType)
 
    const puzzlePlanetName = PLANET_DATA[puzzleType].name
    var mathBlockFun = null
    switch (puzzlePlanetName){
        case "Quadratic":{
            const m = Math.floor(Math.random()*4*10)/10 
            const b = gameState.stored.totalDistance
            mathBlockFun = new MathBlock({type: MathBlock.POWER, token:'2',originX:100,originY:320})
            mathBlockFun.translate_y = b
            mathBlockFun.scale_y = m
            mathBlockFun.children[0] = new MathBlock({type:MathBlock.VARIABLE,token: 'x',originX:0,originY:0})
            break
        }
        default:
        case "Linear":
            const m = Math.floor(Math.random()*4*10)/10 
            const b = gameState.stored.totalDistance
            mathBlockFun = new MathBlock({type:MathBlock.VARIABLE, token:'x', originX:100, originY:320})
            mathBlockFun.translate_y = b
            mathBlockFun.scale_y = m
        break
    }
    

    gss.currentNavFunction = mathBlockFun
    return mathBlockFun
}

function asteroids(gameState){

}

/**
 * 
 * The randomly generated navigation levels
 * 
 */
function rngLevel(gameState) {
    const gss = gameState.stored
    const prevPlanet = PLANET_DATA[gss.planetIndex]
    const nextPlanet = PLANET_DATA[gss.planetIndex+1]

    const blocks = [[MathBlock.CONSTANT, ""],[MathBlock.BIN_OP, "+"]]
    
    var mathBlockFun = new MathBlock({})
    console.log(gss.currentNavFunction)
    if (gss.currentNavFunction != null){
        // Rehydrate object
        mathBlockFun = MathBlock.rehydrate(gss.currentNavFunction)        
    }else{
        mathBlockFun = newRNGPuzzle(gameState)
    }
    const fun = mathBlockFun.toFunction()
    
    
    const padLeft = 100
    const gridDim = 400
    const padBottom = 100
    const intDist = Math.floor(gameState.stored.totalDistance)
    const gridY = CANVAS_HEIGHT-padBottom-gridDim

    const gridLeft = new Grid({
        canvasX:padLeft, canvasY:gridY,
        canvasWidth:400, canvasHeight:400, 
        gridXMin:0, gridXMax:4, gridYMin:0, gridYMax:4,
        labels:true, arrows:true
    })
    const gridRight = new Grid({
        canvasX:padLeft+gridDim+100, canvasY:gridY,
        canvasWidth:400, canvasHeight:400, 
        gridXMin:0, gridXMax:4, gridYMin:0,  gridYMax:4,
        labels:true, arrows:true
    })
    //const gridRight = new Grid(padLeft+gridDim+100, gridY, gridDim, gridDim, grid_setting.grid_width, grid_setting.grid_height, 5, 4, 0, labels=true)
    const tySlider = new Slider({
        canvasX: 1100, canvasY:gridY, canvasLength:400,
        sliderLength: 4, maxValue: 4, showAxis: true
    })
    const sySlider = new Slider({
        canvasX: 1200, canvasY: gridY, canvasLength: 400,
        sliderLength: 8, maxValue: 4, startValue: 1
    })
    const funRight = new FunctionTracer({grid:gridRight})


    const math_blocks = []
    for (let i = 0; i < blocks.length; i++) {
        math_blocks.push(new MathBlock({type:blocks[i][0], token:blocks[i][1], originX:1300, originY:150 + 100 * i}))
    }
    const mngr = new MathBlockManager({blocks:math_blocks, originX:600, originY:320,
        translateYSlider:tySlider, scaleYSlider:sySlider,
        outputType: "funTracer", funTracer: funRight
    })
    
    const targets = []
    const numTargets = 200
    for (let i = 0; i < numTargets; i++) {
        const x = gridLeft.gridXMin + (i + 1) / numTargets * gridLeft.gridWidth
        const y = fun(x)
        if (y <= gridLeft.gridYMax && y >= gridLeft.gridYMin){
            targets.push(new Target({grid: gridLeft, gridX: x, gridY: y, size:5}))
        }
    }


    const tracer = new IntegralTracer({grid: gridLeft, mathBlockMngr: mngr, targets:targets})
    tracer.stopped = true

    const shipIcon = document.getElementById("shipicon_img");
    const linIcon = document.getElementById("linearicon_img");
    const quadIcon = document.getElementById("quadraticicon_img");
    const progressBar = {
        dist: 0,
        originX: 300,
        length: 500,
        updateDistance: function(d){
            this.dist = (d - prevPlanet.distance) * this.length / (nextPlanet.distance - prevPlanet.distance)
        },
        update: function(ctx){
            const originY = 150
            const numTicks = 10
            const tickLength = 10
            const lineWidth = 5
            Color.setColor(ctx, Color.white)
            Shapes.RoundedLine(ctx, this.originX, originY, this.originX + this.length, originY, lineWidth)
            Color.setColor(ctx, Color.blue)
            Shapes.RoundedLine(ctx, this.originX, originY, this.originX + this.dist, originY, lineWidth)
            Color.setColor(ctx, Color.white)
            ctx.font = '20px monospace'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'top'
            ctx.fillText(prevPlanet.name+" Planet", this.originX, originY-60)
            ctx.fillText(nextPlanet.name+" Planet", this.originX+this.length, originY-60)
            ctx.fillText(gameState.stored.totalDistance+" u charted", this.originX+this.length/2, originY-60)
            ctx.fillText(prevPlanet.distance+" u", this.originX, originY+25)
            ctx.fillText(nextPlanet.distance+" u", this.originX+this.length, originY+25)
            

            for (let i = 0; i < numTicks + 1; i++) {
                const tickX = this.originX + this.length / numTicks * i
                
                //ctx.fillText(i, tickX, originY + tickLength + 5)
                if (tickX < this.originX + this.dist){
                    Color.setColor(ctx, Color.blue)
                }else{
                    Color.setColor(ctx, Color.white)
                }
                Shapes.RoundedLine(ctx, tickX, originY - tickLength, tickX, originY + tickLength, lineWidth)
            }
            
            ctx.drawImage(shipIcon, this.originX + this.dist-20, 130, 40,40)
            ctx.drawImage(linIcon, this.originX-70, 130, 40,40)
            ctx.drawImage(quadIcon, this.originX+this.length +30, 130, 40,40)

        }
    }

    const backButton = new Button({originX: padLeft, originY: padBottom, width:50, height:50,
         onclick:(() => loadScene(gameState,"ship")), label:"↑", lineWidth:5})
    const startButton = new Button({originX: 925, originY: 100, width: 100, height:100,
        onclick:(() => {
            tracer.reset();
            gameState.temp.state = "Tracing"
        }),
        label:"Start"
    })

    const nextButton = new Button({originX: 925, originY:100, width:100, height:100, 
        onclick:(() => {
            if (gameState.stored.totalDistance >= nextPlanet.distance){
                loadScene(gameState,"ship")
            }else{
                loadScene(gameState,"navigation")
            } 
        }),
        label:"Next"
    })
    nextButton.visible = false

    //const targetText = new TextBox(padLeft, gridY-40, funString, font = '40px monospace', color = Color.white)
    const axisLabels = {
        update: function(ctx){
            ctx.font = '20px monospace'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'top'
            Color.setColor(ctx, Color.white)
            ctx.fillText("Time (s)", padLeft + 200, gridY+gridDim+50)
            ctx.fillText("Time (s)", 800, gridY+gridDim+50)
            ctx.translate(padLeft -70,600)
            ctx.rotate(-Math.PI/2)
            ctx.fillText("Position (u)", 0, 0)
            ctx.resetTransform()
            ctx.translate(540,600)
            ctx.rotate(-Math.PI/2)
            ctx.fillText("Velocity (u/s)", 0, 0)
            ctx.resetTransform()
        }
    }
    

    gameState.stored.strikes = 0
    const strikes = {
        update: (ctx) => {
            for (let i = 0; i < 3; i++) {
                if (gameState.stored.strikes <= i) {
                    Color.setColor(ctx, Color.white)
                    if(gameState.temp.state == "Solved" && gameState.stored.strikes == i) {
                        Color.setColor(ctx, Color.blue)
                    }
                } else {
                    Color.setColor(ctx, Color.red)
                }
                Shapes.Circle(ctx, 1100 + i * 50, 150, 20)
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
            Shapes.Line(ctx, 1250,320,1100,320,5,endCapStyle="arrow",endCapSize=5,oneSideCap=true)
        }
    }

    gameState.temp.state = "Input"
    gameState.objects = [toolTip, gridLeft, gridRight, tySlider, sySlider, funRight, tracer, backButton, startButton, nextButton, mathBlockFun,
        progressBar, strikes, axisLabels
    ].concat(targets)
    gameState.objects.push(mngr)
    gameState.update = () => {
        if (mngr.fieldBlock == null){
            tySlider.hidden = true
            sySlider.hidden = true
            toolTip.visible = true
        }else{
            tySlider.hidden = false
            sySlider.hidden = false
            toolTip.visible = false
        }
        switch (gameState.temp.state) {
            case "Input":
                progressBar.updateDistance(gameState.stored.totalDistance)
                mngr.frozen = false
                startButton.visible = true
                nextButton.visible = false
                nextButton.active = false
                tracer.stopped = true
                if (mngr.fieldBlock != null && mngr.fieldBlock.toFunction != null) {
                    startButton.active = true
                } else {
                    startButton.active = false
                }
                break
            case "Tracing":
                tracer.stopped = false
                startButton.active = false
                mngr.frozen = true
                progressBar.updateDistance(Math.min(tracer.currentValue,nextPlanet.distance))
                if (tracer.doneTracing) {
                    if (tracer.solved) {
                        gameState.temp.state = "Solved"

                    } else {
                        gameState.stored.strikes += 1
                        if (gameState.stored.strikes == 3) {
                            gameState.temp.state = "Strikeout"
                        } else {
                            gameState.temp.state = "Input"
                        }
                    }
                }
                break
            case "Solved":
                const dist = Math.min(tracer.currentValue,nextPlanet.distance)
                gameState.stored.totalDistance = Math.floor(dist*10)/10
                nextButton.color = Color.blue
                nextButton.visible = true
                nextButton.active = true
                console.log('solved',nextButton)
                startButton.visible = false
                startButton.active = false
                break
            case "Strikeout":
                progressBar.updateDistance(gameState.stored.totalDistance)
                nextButton.color = Color.red
                nextButton.visible = true
                nextButton.active = true
                startButton.visible = false
                startButton.active = false
                break
            default:
                break
        }
    }
    
}

/**
 * A 4x4 discrete level with given targets.
 * 
 * @param {*} gameState 
 * @param {*} targetVals The y-values of the targets
 * @param {*} tracerStart y-intercept where the tracer starts from
 * @param {number} targetSize The size of the targets and sliders
 */
function simpleDiscLevel(gameState, targetVals, tracerStart = 0, targetSize = 15, sliderSize = 15) {
    const gridLeft = new Grid({canvasX:300, canvasY:250, canvasWidth:400, canvasHeight:400, 
        gridXMin:-2, gridYMin:-2, gridXMax:2, gridYMax:2, labels:false, arrows:true})
    const gridRight = new Grid({canvasX:900, canvasY:250, canvasWidth:400, canvasHeight:400, 
        gridXMin:-2, gridYMin:-2, gridXMax:2, gridYMax:2, labels:false, arrows:true})
    const spacing = gridLeft.gridWidth/targetVals.length
    var sliders = []
    for (let i = gridRight.gridXMin; i < gridRight.gridXMax; i+=spacing) {
        sliders.push(new Slider({grid:gridRight, gridPos:i,increment:0.1,circleRadius:sliderSize}))
    }
    var targets = []
    for (let i = 0; i < targetVals.length; i++) {
        targets.push(new Target({grid: gridLeft, gridX:gridLeft.gridXMin+(i+1)*spacing, gridY:targetVals[i], size:targetSize}))
    }
    const tracer = new IntegralTracer({grid: gridLeft, sliders: sliders, targets:targets, gridY:tracerStart})
    const objs = [gridLeft, gridRight, tracer].concat(targets).concat(sliders)
    gameState.objects = objs
    gameState.update = () => { }
    levelNavigation(gameState, () => tracer.solved)
}

/**
 * A menu that displays a set of puzzles
 * 
 * Sets gameState.stored.menuScene to be this menu
 * Sets gameState.stored.levels to be the levels in this menu
 * Navigating to a level sets gameState.stored.levelIndex
 * 
 * @param {*} gameState 
 * @param {*} menu_num the number to precede the puzzle number, i.e. 2 in 2.1
 * @param {*} levels the puzzles in the menu
 * @param {string} exitTo scene that the back button leads to
 */
function puzzleMenu(gameState, menu_num, levels, exitTo) {
    gameState.stored.menuScene = gameState.stored.sceneName
    gameState.stored.levels = levels
    buttons = []
    for (let i = 0; i < levels.length; i++) {
        const button = new Button({originX:0, originY:0, width:100, height:100,
            onclick:(() => {
                gameState.stored.levelIndex = i;
                loadScene(gameState,levels[i])
            }),
            label: menu_num + "." + (i + 1)
        })
        if (gameState.stored.planetCompletedLevels[gameState.stored.planetIndex][levels[i]]) {
            button.color = Color.blue
        }
        buttons.push(button)
    }

    // Button layout: 6 buttons per row
    // 100 px between buttons, 100px size buttons = 1100px
    // Leaves 500px, so 250 on either side
    const start_x = 250
    var x = start_x
    var y = 300
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].originX = x
        buttons[i].originY = y
        if (build == "dev") console.log(x - buttons[i].width / 2 == buttons[i].originX)
        x += 200
        if (i % 6 == 5) {
            x = start_x
            y += 200
        }
    }

    // y layout: 
    // Space betweeen back and grid 200px
    // 500px of buttons (3 rows max)
    // Leaves 100px above and below
    const backButton = new Button({originX:100, originY:100, width:100, height:100, onclick:(() => loadScene(gameState,exitTo)), label:"↑"})
    buttons.push(backButton)

    // const actionButton = new Button(300,100,200,100, (()=> loadScene(gameState,exitTo), "Open Door")
    // actionButton.active = false
    // buttons.push(actionButton)

    // gameState.stored.currentPlanetCompletion = numComplete / levels.length
    gameState.update = (() => {
        
    })
    gameState.objects = buttons

}



function experimentTrial(gameState, exitTo, solution){
    const gss = gameState.stored
    const backButton = new Button({originX:50, originY:50, width:50, height:50, onclick:(() => loadScene(gameState,exitTo)), label:"↑"})
    backButton.lineWidth = 5

    var showExp = true
    const showExpButton = new Button({originX:800, originY:50, width:50, height:50, onclick:(() => showExp = !showExp), label:"↔"})
    showExpButton.lineWidth = 5
    
    var functionSolved = false
    var derivativeSolved = false

    const padLeft = 100
    const gridDim = 400
    const padBottom = 100
    const gridSize = 10
    const gridY = CANVAS_HEIGHT-padBottom-gridDim
    const gridLeft = new Grid(padLeft, gridY, gridDim, gridDim, gridSize, gridSize, 5, 10, 0, labels=true)
    gridLeft.arrows = true
    const gridRight = new Grid(padLeft+gridDim+100, gridY, gridDim, gridDim, gridSize, gridSize, 5, 5, 0, labels=true)
    gridRight.arrows = true
    const tySlider = new Slider(1100, gridY, 400, 4, 0, 4, 0.1, true, true)
    const sySlider = new Slider(1200, gridY, 400, 8, 1, 4, 0.1, true, true)
    const math_blocks = [
        new MathBlock({type:MathBlock.CONSTANT,token:"0"  ,originX:1300,originY:100}),
        new MathBlock({type:MathBlock.VARIABLE,token:"x"  ,originX:1300,originY:170}),
        new MathBlock({type:MathBlock.POWER   ,token:"2"  ,originX:1300,originY:240}),
        new MathBlock({type:MathBlock.EXPONENT,token:"e"  ,originX:1300,originY:340}),
        new MathBlock({type:MathBlock.FUNCTION,token:"sin",originX:1300,originY:440}),
        new MathBlock({type:MathBlock.BIN_OP  ,token:"+"  ,originX:1300,originY:540}),
        new MathBlock({type:MathBlock.BIN_OP  ,token:"*"  ,originX:1300,originY:640}),
    ]
    const adder = new TargetAdder(gridLeft)
    const funLeft = new FunctionTracer(gridLeft)
    const funRight = new FunctionTracer(gridRight)
    const mngr = new MathBlockManager({blocks:math_blocks, originX:100, originY:300,
        translateYSlider:tySlider, scaleYSlider:sySlider,
        type: "fun_tracer", funTracer: funLeft })

   

    const bgImage = {
        update: function(ctx){
            const image = document.getElementById("quad_img")
            ctx.drawImage(image, 0,0,1600*600/900,900, 600, 200, 950, 600)
        }
    }

    const maxTime = 10
    var time = 0
    var playing = true
    var startTime = Date.now()
    const maxDist = 500
    const turtle = {
        originX:800,
        originY:600,
        update: function(ctx){
            const width = 100
            Color.setColor(ctx,Color.green)
            ctx.fillRect(this.originX - width + (solution.function(time) * maxDist/maxTime), this.originY, 100, 100)
        }
    }
    const tSlider = new Slider(750,850,600,10,0,0,0.1,true,false,10)
    tSlider.showAxis = false
    const timeLabel = new TextBox(650,850,"",'20px monospace')
    const playPauseButton = new Button({originX:1450,originY:820,width:50,height:50,onclick:()=>{playing=!playing; startTime= Date.now()}, label:">"}) 
    playPauseButton.lineWidth = 5

    const numberLine = {
        update: function(ctx){
            const originX = turtle.originX 
            const originY = turtle.originY-50
            const length = maxDist
            const numTicks = 10
            const lineWidth = 5
            const tickLength = 10
            Color.setColor(ctx, Color.white)
            Shapes.RoundedLine(ctx, originX, originY, originX + length, originY, lineWidth)

            ctx.font = '20px monospace'
            ctx.textAlign = 'left'
            ctx.textBaseline = 'top'
            ctx.fillText('Position = ' + solution.function(time).toFixed(1), turtle.originX, turtle.originY -100)
            
            for (let i = 0; i < numTicks + 1; i++) {
                const tickX = originX + length / numTicks * i
                ctx.fillText(i, tickX, originY + tickLength + 5)
                Shapes.RoundedLine(ctx, tickX, originY - tickLength, tickX, originY + tickLength, lineWidth)
            }
        }
    }

    const text = {
        update: function(ctx){
            Color.setColor(ctx,Color.white)
            ctx.font = '20px monospace'
            ctx.textAlign = 'start'
            ctx.textBaseline = 'top'
            ctx.fillText('The turtle moves with a constant velocity of 0.5 m/s.', 150,50)
            ctx.fillText("f(x) is its position and f\'(x) is its velocity.", 150,80)
            ctx.fillText("Click to add measurements", 150,200)
            ctx.translate(25,700)
            ctx.rotate(-Math.PI/2)
            ctx.fillText("Position f(x)", 0,0)
            ctx.resetTransform()
            if (adder.overGrid){
                ctx.fillText("(" + adder.targetGX + "," + adder.targetGY + ")", 100,250)
            }
        }
    }

    const mainObjs = [backButton, gridLeft, showExpButton, text, adder]
    const gridObjs = [gridRight,mngr, funLeft, funRight, tySlider, sySlider]
    const expObjs = [bgImage, tSlider, tSlider, timeLabel, turtle, playPauseButton, numberLine]
    gameState.update = () => {
        if (showExp){
            adder.active = true
            if (playing){
                time = (Date.now() - startTime)/1000 // time in secs to 1 decimal
                if (time >= maxTime){
                    time = maxTime
                    playing = false 
                }
                tSlider.setValue(time)
            }else{
                time = tSlider.value
            }
            gameState.objects = mainObjs.concat(expObjs) 
            timeLabel.content = "t = " + time.toFixed(1)
        }else{
            funLeft.targets = adder.targets
            adder.active = false
            gameState.objects = mainObjs.concat(gridObjs)
            if (!functionSolved){
                if (mngr.checkFunctionEquals(solution.function)){
                    functionSolved = true
                    const fBlock = mngr.fieldBlock
                    gridObjs.push(fBlock)
                    mngr.reset()
                    mngr.output =  { type: "fun_tracer", fun_tracer: funRight }
                    mngr.originX = 600
                }
            }else{
                if (mngr.checkFunctionEquals(solution.derivative)){
                    derivativeSolved = true
                }
            }
        }
    }

}

function experimentMenu(gameState, exitTo){
    const gss = gameState.stored
    const backButton = new Button({originX:50, originY:50, width:50, height:50, onclick:(() => loadScene(gameState,exitTo)), label:"↑"})
    backButton.lineWidth = 5
    const trialButtons = []
    const planetIndex = gss.planetIndex
    const completedRule = gss.planetCompletedRule[planetIndex]
    const completedTrials = gss.planetCompletedTrials[planetIndex]

    for (let i = 0; i < 10; i++){
        if (PLANET_DATA[planetIndex].trials.length <= i) break
        const button = new Button({originX:200,originY:150+i*60,width:100, height:50, onclick:(() => loadScene(gameState,PLANET_DATA[planetIndex].trials[i])), label:i+1})
        button.lineWidth = 5
        if (completedTrials < i){
            button.active = false
        }
        trialButtons.push(button)
    }
    const ruleButton = new Button({originX:200,originY:780,width:100,height:50, onclick:(() => loadScene(gameState,exitTo)),label:"Rule"})
    ruleButton.lineWidth = 5
    const table = {
        update: function(ctx){
            Color.setColor(ctx,Color.white)
            ctx.font = '40px monospace'
            ctx.textAlign = 'start'
            ctx.textBaseline = 'alphabetic'
            ctx.fillText('Trial', 200,100);
            ctx.fillText('f(x)', 400,100);
            ctx.fillText('f\'(x)', 800,100);
            Color.setColor(ctx,Color.light_gray)
            Shapes.Line(ctx,150,120,1500,120);
            Shapes.Line(ctx,350,50,350,850);
            Shapes.Line(ctx,750,50,750,850);
            Shapes.Line(ctx,150,760,1500,760);
        }
    }
    gameState.objects = [
        backButton,table,ruleButton
    ]
    gameState.objects = gameState.objects.concat(trialButtons)
}

/**
 * Used in conjunction with puzzleMenu
 * Relies on gameState.stored.menuScene
 * and gameState.stored.levels 
 * 
 * Adds a back button that returns to the menu 
 * and next button that goes to the next level.
 * 
 * @param {function} winCon the win condition for the level
 */
function levelNavigation(gameState, winCon) {
    const backButton = new Button({originX:100, originY:100, width:100, height:100, onclick: () => loadScene(gameState,gameState.stored.menuScene), label:"↑"})
    const forwardButton = new Button({originX:300, originY:100, width:100, height:100,
        onclick:(() => {
            if (gameState.stored.levelIndex < gameState.stored.levels.length - 1) { 
                gameState.stored.levelIndex += 1
                loadScene(gameState,gameState.stored.levels[gameState.stored.levelIndex])
            } else {
                loadScene(gameState,gameState.stored.menuScene)
            }
        }),
        label:"→"
    })
    forwardButton.active = false
    gameState.objects.push(backButton)
    gameState.objects.push(forwardButton)

    // Non-destructively add to the update function
    // winCon sets level completion to true
    const prev_update = gameState.update
    const completion = gameState.stored.planetCompletedLevels[gameState.stored.planetIndex]
    function update() {
        prev_update()
        if (winCon() && !completion[gameState.stored.sceneName]) {
            completion[gameState.stored.sceneName] = true
        }
        if (completion[gameState.stored.sceneName]) {
            forwardButton.active = true
        }
    }
    gameState.update = update
}

/**
 * 
 * @param {*} gameState 
 * @param {*} num_sliders 
 * @param {*} withButton 
 * @param {*} func 
 */
function quadDiscLevel(gameState, num_sliders, withButton = false, func = (x => x * x / 2)) {    
    const gridLeft = new Grid(300, 350, 400, 400, 4, 4, 5, 2, 2)
    const gridRight = new Grid(900, 350, 400, 400, 4, 4, 5, 2, 2)
    var sliders = []
    const slider_spacing = 400 / num_sliders
    var slider_size = 15
    if (num_sliders >= 16) slider_size = 10
    if (num_sliders >= 64) slider_size = 5
    for (let i = 0; i < num_sliders; i++) {
        const slider = new Slider(900 + slider_spacing * i, 350, 400, 4, 0, 2, 0.01, false, vertical = true, circleRadius = slider_size)
        sliders.push(slider)
    }
    const targetCoords = []
    for (let i = 0; i < num_sliders; i++) {
        const x = -2 + (i + 1) / num_sliders * 4
        targetCoords.push([x, func(x)])
    }
    var targets = []
    var targetSize = 15
    if (num_sliders >= 16) targetSize = 15
    if (num_sliders >= 64) targetSize = 5
    for (let i = 0; i < targetCoords.length; i++) {
        const coord = gridLeft.gridToCanvas(targetCoords[i][0], targetCoords[i][1])
        const target = new Target(coord.x, coord.y, targetSize)
        targets.push(target)
    }
    const tracerStart = gridLeft.gridToCanvas(-2,func(-2))
    const tracer = new Tracer(tracerStart.x, tracerStart.y, gridLeft,
        { type: "sliders", sliders: sliders, slider_spacing: slider_spacing },
        4, targets)


    const ty_slider = new Slider(1400, 350, 400, 4, 0, 2, 0.1, true, true)
    ty_slider.circleColorActive = Color.green
    ty_slider.active = false
    const sySlider = new Slider(1500, 350, 400, 4, 1, 2, 0.1, true, true)
    sySlider.circleColorActive = Color.green
    sySlider.active = false

    gameState.objects = [gridLeft, gridRight,tracer].concat(sliders).concat(targets)

    if (withButton) {
        const linearButton = new Button({originX:900, originY:220, width:50, height:50, onclick:() => {}, label: "x"})
        const fun = x => x
        function set_linear() {
            if (!linearButton.toggled) {
                linearButton.toggled = true
                linearButton.color = Color.green
                ty_slider.active = true
                sySlider.active = true
            } else {
                linearButton.toggled = false
                linearButton.color = Color.white
                ty_slider.active = false
                sySlider.active = false
            }
        }
        linearButton.onclick = set_linear

        gameState.objects = gameState.objects.concat([linearButton,ty_slider,sySlider])

        gameState.update = () => {
            if (ty_slider.active) {
                for (let i = 0; i < num_sliders; i++) {
                    const val = ty_slider.value + sySlider.value * fun(gridRight.canvasToGrid(sliders[i].originX, 0).x)
                    console.log(val)
                    sliders[i].setValue(val)
                }
            }
        }
    } else {
        gameState.update = () => { }
    }
    levelNavigation(gameState, () => tracer.solved)
}




// function quadDiscLevel2(gameState, num_sliders, withButton = false, withSySlider = false, func = (x => x * x / 2)) {
//     const gridLeft = new Grid(300, 350, 400, 400, 4, 4, 5, 2, 2)
//     const gridRight = new Grid(900, 350, 400, 400, 4, 4, 5, 2, 2)
//     var sliders = []
//     const slider_spacing = 400 / num_sliders
//     var slider_size = 15
//     if (num_sliders >= 16) slider_size = 10
//     if (num_sliders >= 64) slider_size = 5
//     for (let i = 0; i < num_sliders; i++) {
//         sliders.push(new Slider(900 + slider_spacing * i, 350, 400, 4, 0, 2, 0.01, false, vertical = true, circleRadius = slider_size))
//     }
//     const targetCoords = []
//     for (let i = 0; i < num_sliders; i++) {
//         const x = -2 + (i + 1) / num_sliders * 4
//         targetCoords.push([x, func(x)])
//     }
//     var targets = []
//     for (let i = 0; i < targetCoords.length; i++) {
//         const coord = gridLeft.gridToCanvas(targetCoords[i][0], targetCoords[i][1])
//         targets.push(new Target(coord.x, coord.y, slider_size))
//     }
//     const tracer = new Tracer(300, 350, gridLeft,
//         { type: "sliders", sliders: sliders, slider_spacing: slider_spacing },
//         4, targets)


//     const ty_slider = new Slider(1400, 350, 400, 4, 0, 2, 0.1, true, true)
//     ty_slider.circleColorActive = Color.green
//     ty_slider.active = false
//     const sySlider = new Slider(1500, 350, 400, 8, 1, 4, 0.1, true, true)
//     sySlider.circleColorActive = Color.green
//     sySlider.active = false

//     //const mngr = new MathBlockManager(math_blocks,900,150, ty_slider, sySlider, {type:"sliders", sliders:sliders})
//     const linearButton = new Button(900, 220, 50, 50, () => { }, "x")
//     const fun = x => x
//     function set_linear() {
//         if (!linear_button.toggled) {
//             linear_button.toggled = true
//             linear_button.color = Color.green
//             ty_slider.active = true
//             sySlider.active = true
//         } else {
//             linear_button.toggled = false
//             linear_button.color = Color.white
//             ty_slider.active = false
//             sySlider.active = false
//         }
//     }
//     linear_button.onclick = set_linear

//     const objs = [gridLeft, gridRight, tracer].concat(targets).concat(sliders)
//     if (withButton) {
//         push(linear_button)
//         objs.push(ty_slider)
//         if (withSySlider) {
//             objs.push(sySlider)
//         }
//     }
//     gameState.objects = objs
//     gameState.update = () => {
//         if (ty_slider.active) {
//             for (let i = 0; i < num_sliders; i++) {
//                 sliders[i].setValue(ty_slider.value + sySlider.value * fun(gridRight.canvasToGrid(sliders[i].originX, 0).x))
//             }
//         }
//     }
//     levelNavigation(gameState, () => tracer.solved)
// }


// function twoGridLevel(gameState, num_sliders, buttons, func) {
//     gameState.objects = {}
//     let objs = gameState.objects
//     objs.gridLeft = new Grid(300, 350, 400, 400, 4, 4, 5, 2, 2)
//     objs.gridRight = new Grid(900, 350, 400, 400, 4, 4, 5, 2, 2)
//     var sliders = []
//     const slider_spacing = 400 / num_sliders
//     var slider_size = 15
//     if (num_sliders >= 16) slider_size = 10
//     if (num_sliders >= 64) slider_size = 5
//     for (let i = 0; i < num_sliders; i++) {
//         const slider = new Slider(900 + slider_spacing * i, 350, 400, 4, 0, 2, 0.01, false, vertical = true, circleRadius = slider_size)
//         sliders.push(slider)
//         objs["slider" + i] = slider
//     }
//     const targetCoords = []
//     for (let i = 0; i < num_sliders; i++) {
//         const x = -2 + (i + 1) / num_sliders * 4
//         targetCoords.push([x, func(x)])
//     }
//     var targets = []
//     for (let i = 0; i < targetCoords.length; i++) {
//         const coord = objs.gridLeft.gridToCanvas(targetCoords[i][0], targetCoords[i][1])
//         const target = new Target(coord.x, coord.y, slider_size)
//         targets.push(target)
//     }
//     const tracer = new Tracer(300, 350 + (2 - func(-2)) * 100, objs.gridLeft,
//         { type: "sliders", sliders: sliders, slider_spacing: slider_spacing },
//         4, targets)
//     objs.tracer = tracer
//     // We have to do this to order the layers correctly, maybe in future game objects can get a layer property
//     for (let i = 0; i < targetCoords.length; i++) {
//         objs["target" + i] = targets[i]
//     }

//     if (buttons) {
//         objs.ty_slider = new Slider(1400, 350, 400, 4, 0, 2, 0.01, true, true)
//         objs.ty_slider.circleColorActive = Color.green
//         objs.ty_slider.active = false
//         objs.sySlider = new Slider(1500, 350, 400, 4, 1, 2, 0.01, true, true)
//         objs.sySlider.circleColorActive = Color.green
//         objs.sySlider.active = false

//         var fun = x => x

//         if (buttons == 1) {
//             objs.linear_button = new Button(900, 220, 50, 50, () => { }, "/")
//             fun = x => x
//             function set_linear() {
//                 if (!objs.linear_button.toggled) {
//                     objs.linear_button.toggled = true
//                     objs.linear_button.color = Color.green
//                     objs.ty_slider.active = true
//                     objs.sySlider.active = true
//                 } else {
//                     objs.linear_button.toggled = false
//                     objs.linear_button.color = Color.white
//                     objs.ty_slider.active = false
//                     objs.sySlider.active = false
//                 }
//             }
//             objs.linear_button.onclick = set_linear
//         }

//         if (buttons == 2) {
//             objs.quad_button = new Button(950, 220, 50, 50, () => { }, "U")
//             fun = x => x * x
//             function set_quad() {
//                 if (!objs.quad_button.toggled) {
//                     objs.quad_button.toggled = true
//                     objs.quad_button.color = Color.green
//                     objs.ty_slider.active = true
//                     objs.sySlider.active = true
//                 } else {
//                     objs.quad_button.toggled = false
//                     objs.quad_button.color = Color.white
//                     objs.ty_slider.active = false
//                     objs.sySlider.active = false
//                 }
//             }
//             objs.quad_button.onclick = set_quad
//         }

//         gameState.update = () => {
//             if (objs.ty_slider.active) {
//                 for (let i = 0; i < num_sliders; i++) {
//                     sliders[i].setValue(objs.ty_slider.value + objs.sySlider.value * fun(objs.gridRight.canvasToGrid(sliders[i].originX, 0).x))
//                 }
//             }
//         }
//     } else {
//         gameState.update = () => { }
//     }
//     levelNavigationObj(gameState, () => tracer.solved)
// }


// function cubicDiscLevel(gameState, num_sliders, next) {
//     // To generalize
//     const fun = x => x * x * x / 6

//     const gridLeft = new Grid(300, 250, 400, 400, 4, 4, 5, 2, 2)
//     const gridRight = new Grid(900, 250, 400, 400, 4, 4, 5, 2, 2)
//     var sliders = []
//     const slider_spacing = 400 / num_sliders
//     for (let i = 0; i < num_sliders; i++) {
//         sliders.push(new Slider(900 + slider_spacing * i, 250, 400, 4, 0, 2, 0.01, false, vertical = true, circleRadius = 10))
//     }
//     const targetCoords = []
//     for (let i = 0; i < num_sliders; i++) {
//         const x = -2 + (i + 1) / num_sliders * 4
//         targetCoords.push([x, fun(x)])
//     }
//     var targets = []
//     for (let i = 0; i < targetCoords.length; i++) {
//         const coord = gridLeft.gridToCanvas(targetCoords[i][0], targetCoords[i][1])
//         targets.push(new Target(coord.x, coord.y, 10))
//     }
//     const tracer_start = gridLeft.gridToCanvas(-2, fun(-2))
//     const tracer = new Tracer(tracer_start.x, tracer_start.y, gridLeft,
//         { type: "sliders", sliders: sliders, slider_spacing: slider_spacing },
//         4, targets)
//     const back_button = new Button(100, 100, 100, 100, (() => loadScene(gameState,"cubicMenu"), "↑")
//     const forward_button = new Button(300, 100, 100, 100, (() => loadScene(gameState,next), "→")
//     forward_button.active = false
//     function update() {
//         if (tracer.solved && !gameState.completedLevels[gameState.stored.sceneName]) {
//             gameState.completedLevels[gameState.stored.sceneName] = true
//             gameState.writeToStorage = true

//         }
//         if (gameState.completedLevels[gameState.stored.sceneName]) {
//             forward_button.active = true
//         }
//     }
//     const objs = [gridLeft, gridRight, tracer, back_button, forward_button].concat(targets).concat(sliders)
//     gameState.objects = objs
//     gameState.update = update
// }

// function expDiscLevel(gameState, num_sliders, next) {
//     // To generalize

//     const gridLeft = new Grid(300, 250, 400, 400, 4, 4, 5, 4, 2)
//     const gridRight = new Grid(900, 250, 400, 400, 4, 4, 5, 4, 2)
//     var sliders = []
//     const slider_spacing = 400 / num_sliders
//     for (let i = 0; i < num_sliders; i++) {
//         sliders.push(new Slider(900 + slider_spacing * i, 250, 400, 4, 0, 4, 0.01, false, vertical = true, circleRadius = 10))
//     }
//     const targetCoords = []
//     for (let i = 0; i < num_sliders - 1; i++) {
//         const x = -2 + (i + 1) / num_sliders * 4
//         targetCoords.push([x, 0])
//     }
//     var targets = []
//     for (let i = 0; i < targetCoords.length; i++) {
//         const coord = gridLeft.gridToCanvas(targetCoords[i][0], targetCoords[i][1])
//         targets.push(new Target(coord.x, coord.y, 10))
//     }
//     const tracer_start = gridLeft.gridToCanvas(-2, 0.15)
//     const tracer = new Tracer(tracer_start.x, tracer_start.y, gridLeft,
//         { type: "sliders", sliders: sliders, slider_spacing: slider_spacing },
//         4, targets)
//     const back_button = new Button(100, 100, 100, 100, (() => loadScene(gameState,"expMenu"), "↑")
//     const forward_button = new Button(300, 100, 100, 100, (() => loadScene(gameState,next), "→")
//     forward_button.active = false
//     function update() {
//         for (let i = 0; i < num_sliders - 1; i++) {
//             targets[i].setPosition(targets[i].x, gridLeft.gridToCanvas(0, sliders[i + 1].value).y)
//         }

//         if (tracer.solved && !gameState.completedLevels[gameState.stored.sceneName]) {
//             gameState.completedLevels[gameState.stored.sceneName] = true
//             gameState.writeToStorage = true

//         }
//         if (gameState.completedLevels[gameState.stored.sceneName]) {
//             forward_button.active = true
//         }
//     }

//     const objs = [gridLeft, gridRight, tracer, back_button, forward_button].concat(targets).concat(sliders.slice(1))
//     gameState.objects = objs
//     gameState.update = update
// }

// function sinDiscLevel(gameState, num_sliders, next, grid_size) {
//     const grid1 = new Grid(100, 250, 400, 400, grid_size, grid_size, 5, grid_size / 2, grid_size / 2)
//     const grid2 = new Grid(600, 250, 400, 400, grid_size, grid_size, 5, grid_size / 2, grid_size / 2)
//     const grid3 = new Grid(1100, 250, 400, 400, grid_size, grid_size, 5, grid_size / 2, grid_size / 2)
//     var sliders = []
//     const slider_spacing = 400 / num_sliders
//     for (let i = 0; i < num_sliders; i++) {
//         sliders.push(new Slider(grid3.originX + slider_spacing * i, 250, 400, grid_size, 0, grid_size / 2, 0.01, false, vertical = true, circleRadius = 10))
//     }
//     const targetCoords = []
//     for (let i = 0; i < num_sliders - 1; i++) {
//         //const x = -2 + (i+1)/num_sliders*4
//         const x = grid1.grid_x_min + (i + 1) / num_sliders * grid1.gridWidth
//         targetCoords.push([x, 0])
//     }
//     var targets = []
//     for (let i = 0; i < targetCoords.length; i++) {
//         const coord = grid1.gridToCanvas(targetCoords[i][0], targetCoords[i][1])
//         targets.push(new Target(coord.x, coord.y, 10))
//     }
//     const tracer2_start = grid2.gridToCanvas(grid2.grid_x_min, 1)
//     const tracer2 = new Tracer(tracer2_start.x, tracer2_start.y, grid2,
//         { type: "sliders", sliders: sliders, slider_spacing: slider_spacing },
//         4, targets)
//     const tracer1_start = grid1.gridToCanvas(grid2.grid_x_min, 0)
//     const tracer1 = new Tracer(tracer1_start.x, tracer1_start.y, grid1,
//         { type: "tracer", source_tracer: tracer2 },
//         4, targets)
//     const back_button = new Button(100, 100, 100, 100, (() => loadScene(gameState,"expMenu"), "↑")
//     const forward_button = new Button(300, 100, 100, 100, (() => loadScene(gameState,next), "→")
//     forward_button.active = false
//     function update() {
//         for (let i = 0; i < num_sliders - 1; i++) {
//             targets[i].setPosition(targets[i].x, grid1.gridToCanvas(0, -sliders[i + 1].value).y)
//         }

//         if (tracer1.solved && !gameState.completedLevels[gameState.stored.sceneName]) {
//             gameState.completedLevels[gameState.stored.sceneName] = true
//             gameState.writeToStorage = true
//         }
//         if (gameState.completedLevels[gameState.stored.sceneName]) {
//             forward_button.active = true
//         }
//     }

//     const objs = [grid1, grid2, grid3, tracer2, tracer1, back_button, forward_button].concat(targets).concat(sliders.slice(1))
//     gameState.objects = objs
//     gameState.update = update
// }

// // Merge with genCont???
// function cubicContLevel(gameState, fun, next) {
//     const blocks = [[MathBlock.VARIABLE, "x"], [MathBlock.POWER, "2"]]

//     const targetCoords = []
//     const numTargets = 16
//     for (let i = 0; i < numTargets; i++) {
//         const x = -2 + (i + 1) / numTargets * 4
//         const y = fun(x)
//         targetCoords.push([x, y])
//     }

//     const y_adjust = 100
//     const x_adjust = 100
//     const gridLeft = new Grid(100 + x_adjust, 250, 400, 400, 4, 4, 5, 2, 2)
//     const gridRight = new Grid(600 + x_adjust, 250 + y_adjust, 400, 400, 4, 4, 5, 2, 2)
//     const block1 = new MathBlock(MathBlock.VARIABLE, "x", 1300 + x_adjust, 250 + y_adjust)
//     const block2 = new MathBlock(MathBlock.POWER, "2", 1300 + x_adjust, 350 + y_adjust)
//     const ty_slider = new Slider(1100 + x_adjust, 250 + y_adjust, 400, 8, 0, 4, 0.1, true, true)
//     const sySlider = new Slider(1200 + x_adjust, 250 + y_adjust, 400, 8, 1, 4, 0.1, true, true)
//     const funRight = new FunctionTracer(gridRight)
//     //const funLeft = new FunctionTracer(gridLeft, (x => x*x))
//     //funLeft.color = Color.red
//     const mngr = new MathBlockManager([block1, block2], 600 + x_adjust, 150 + y_adjust, ty_slider, sySlider, funRight)
//     targets = []
//     for (let i = 0; i < targetCoords.length; i++) {
//         const canvas_coords = gridLeft.gridToCanvas(targetCoords[i][0], targetCoords[i][1])
//         targets.push(new Target(canvas_coords.x, canvas_coords.y, 10))
//     }
//     tracer_start = gridLeft.gridToCanvas(-2, fun(-2))
//     const tracer = new Tracer(tracer_start.x, tracer_start.y, gridLeft, { type: "mathBlock", mathBlockMngr: mngr }, 4, targets)
//     // Nav buttons
//     const back_button = new Button(100, 100, 100, 100, (() => loadScene(gameState,"cubicMenu"), "↑")
//     const forward_button = new Button(300, 100, 100, 100, (() => loadScene(gameState,next), "→")
//     forward_button.active = false

//     function update() {
//         if (tracer.solved && !gameState.completedLevels[gameState.stored.sceneName]) {
//             //localStorage.setItem(gameState.stored.sceneName, "solved");
//             gameState.completedLevels[gameState.stored.sceneName] = true
//             gameState.writeToStorage = true

//         }
//         if (gameState.completedLevels[gameState.stored.sceneName]) {
//             forward_button.active = true
//         }
//     }
//     gameState.objects = [gridLeft, gridRight, sySlider, ty_slider, mngr, funRight, tracer, forward_button, back_button].concat(targets)
//     gameState.update = update
// }


// function genContLevel(gameState, fun, blocks,
//     grid_setting = { grid_width: 4, grid_height: 4, x_axis: 2, y_axis: 2 },
// ) {
//     const targetCoords = []
//     const numTargets = 16
//     for (let i = 0; i < numTargets; i++) {
//         const x = -2 + (i + 1) / numTargets * 4
//         const y = fun(x)
//         targetCoords.push([x, y])
//     }

//     const y_adjust = 100
//     const x_adjust = 100
//     const gridLeft = new Grid(100 + x_adjust, 250 + y_adjust, 400, 400, grid_setting.grid_width, grid_setting.grid_height, 5, grid_setting.x_axis, grid_setting.y_axis)
//     const gridRight = new Grid(600 + x_adjust, 250 + y_adjust, 400, 400, grid_setting.grid_width, grid_setting.grid_height, 5, grid_setting.x_axis, grid_setting.y_axis)
//     const ty_slider = new Slider(1100 + x_adjust, 250 + y_adjust, 400, 8, 0, 4, 0.1, true, true)
//     const sySlider = new Slider(1200 + x_adjust, 250 + y_adjust, 400, 8, 1, 4, 0.1, true, true)
//     const funRight = new FunctionTracer(gridRight)
//     //const funLeft = new FunctionTracer(gridLeft, (x => x*x))
//     //funLeft.color = Color.red
//     const math_blocks = []
//     for (let i = 0; i < blocks.length; i++) {
//         math_blocks.push(new MathBlock(blocks[i][0], blocks[i][1], 1300 + x_adjust, 150 + y_adjust + 100 * i))
//     }
//     const mngr = new MathBlockManager(math_blocks, 600 + x_adjust, 150 + y_adjust, ty_slider, sySlider, { type: "fun_tracer", fun_tracer: funRight })
//     targets = []
//     for (let i = 0; i < targetCoords.length; i++) {
//         const canvas_coords = gridLeft.gridToCanvas(targetCoords[i][0], targetCoords[i][1])
//         targets.push(new Target(canvas_coords.x, canvas_coords.y, 10))
//     }
//     tracer_start = gridLeft.gridToCanvas(-2, fun(-2))
//     const tracer = new Tracer(tracer_start.x, tracer_start.y, gridLeft, { type: "mathBlock", mathBlockMngr: mngr }, 4, targets)

//     gameState.objects = [gridLeft, gridRight, sySlider, ty_slider, mngr, funRight, tracer].concat(targets)
//     gameState.update = () => { }
//     levelNavigation(gameState, () => tracer.solved)
// }



/**
 * 
 * The main function for serving up scenes.
 * 
 * The comments above each level describe the intended 
 * things that the level should teach.
 * 
 */
function loadScene(gameState, sceneName, clearTemp = true) {
    gameState.stored.sceneName = sceneName
    gameState.update = () => { }
    if (clearTemp){
        gameState.temp = {}
    }
    gameState.mouseDown = null
    gameState.keyPressed = null
    switch (sceneName) {
        case "":
        case "mapMenu": {
            var buttons = []

            break
        }
        /**
         * The main menu of the game.
         */
        case "startMenu": {
            const startButton = new Button({originX:200, originY:300, width:200, height:50, lineWidth:5,
                 onclick:(() => loadScene(gameState,"introDoor")), label:"Start"})
            const nextScene = gameState.temp.nextScene
            if (nextScene && nextScene != "startMenu"){
                console.log('next scene',nextScene)
                startButton.onclick = (() => loadScene(gameState,nextScene))
                startButton.label = "Continue"
            }
            const about_button = new Button({originX:200, originY:380, width:200, height:50, lineWidth: 5,
                onclick:(() => window.location.replace("about.html")), label:"About"})
            gameState.objects = [
                new ImageObject(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, "linear_img"),
                new TextBox({originX:200, originY:150, content: "Calculus I", font : "60px monospace", color : Color.black}),
                new TextBox({originX:200, originY:200, content: "A puzzle game", font : "30px monospace", color : Color.black}),
                startButton, about_button
            ]
            break
        }
        /**
         * The exterior of the ship with the door closed.
         * Clicking on the door takes you to intro puzzles.
         */
        case "introDoor": {
            const completion = planetCompletion(gameState)
            const open = completion == 1
            const door_button = new Button({originX:1160, originY:460, width:100, height:150, onclick:(() => { loadScene(gameState,"ship") }), label:""})
            door_button.visible = false
            
            const puzzleButton = new Button({originX:400, originY:400, width:150, height:100, onclick:(() => { loadScene(gameState, "intro") }), label:"Puzzles"})
            const experimentButton = new Button({originX:400, originY:600, width:200, height:100, 
                onclick:(() => { loadScene(gameState, "linearExperiment") }), label: "Experiment"})

            gameState.objects = [
                new ImageObject(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, "linear_img"),
                new ImageObject(1000, 250, 400, 500, "ship_img"),
                //new TextBox({originX:200, originY:150, content: "1. Linear", font : "60px monospace", color : Color.black}),
                puzzleButton, experimentButton, door_button
            ]
            break
        }
        case "escapeMenu": {
            gameState.objects = [
                new Button(300, 250, 100, 100, () => loadScene(gameState,"intro"), "Continue"),
                new Button(300, 250, 100, 100, () => loadScene(gameState,"intro"), "Main menu")
            ]
            break
        }
        case "ship": {
            const dist = gameState.stored.totalDistance
            // Check to make sure planet is updated
            if (dist >= PLANET_DATA[gameState.stored.planetIndex+1].distance){
                gameState.stored.planetIndex++
            }
            if (dist == PLANET_DATA[gameState.stored.planetIndex].distance){
                gameState.landed = true
            }
            const planetIndex = gameState.stored.planetIndex
            const landed = gameState.stored.landed
            text_content = [
                "Current location: " + (!landed ?  "In space" : "Landed on "+PLANET_DATA[planetIndex].name + " Planet"),
                "Navigating to: " + PLANET_DATA[planetIndex+1].name + " Planet",
            ]



            const background = new ImageObject(200, 50, CANVAS_WIDTH*0.8, CANVAS_HEIGHT*0.8, 
                landed ? PLANET_DATA[planetIndex].imgId : "")

            var exitTo = PLANET_DATA[planetIndex].scene
            const door_button = new Button({originX:40, originY:200, width:180, height:560, onclick:(() => { loadScene(gameState,exitTo) }), label:""})
            door_button.visible = false
            const nav_button = new Button({originX:350, originY:550, width:890, height:240, onclick:(() => { loadScene(gameState,"navigation") }), label:""})
            nav_button.visible = false
            door_button.active = landed

            gameState.objects = [
                background,
                new ImageObject(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, "interior_img"),
                new TextBox(400, 260, text_content[0], "30px monospace", Color.green),
                new TextBox(400, 300, text_content[1], "30px monospace", Color.green),
                //new TextBox(580, 280, text_content[2], "30px monospace", Color.green),
                door_button, nav_button
            ]
            
            gameState.update(() => {
            })
            break
        }
        /**
         * Navigation puzzles in the ship
         */
        case "navigation": {
            rngLevel(gameState)
            break
        }
        /** Intro Levels
         * Difficulty here is quite low, player should only struggle with
         * understanding what the goal is and what they have under their
         * control.
         */
        case "intro": {
            gameState.stored.planetIndex = 0
            puzzleMenu(gameState, 1, PLANET_DATA[0].puzzles,"introDoor")
            gameState.keyPressed = key => {
                console.log(key)
                if (key == 'Escape' || key == 'ArrowLeft') {
                    loadScene(gameState,"introDoor")
                }
            }
            break
        }

        /**
         * 1x1 to gradually introduce the slider/target mechanics
         */
        case "intro1": {
            const gridLeft = new Grid({
                canvasX:560, canvasY:430, canvasWidth:100, canvasHeight:100, 
                gridXMin:0, gridYMin:0, gridXMax:1, gridYMax:1, labels:false, arrows:false
            })

            const gridRight = new Grid({canvasX:900, canvasY:430, canvasWidth:100, canvasHeight:100,
                gridXMin:0, gridYMin:0, gridXMax:1, gridYMax:1, labels:false, arrows:false
            })
            
            const slider = new Slider({grid:gridRight, gridPos:0})

            const target = new Target({grid: gridLeft, gridX:1, gridY:1, size:15})
            const tracer = new IntegralTracer({grid: gridLeft, sliders: [slider], targets:[target]})
            gameState.objects = [gridLeft, gridRight, slider, target, tracer]
            gameState.update = () => { }
            levelNavigation(gameState, (() => tracer.solved))
            break
        }

        /**
         * 2x2
         */
        case "intro2": {
            const gridLeft = new Grid({canvasX:560, canvasY:430, canvasWidth:200, canvasHeight:200, 
                gridXMin:-1, gridYMin:0, gridXMax:1, gridYMax:2, labels:false, arrows:false})
            //const gridLeft = new Grid(560, 430, 200, 200, 2, 2, 5)
            const gridRight = new Grid({canvasX:900, canvasY:430, canvasWidth:200, canvasHeight:200, 
                gridXMin:-1, gridYMin:-1, gridXMax:1, gridYMax:1, labels:false, arrows:false})
            const sliders = [
                new Slider({grid:gridRight, gridPos:-1}),
                new Slider({grid:gridRight, gridPos:0}),
            ]
            const targets = [
                new Target({grid: gridLeft, gridX:0, gridY:1, size:15}),
                new Target({grid: gridLeft, gridX:1, gridY:2, size:15})
            ]
            const tracer =  new IntegralTracer({grid: gridLeft, sliders: sliders, targets:targets})
            gameState.objects = [gridLeft, gridRight, tracer].concat(sliders).concat(targets)
            gameState.update = () => { }
            levelNavigation(gameState, (() => tracer.solved))
            break
        }

        /**
         * Now go to 4x4 but still only move in positive direction or 0.
         */
        case "intro4Pos": {
            simpleDiscLevel(gameState, [0, 1, 1, 2])
            break
        }

        /**
         * Introduce negative direction.
         */
        case "introNeg": {
            simpleDiscLevel(gameState, [1, 0, -1, 0])
            break
        }

        /**
         * Sliders can be set to partial units, specifically half
         */
        case "introFrac": {
            simpleDiscLevel(gameState, [0.5, 1, 0.5, 1.5])
            break
        }

        /**
         * Reinforce previous levels, also use max slider values
         */
        case "introCombined": {
            simpleDiscLevel(gameState, [2, 1.5, -0.5, -2])
            break
        }

        /**
         * - If sliders are on half units, the resulting slope is halved.
         */
        case "intro8": {
            simpleDiscLevel(gameState, [1, 0.5, -0.1, -0.8, -0.4, 0.6, 0.2, 0.4])
            break
        }

        /**
         * A final challenge for the introduction. The only time we will actually ask for 16 sliders
         * to be manually moved.
         */
        case "intro16": {
            simpleDiscLevel(gameState, [0.25, 0.5, 0.75, 1, 1.25, 1, 0.75, 0.5,
                0.25, 0, 0.5, 1, 0.5, 0, 0.5, 1], tracerStart = 0, targetSize = 12, sliderSize = 12)
            break
        }

        // -----------------------------------------------------------------------------------------------------
        case "linearExperiment":{
            experimentMenu(gameState, "introDoor")
            break
        }

        case "linearTrial1":{
            experimentTrial(gameState, "linearExperiment", {function: x=>0.5*x,derivative:x=>0.5})
            break
        }

        //------------------------------------------------------------------------------------------------------
        // Quadratic Planet
        //------------------------------------------------------------------------------------------------------
        case "quadDoor": {
            const completion = planetCompletion(gameState)
            const door_button = new Button({originX:1160, originY:460, widht:100, height:150, onclick:(() => { loadScene(gameState, "ship") }), label:""})
            door_button.visible = false


            
            gameState.objects = [
                new ImageObject(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, "quad_img"),
                new ImageObject(1000, 250, 400, 500, "ship_img"),
                door_button
            ]
            gameState.objects.push({
                update: function(ctx){
                    Color.setColor(ctx,Color.black)
                    ctx.fillRect(1186,480,48,114)
                }
            })   
            break
        }

        /**
         * Quadratic Levels
         * We introduce the mathblock interface while teaching that the 
         * derivative of $x^2$ is $x$. We don't actually identify the 
         * quadratic as $x^2$ until the next section.
         */
        case "quadMenu": {
            puzzleMenu(gameState, 2, PLANET_DATA[1].puzzles,"quadDoor") 
            break
        }

        /**
         * - A quadratic shape on the left can be achieved by a linear
         *   shape on the right.
         */
        case "quad4": {
            quadDiscLevel(gameState, 4)
            break
        }

        /**
         * - As we add more sliders the curve becomes smoother
         */
        case "quad8": {
            quadDiscLevel(gameState, 8)
            break
        }

        case "quad16": {
            quadDiscLevel(gameState, 16, true)
            break
        }

        case "quad32": {
            quadDiscLevel(gameState, 32, true)
            break
        }

        case "quadSmooth": {
            quadDiscLevel(gameState, 200, true)
            break
        }


        case "quadShort4": {
            quadDiscLevel(gameState, 4, false, x => x*x/4)
            break
        }
        case "quadShort8": {
            quadDiscLevel(gameState, 8, false, x => x*x/4)
            break
        }
        case "quadShort16": {
            quadDiscLevel(gameState, 16, true, x => x*x/4)
            break
        }
        case "quadShort32": {
            quadDiscLevel(gameState, 16, true, x => x*x/4)
            break
        }
        case "quadShortSmooth": {
            quadDiscLevel(gameState, 200, true, x => x*x/4)
            break
        }

        case "quadNeg4": {
            quadDiscLevel(gameState, 4, false, x => -x*x/2+2)
            break
        }
        case "quadNeg8": {
            quadDiscLevel(gameState, 8, false, x => -x*x/2+2)
            break
        }
        case "quadNeg16": {
            quadDiscLevel(gameState, 16, true, x => -x*x/2+2)
            break
        }
        case "quadNeg32": {
            quadDiscLevel(gameState, 32, true, x => -x*x/2+2)
            break
        }
        case "quadNegSmooth": {
            quadDiscLevel(gameState, 200, true, x => -x*x/2+2)
            break
        }

        /**
         * Cubic levels
         * 
         * - Another thing that could be good for cubic is triple discrete graphs.
         */
        case "cubic": {
            puzzleMenu(gameState, "3")
            break
        }

        case "cubic4": {
            twoGridLevel(gameState, 4, null, x => x * x * x / 6)
            break
        }

        case "cubic8": {
            twoGridLevel(gameState, 8, null, x => x * x * x / 6)
            break
        }

        case "cubic16": {
            twoGridLevel(gameState, 16, 2, x => x * x * x / 6)
            break
        }

        case "cubic32": {
            twoGridLevel(gameState, 32, 2, x => x * x * x / 6)
            break
        }

        case "cubic400": {
            twoGridLevel(gameState, 400, 2, x => x * x * x / 6)
            break
        }



        /**
         * Small scale
         */
        case "cubic5": {
            const fun = x => x * x * x / 10
            cubicContLevel(gameState, fun)
            break
        }

        /**
         * 
         */
        case "cubic6": {
            const fun = x => x * x * x * 2 / 3 - x * 2
            cubicContLevel(gameState, fun)
            break
        }

        case "cubic7": {
            const fun = x => -x * x * x * 2 / 3 + x * 2
            cubicContLevel(gameState, fun)
            break
        }

        case "cubic8": {
            const fun = x => 0.1 * x * x * x + 0.3 * x * x + 0.3 * x - 1
            cubicContLevel(gameState, fun)
            break
        }



        /**
         * Exponential Levels
         * 
         */
        case "exp": {
            puzzleMenu(gameState, "4")
            break
        }

        case "exp1": {
            expDiscLevel(gameState, 4)
            break
        }

        case "exp2": {
            expDiscLevel(gameState, 8)
            break
        }

        case "exp3": {
            expDiscLevel(gameState, 16)
            break
        }

        /**
         * 
         */
        case "exp4": {
            const fun = x => Math.E ** x / 2
            const blocks = [[MathBlock.VARIABLE, "x"], [MathBlock.POWER, "2"], [MathBlock.EXPONENT, "e"]]
            const grid_setting = { grid_width: 4, grid_height: 4, x_axis: 4, y_axis: 2 }
            genContLevel(gameState, fun, blocks, grid_setting)
            break
        }

        case "exp5": {
            const fun = x => Math.E ** x / 2
            const blocks = [[MathBlock.VARIABLE, "x"], [MathBlock.POWER, "2"], [MathBlock.EXPONENT, "e"]]
            const grid_setting = { grid_width: 4, grid_height: 4, x_axis: 4, y_axis: 2 }
            genContLevel(gameState, fun, blocks, grid_setting)
            break
        }

        case "sin": {
            puzzleMenu(gameState, "5", "sin")
            break
        }

        case "sin1": {
            sinDiscLevel(gameState, 4, "sin2", 4)
            break
        }

        case "sin2": {
            sinDiscLevel(gameState, 8, "sin3", 4)
            break
        }

        case "sin3": {
            sinDiscLevel(gameState, 8, "sin4", 8)
            break
        }

        case "sin4": {
            sinDiscLevel(gameState, 16, "sin5", 8)
            break
        }

        /**
         * 6 sum
         * 
         * Discrete intuition:
         * When we add two functions 
         * 
         * sin(x) + x^2
         * 
         * the rate of change of one function is 
         * added to the rate of change of the other...
         * 
         * x^2 + sin(x)
         * 
         * Are we graphing only the highlighted block here?
         * Can you highlight a block on the lhs...
         * Yes, but the sum is still shown as well.
         * 
         */

        case "sum": {
            puzzleMenu(gameState, "6", "sum")
            break
        }


        case "sum1": {
            const fun = x => x * x / 8 + Math.sin(x)
            const blocks = [[MathBlock.VARIABLE, "x"], [MathBlock.POWER, "2"], [MathBlock.EXPONENT, "e"], [MathBlock.FUNCTION, "sin"], [MathBlock.BIN_OP, "+"]]
            genContLevel(gameState, fun, blocks)
            break
        }


        /**
         * 7 prod
         * 
         * Discrete intuition
         * 
         * Multiplying 
         * 
         * x^2 sin(x)
         * 
         * 2x sin(x) + cos(x) x^2
         * 
         * x * x is a good puzzle since it calls back to something 
         * we already know
         * 
         * (f * g)' = f' * g + g' * f
         * 
         * 
         * Area of a rectangle is good intuition here...
         * 
         */

        case "prod": {
            puzzleMenu(gameState, "7", "prod")
            break
        }

        case "prodTest": {
            const fun = x => x * x / 8 + Math.sin(x)
            const blocks = [[MathBlock.VARIABLE, "x"], [MathBlock.POWER, "2"], [MathBlock.EXPONENT, "e"], [MathBlock.FUNCTION, "sin"], [MathBlock.BIN_OP, "+"], [MathBlock.BIN_OP, "*"]]
            genContLevel(gameState, fun, blocks)
            break
        }

        /**
         * 8 chain
         */

        case "chain": {
            puzzleMenu(gameState, "8", "chain")
            break
        }

        /**
         * Chain rule
         * 
         * Discrete: inputs become outputs....
         * f(g(x))' = f'(g(x)) g'(x)
         * Output of g is input of f
         * So rate of change of f (g(x)) is
         * rate of change of  
         * 
         * sin(x^2)
         * 
         * e^(x^2)
         * 
         * (sin(x))^2
         * 
         * (e^x)^2
         * 
         */

    }
}


