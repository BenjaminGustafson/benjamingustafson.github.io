import {Color, Shapes} from '../util/index.js'
import {Grid, FunctionTracer, Button, ImageObject, IntegralTracer, MathBlock, MathBlockManager, MathBlockField, Slider, Target, TargetAdder, TextBox} from '../GameObjects/index.js'
import { loadScene } from '../Scene.js'
import * as Planet from './Planet.js'

export function experimentTrial(gameState, {
    solutionFun, solutionDdx,
    solutionFunString,
    solutionDdxString,
    syFunMax, syFunLen, tyFunMax, tyFunLen,
    syDdxMax, syDdxLen, tyDdxMax, tyDdxLen,
    numMeasurement,
    ddxSliderSpacing,
}){

    const gss = gameState.stored

    // Back button
    const backButton = new Button({originX:50, originY:50, width:50, height:50,
        onclick:(() => loadScene(gameState,gss.planet + ".lab")), label:"↑"})

    // Grid
    const gridLeft = new Grid({canvasX:100, canvasY:400, canvasWidth:400, canvasHeight:400, 
        gridXMin:0, gridXMax:10, gridYMin:0, gridYMax:10, labels:true})

    const gridRight = new Grid({canvasX:580, canvasY:400, canvasWidth:400, canvasHeight:400, 
        gridXMin:0, gridXMax:10, gridYMin:-2, gridYMax:2, labels:true})

    const sySlider = new Slider({canvasX: 580, canvasY:400, canvasLength:400, sliderLength:10, maxValue:5, showAxis: true})
    const tySlider = new Slider({canvasX: 650, canvasY:400, canvasLength:400, sliderLength:10, maxValue:5, showAxis: true})
    const adder = new TargetAdder({grid:gridLeft})
    const funTracer = new FunctionTracer({grid:gridLeft})

    const blocks = [new MathBlock({type:MathBlock.VARIABLE, token:'t'})]
    for (let b of gss.mathBlocksUnlocked){
        blocks.push(new MathBlock({type: b.type, token: b.token}))
    }
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
    const maxTime = 10
    var time = 0
    var playing = true
    var startTime = Date.now()
    var startValue = 0
    const maxDist = 400
    const turtle = {
        originX:1100,
        originY:700,
        update: function(ctx){
            const width = 100
            Color.setColor(ctx,Color.green)
            const x = this.originX - width + (solutionFun(time) * maxDist/maxTime)
            ctx.font = "100px monospace"
            ctx.translate(x,this.originY)
            ctx.scale(-1,1)
            ctx.textAlign = 'right'
            ctx.fillText("🐢", 0, 0)
            ctx.resetTransform()
        }
    }

    const fakeTurtle = {
        update: function (ctx){
            // const width = 80
            // var x = 0
            // if (step == 2){
            //     x = turtle.originX - width + (funTracer.fun(time) * maxDist/maxTime)
            // }else if (step >= 3){
            //     x = turtle.originX - width + (solutionFun(time) * maxDist/maxTime)
            //     Color.setColor(ctx, Color.red)
            //     const dx = funTracer.fun(time)* maxDist/maxTime
            //     if (dx != 0){
            //         Shapes.Line(ctx, x+width-5, 500+width/2, x+width-5+dx, 500+width/2, 5, "arrow", 5,true)
            //     }
            // }
            // Color.setColor(ctx,Color.green)
            // Shapes.Rectangle({ctx:ctx, originX:x, originY:500, width:width,height:width, inset:true})
        }
    }

    // TIME CONTROLS
    const tSlider = new Slider({canvasX:1100,canvasY:150,canvasLength:450,
        sliderLength:10, maxValue:10, vertical:false, increment:1})
    const timeLabel = new TextBox({originX:1000,originY:80, font:'26px monospace'})
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

    const numberLine = {
        update: function(ctx){
            const originX = turtle.originX 
            const originY = turtle.originY+20
            const length = maxDist
            const numTicks = 10
            const lineWidth = 5
            const tickLength = 10
            Color.setColor(ctx, Color.white)
            Shapes.RoundedLine(ctx, originX, originY, originX + length, originY, lineWidth)

            ctx.font = '24px monospace'
            ctx.textAlign = 'left'
            ctx.textBaseline = 'top'
            ctx.fillText('p(t) = ' + solutionFun(time).toFixed(1), turtle.originX, turtle.originY -100)
            
            ctx.font = '20px monospace'
            for (let i = 0; i < numTicks + 1; i++) {
                const tickX = originX + length / numTicks * i
                ctx.fillText(i, tickX, originY + tickLength + 5)
                Shapes.RoundedLine(ctx, tickX, originY - tickLength, tickX, originY + tickLength, lineWidth)
            }
        }
    }

    const sliders = []
    const spacing = ddxSliderSpacing
    for (let i = gridRight.gridXMin; i < gridRight.gridXMax; i+=spacing) {
        sliders.push(new Slider({grid:gridRight, gridPos:i,increment:0.1,circleRadius:15}))
    }
    const tracer = new IntegralTracer({grid: gridLeft, originGridY: solutionFun(0), 
        input: {type:'sliders', sliders:sliders}, targets:adder.targets})

    const ddxTargets = []



    const text1 = {
        update: function(ctx){
            Color.setColor(ctx,Color.white)
            ctx.font = '20px monospace'
            ctx.textAlign = 'start'
            ctx.textBaseline = 'top'
            ctx.fillText('Step 1: Measure the turtle\'s position over time.', 150,50)
            ctx.fillText("Click on the graph to add measurements.", 150,80)
            ctx.fillText(`Make at least ${numMeasurement} measurements, and then click continue.`, 150,110)
            if (gss.sceneName == 'linear.trial.1')  ctx.fillText("Hint: Measure t=0,2,4,6,8.", 150,140)
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
            ctx.fillText('Step 3: Guess the turtle\'s position function, p(t).', 150,50)
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
            ctx.fillText('Step 4: Guess the turtle\'s velocity function, v(t).', 150,50)
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
            if (Math.abs(solutionFun(gx) - gy) < 0.00001){
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
    
        /**
         * It should be hard to accidentally make a function that
         * is incorrect but hits integers [0,10].
         *  We check [0,10] by 0.1 as well just in case.
         * Integers are done first so that the error output is usually an int.
         * 
         * It is possible to fool the checker at any precision,
         * by doing something like (0.1)^n + correct function.
         * This is acceptable since it pretty much requires the
         * player to be fooling the checker on purpose, and so 
         * should not come up by accident.
         */
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
                    gridLeft.setYBounds(-2,2)
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

    const mainObjs = [backButton, gridLeft, continueButton, errorText, bgImage, tSlider, timeLabel, turtle, numberLine, playPauseButton,]
    const measureFObjs = [text1, adder, ]
    const meaureDdxObjs = [mDdxText, gridRight, tracer].concat(sliders)
    const fitFObjs = [sySlider, tySlider, text2, funTracer, fakeTurtle, mngr]
    const fitDdxObjs = [sySlider, tySlider, text3, funTracer, smallGrid, smallTracer, fakeTurtle, mngr]
    const solvedObjs = [text4, funTracer, smallGrid, smallTracer, fakeTurtle]
    gameState.objects = mainObjs.concat(measureFObjs)
    gameState.update = () => {
        tSlider.active = !playing
        if (playing){
            time = (Date.now() - startTime)/1000 + startValue // time in secs to 1 decimal
            tSlider.moveToValue(time)
            playPauseButton.label =  '⏸'
        }else{
            playPauseButton.label =  '⏵'
            time = tSlider.value
        }
        if (time >= maxTime){
            time = maxTime
            playing = false
            playPauseButton.label = '⏮'
        }
        timeLabel.content = "t = " + time.toFixed(1)
    }

}



/**
 * 
 * 
 * @param {*} gameState 
 * @param {*} exitTo 
 */
export function experimentMenu(gameState, {experimentData, ruleFunString, ruleDdxString}){
    const gss = gameState.stored

    const backButton = new Button({originX:50, originY:50, width:50, height:50,
        onclick:(() => loadScene(gameState, gss.planet)), label:"↑"})
    backButton.lineWidth = 5
    const trialButtons = []

    let i = 0 
    for (let exp in experimentData){
        const expName = gss.planet + ".trial." + exp
        const button = new Button({originX:200,originY:150+(i++)*60,width:100, height:50,
            onclick:(() => loadScene(gameState,expName)), label:exp})
        button.lineWidth = 5

        if (gameState.stored.completedScenes[expName]) {
            button.bgColor = Color.blue
        }
        trialButtons.push(button)
    }
    const ruleButton = new Button({originX:200,originY:780,width:100,height:50,
        onclick:(() => loadScene(gameState, gss.planet+".trial.rule")),label:"Rule"})
    if (gss.completedScenes[gss.planet+".trial.rule"] == 'complete') {
        ruleButton.bgColor = Color.blue
    }
    const table = {
        update: function(ctx){
            Color.setColor(ctx,Color.white)
            ctx.font = '40px monospace'
            ctx.textAlign = 'start'
            ctx.textBaseline = 'alphabetic'
            ctx.fillText('Trial', 200,100)
            ctx.fillText('p(t)', 400,100)
            ctx.fillText('v(t)', 800,100)
            Color.setColor(ctx,Color.lightGray)
            Shapes.Line(ctx,150,120,1500,120)
            Shapes.Line(ctx,350,50,350,850)
            Shapes.Line(ctx,750,50,750,850)
            Shapes.Line(ctx,150,760,1500,760)
            ctx.textBaseline = 'top'
            var i = 0
            for (let exp in experimentData){
                const expName = gss.planet + ".trial." + exp
                if (gss.completedScenes[expName]){
                    ctx.fillText(experimentData[exp].solutionFunString,400,150+i*60)
                    ctx.fillText(experimentData[exp].solutionDdxString,800,150+i*60)
                }
                i++
            }
            ctx.fillText("f(x) = "+ruleFunString,400,780)
            ctx.fillText("f'(x) = " + (gss.completedScenes[gss.planet+".trial.rule"] ? ruleDdxString : ''),800,780)

        }
    }
    gameState.objects = [
        backButton,table,ruleButton
    ]
    gameState.objects = gameState.objects.concat(trialButtons)
}

export function ruleGuess(gameState, {planetUnlock, blocks, targetBlock, correctDdx}){
    const gss = gameState.stored
    var state = 'no attempt' // 'incorrect' 'correct' 'solved'
    const backButton = Planet.backButton(gameState)
    const nextButton = Planet.nextButton(gameState, ['planetMap'])
    
    const sySlider = new Slider({canvasX: 1200, canvasY: 200, maxValue:5, sliderLength:10, startValue: 1, showAxis:true})
    const tySlider = new Slider({canvasX: 1300, canvasY: 200, maxValue:5, sliderLength:10, showAxis:true})
    const mbField = new MathBlockField({minX:700, minY:200, maxX:1100, maxY:300})
    const mbm = new MathBlockManager({blocks : blocks, toolBarX: 1400, toolBarY:150, outputType:"none",
        scaleYSlider: sySlider, translateYSlider:tySlider,
        blockFields: [ mbField ],
    })

    
    const checkResult = new TextBox({originX: 100, originY: 550, font:'30px monospace', align:'left', baseline:'top'})
    const checkButton = new Button({originX: 100, originY:400, width: 200, height: 100, label:"Check",
        onclick: () => {
            if (mbField.rootBlock == null || mbField.rootBlock.toFunction() == null){
                checkResult.content = 'No function set'
                return
            } 
                
            // What is an appropriate number of checks here? Somewhere from 100 to 10000
            var correct = true
            outerLoop: for(let a = -10; a <= 10; a += 5){
            for (let b = -10; b <= 10; b += 5){
                const fun = mbField.rootBlock.toFunction({'a':a, 'b':b})
            for (let x = -10; x <= 10; x++){
                const y1 = fun(x)
                const y2 = correctDdx(x,a,b)
                if (Math.abs(y1 - y2) > 0.00001){
                    correct = false
                    //break outerLoop
                }
            }
            }
            }
            if (correct){
                checkResult.content = 'Correct!'
                state = 'correct'
                gss.completedScenes[gss.sceneName] = 'complete'
                if (gss.planetProgress[planetUnlock] == null || gss.planetProgress[planetUnlock] == 'locked')
                    gss.planetProgress[[planetUnlock]] = 'unvisited'

                // Unlock TODO: have a popup the first time this happens
                if (gss.navPuzzleMastery[gss.planet] == null){
                    gss.navPuzzleMastery[gss.planet] = 0
                }
            }else{
                state = 'incorrect'
                checkResult.content = 'Incorrect'
            }
        }
     })

    gameState.objects = [
        new TextBox({originX: 50, originY:200, baseline:'top', content:'f(x) =', font:'40px monospace'}),
        new TextBox({originX: 500, originY:200, baseline:'top', content:'f\'(x) =', font:'40px monospace'}),
        new Button({originX:50, originY:50, width:100, height:100,
            onclick:(() => loadScene(gameState,gss.planet+".lab")),
            label:"↑", lineWidth:5}),
        nextButton,
        sySlider, tySlider, mbm, targetBlock,
        checkButton, checkResult
    ]

    gameState.update = (audio) => {
        if (state == 'correct'){
            Planet.unlockPopup(gameState, {itemImage:'shipSide', topText:`You solved the ${capFirst(gss.planet)} Rule!`, bottomText:`You can now travel to ${capFirst(planetUnlock)} Planet.`})
            state = 'solved'
        } 
    }

    Planet.winCon(gameState, ()=>state == 'solved', nextButton)
}

function capFirst(str) {
    if (!str) return "";
    return str[0].toUpperCase() + str.slice(1);
}
