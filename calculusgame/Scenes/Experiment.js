import {Color, Shapes} from '../util/index.js'
import {Grid, FunctionTracer, Button, ImageObject, IntegralTracer, MathBlock, MathBlockManager, MathBlockField, Slider, Target, TargetAdder, TextBox} from '../GameObjects/index.js'
import { loadScene, PLANET_DATA } from '../Scene.js'

const EXPERIMENT_DATA = {
    'linearTrial1':{
        solutionFun: x=>0.5*x,
        solutionDdx:x=>0.5,
        solutionFunString:"0.5t",
        solutionDdxString:"0.5"
    },
    'linearTrial2':{
        solutionFun: x=>5-0.5*x,
        solutionDdx: x=>-0.5,
        solutionFunString:"-0.5t + 5",
        solutionDdxString:"-0.5"
    },
    'linearTrial3':{
        solutionFun: x=>1+1.5*x,
        solutionDdx: x=>-0.5,
        solutionFunString:"1.5t + 1",
        solutionDdxString:"1.5"
    },
    'linearTrial4':{
        solutionFun: x=>2*x,
        solutionDdx: x=>2,
        solutionFunString:"2 t",
        solutionDdxString:"2"
    },
    'linearTrial5':{
        solutionFun: x=>10-x,
        solutionDdx: x=>-1,
        solutionFunString:"-1t + 10",
        solutionDdxString:"-1"
    }
}

