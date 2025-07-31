import {Color, Shapes} from '../util/index.js'
import {Grid, FunctionTracer, Button, ImageObject, IntegralTracer, MathBlock, MathBlockManager, MathBlockField, Slider, Target, TargetAdder, TextBox} from '../GameObjects/index.js'
import { loadScene, PLANET_DATA, CANVAS_HEIGHT, ALL_BLOCKS } from '../Scene.js'

/**
 * 
 * The randomly generated navigation levels
 * 
 */
export function rngLevel(gameState) {
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


    const math_blocks = ALL_BLOCKS
    // for (let i = 0; i < blocks.length; i++) {
    //     math_blocks.push(new MathBlock({type:blocks[i][0], token:blocks[i][1], originX:1300, originY:150 + 100 * i}))
    // }
    const blockField = new MathBlockField({minX: 600, minY:250, maxX: 1000, maxY:350})
    const mngr = new MathBlockManager({blocks:math_blocks,
        translateYSlider:tySlider, scaleYSlider:sySlider,
        blockFields: [blockField],
        funTracers: [funRight],
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
            Shapes.Line(ctx, 1250,320,1100,320,5,"arrow",5,true)
        }
    }

    gameState.temp.state = "Input"
    gameState.objects = [toolTip, gridLeft, gridRight, tySlider, sySlider, funRight, tracer, backButton, startButton, nextButton, mathBlockFun,
        progressBar, strikes, axisLabels
    ].concat(targets)
    gameState.objects.push(mngr)

    gameState.update = () => {
        if (blockField.rootBlock == null){
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