export function experimentTrial(gameState, experimentMenu){

    const gss = gameState.stored

    const solutionFun = EXPERIMENT_DATA[gss.sceneName].solutionFun
    const solutionDdx = EXPERIMENT_DATA[gss.sceneName].solutionDdx
    const solutionFunString = EXPERIMENT_DATA[gss.sceneName].solutionFunString
    const solutionDdxString = EXPERIMENT_DATA[gss.sceneName].solutionDdxString


    // Back button
    const exitTo = experimentMenu
    const backButton = new Button({originX:50, originY:50, width:50, height:50,
        onclick:(() => loadScene(gameState,exitTo)), label:"↑"})

    // Grid
    const gridLeft = new Grid({canvasX:100, canvasY:400, canvasWidth:400, canvasHeight:400, 
        gridXMin:0, gridXMax:10, gridYMin:0, gridYMax:10, labels:true})

    const sySlider = new Slider({canvasX: 580, canvasY:400, canvasLength:400, sliderLength:4, maxValue:2, showAxis: true})
    const tySlider = new Slider({canvasX: 650, canvasY:400, canvasLength:400, sliderLength:10, maxValue:10, showAxis: true})
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
            const image = document.getElementById("quad_img")
            Color.setColor(ctx,Color.darkBlack)
            Shapes.Rectangle({ctx:ctx, originX:900, originY:200, width:700, height:700, inset:true})
            ctx.drawImage(image, 0,0, 1600*600/900,900, 910, 210, 680, 680)
        }
    }

    // TURTLE
    const maxTime = 10
    var time = 0
    var playing = true
    var startTime = Date.now()
    var startValue = 0
    const maxDist = 500
    const turtle = {
        originX:1000,
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
            const width = 80
            var x = 0
            if (step == 2){
                x = turtle.originX - width + (funTracer.fun(time) * maxDist/maxTime)
            }else if (step >= 3){
                x = turtle.originX - width + (solutionFun(time) * maxDist/maxTime)
                Color.setColor(ctx, Color.red)
                const dx = funTracer.fun(time)* maxDist/maxTime
                if (dx != 0){
                    Shapes.Line(ctx, x+width-5, 500+width/2, x+width-5+dx, 500+width/2, 5, "arrow", 5,true)
                }
            }
            Color.setColor(ctx,Color.green)
            Shapes.Rectangle({ctx:ctx, originX:x, originY:500, width:width,height:width, inset:true})
        }
    }

    // TIME CONTROLS
    const tSlider = new Slider({canvasX:920,canvasY:150,canvasLength:500,sliderLength:10, maxValue:10, vertical:false, showAxis:true})
    const timeLabel = new TextBox({originX:900,originY:80, font:'26px monospace'})
    const playPauseButton = new Button({originX:1450,originY:120,width:50,height:50,
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

    const text1 = {
        update: function(ctx){
            Color.setColor(ctx,Color.white)
            ctx.font = '20px monospace'
            ctx.textAlign = 'start'
            ctx.textBaseline = 'top'
            ctx.fillText('Step 1: Measure the turtle\'s position over time.', 150,50)
            ctx.fillText("Click on the graph to add measurements.", 150,80)
            ctx.translate(25,700)
            ctx.rotate(-Math.PI/2)
            ctx.fillText("Position p(t)", 0,0)
            ctx.resetTransform()
            ctx.fillText("Time t", 250, 850)
        }
    }

    const text2 = {
        update: function(ctx){
            Color.setColor(ctx,Color.white)
            ctx.font = '20px monospace'
            ctx.textAlign = 'start'
            ctx.textBaseline = 'top'
            ctx.fillText('Step 2: Guess the turtle\'s position function, p(t).', 150,50)
            ctx.fillText("Use the blocks to set the function.", 150,80)
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
            ctx.fillText('Step 3: Guess the turtle\'s velocity function, v(t).', 150,50)
            ctx.fillText("Use the blocks to set the function.", 150,80)
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

    const errorText = new TextBox({originX:880, originY:140, align: 'right'})

    var step = 1
    const minCorrectTargets = 5
    const SKIP_CHECKS = false // debug option
    const continueButton = new Button({originX:740, originY:50, width:100, height:60, fontSize:16,
        onclick:(() => {
            if (step == 1){
                const numCorrect = checkTargets()
                if (numCorrect >= minCorrectTargets || SKIP_CHECKS){
                    adder.targets = adder.targets.filter(t => t.unhitColor == Color.magenta)
                    gameState.objects = mainObjs.concat(step2Objs).concat(adder.targets)
                    funTracer.targets = adder.targets
                    errorText.content = ''
                    step ++
                }else{
                    errorText.content = numCorrect + '/' + minCorrectTargets + ' correct measurements'
                }
            }else if (step == 2){
                const check = checkFunctionsEqual(solutionFun, funTracer.fun)
                if (check.res || SKIP_CHECKS){
                    smallTracer.fun = solutionFun
                    mngr.reset()
                    errorText.content = ''
                    step++
                    gameState.objects = mainObjs.concat(step3Objs)
                }else{
                    errorText.content = 'p(' + check.x + ') should be ' + solutionFun(check.x).toFixed(2) + ' not ' + funTracer.fun(check.x).toFixed(2)
                }
            }else if (step == 3){
                const check = checkFunctionsEqual(solutionDdx, funTracer.fun)
                if (check.res || SKIP_CHECKS){
                    funTracer.fun = solutionDdx
                    errorText.content = ''
                    step++
                    gameState.objects = mainObjs.concat(step4Objs)
                    gameState.stored.completedScenes[gameState.stored.sceneName] = true
                }else{
                    errorText.content = 'v(' + check.x + ') should be ' + solutionDdx(check.x).toFixed(2) + ' not ' + funTracer.fun(check.x).toFixed(2)
                }
            }else if (step == 4){ // SOLVED
                
                loadScene(gameState,exitTo)
            }
        }),
         label:"Continue"})

    const mainObjs = [backButton, gridLeft, bgImage, tSlider, timeLabel, turtle, playPauseButton, numberLine, continueButton, errorText]
    const step1Objs = [text1, adder]
    const step2Objs = [sySlider, tySlider, text2, funTracer, fakeTurtle, mngr]
    const step3Objs = [sySlider, tySlider, text3, funTracer, smallGrid, smallTracer, fakeTurtle, mngr]
    const step4Objs = [text4, funTracer, smallGrid, smallTracer, fakeTurtle]
    gameState.objects = mainObjs.concat(step1Objs)
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
export function experimentMenu(gameState){
    const gss = gameState.stored
    const trials = PLANET_DATA[gss.planet].trials

    const backButton = new Button({originX:50, originY:50, width:50, height:50,
        onclick:(() => loadScene(gameState,PLANET_DATA[gss.planet].scene)), label:"↑"})
    backButton.lineWidth = 5
    const trialButtons = []

    for (let i = 0; i < trials.length; i++){
        const button = new Button({originX:200,originY:150+i*60,width:100, height:50,
            onclick:(() => loadScene(gameState,trials[i])), label:i+1})
        button.lineWidth = 5

        if (gameState.stored.completedScenes[trials[i]]) {
            button.bgColor = Color.blue
        }
        trialButtons.push(button)
    }
    const ruleButton = new Button({originX:200,originY:780,width:100,height:50,
        onclick:(() => loadScene(gameState, PLANET_DATA[gss.planet].rule)),label:"Rule"})
    if (gss.completedScenes[PLANET_DATA[gss.planet].rule] == 'complete') {
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
            for (let i = 0; i < trials.length; i++){
                if (EXPERIMENT_DATA[trials[i]]){
                    ctx.fillText(EXPERIMENT_DATA[trials[i]].solutionFunString,400,150+i*60)
                    if (gss.completedScenes[trials[i]])
                        ctx.fillText(EXPERIMENT_DATA[trials[i]].solutionDdxString,800,150+i*60)
                }
            }
            ctx.fillText("f(x) = ax+b",400,780)
            ctx.fillText("f'(x) = " + (gss.completedScenes['linearRule'] ? 'a' : ''),800,780)

        }
    }
    gameState.objects = [
        backButton,table,ruleButton
    ]
    gameState.objects = gameState.objects.concat(trialButtons)
}

export function ruleGuess(gameState){
    const gss = gameState.stored
    const blocks = [
        new MathBlock({type:MathBlock.VARIABLE, token:"x"}),
        new MathBlock({type:MathBlock.VARIABLE, token:"a"}),
        new MathBlock({type:MathBlock.VARIABLE, token:"b"}),
    ]
    for (let b of gss.mathBlocksUnlocked){
        blocks.push(new MathBlock({type: b.type, token: b.token}))
    }

    

    const sySlider = new Slider({canvasX: 1200, canvasY: 200, maxValue:5, sliderLength:10, startValue: 1, showAxis:true})
    const tySlider = new Slider({canvasX: 1300, canvasY: 200, maxValue:5, sliderLength:10, showAxis:true})
    const mbField = new MathBlockField({minX:700, minY:150, maxX:1000, maxY:300})
    const mbm = new MathBlockManager({blocks : blocks, originX: 700, originY:160, outputType:"none",
        scaleYSlider: sySlider, translateYSlider:tySlider,
        blockFields: [ mbField ],
    })

    const targetBlock = new MathBlock({type: MathBlock.BIN_OP, token:"+", originX: 200, originY: 150})
    const multBlock = new MathBlock({type: MathBlock.BIN_OP, token:"*"})
    multBlock.setChild(0, new MathBlock({type: MathBlock.VARIABLE, token:"a"})) 
    multBlock.setChild(1, new MathBlock({type: MathBlock.VARIABLE, token:"x"})) 
    targetBlock.setChild(0, multBlock) 
    targetBlock.setChild(1, new MathBlock({type: MathBlock.VARIABLE, token:"b"}))

    const correctDdx = (x,a,b) => a
    const checkResult = new TextBox({originX: 100, originY: 550, font:'30px monospace', align:'left', baseline:'top'})
    const checkButton = new Button({originX: 100, originY:400, width: 200, height: 100, label:"Check",
        onclick: () => {
            if (mbField.rootBlock == null || mbField.rootBlock.toFunction() == null){
                checkResult.content = 'No function set'
                return
            } 
                
            // What is an appropriate number of checks here? Somewhere from 100 to 10000
            var correct = true
            for(let a = -10; a <= 10; a += 5){
            for (let b = -10; b <= 10; b += 5){
                const fun = mbField.rootBlock.toFunction({a:a, b:b})
            for (let x = -10; x <= 10; x++){
                const y1 = fun(x)
                const y2 = correctDdx(x,a,b)
                if (Math.abs(y1 - y2) > 0.00001){
                    correct = false
                    break
                }
            }
            }
            }
            if (correct){
                checkResult.content = 'Correct!'
                gss.completedScenes[gss.sceneName] = 'complete'
                if (gss.planetProgress['Quadratic'] != 'complete')
                    gss.planetProgress['Quadratic'] = 'in progress'
            }else{
                checkResult.content = 'Incorrect'
            }
        }
     })

    gameState.objects = [
        new TextBox({originX: 50, originY:200, content:'f(x) =', font:'40px monospace'}),
        new TextBox({originX: 500, originY:200, content:'f\'(x) =', font:'40px monospace'}),
        new Button({originX:50, originY:50, width:50, height:50,
            onclick:(() => loadScene(gameState,"linearExperiment")),
            label:"↑", lineWidth:5}),
        sySlider, tySlider, mbm, targetBlock,
        checkButton, checkResult
    ]
    gameState.update = () => { }

}