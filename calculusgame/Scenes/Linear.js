import {Color, Shapes} from '../util/index.js'
import {Grid, FunctionTracer, Button, ImageObject, IntegralTracer, MathBlock, MathBlockManager, MathBlockField, Slider, Target, TargetAdder, TextBox} from '../GameObjects/index.js'
import { loadScene, planetCompletion, CANVAS_WIDTH, CANVAS_HEIGHT } from '../Scene.js'

/**
 * The map is isometric tiles of 128 x 64. 
 * The map is 1600 x 900, so that is 12.5 x 14.0625 tiles
 * The top left corner should be right at a tile intersection
 * Then to move along the path we just need the path coordinates
 * 
 */

export function linearPlanet(gameState){
    const completion = planetCompletion(gameState)
    const open = completion == 1
    const door_button = new Button({originX:200, originY:600, width:100, height:60, onclick:(() => { loadScene(gameState,"ship") }), label:"Ship"})
    
    const puzzleButton = new Button({originX:200, originY:400, width:150, height:100, onclick:(() => { loadScene(gameState, "intro") }), label:"Puzzles"})
    const experimentButton = new Button({originX:180, originY:130, width:100, height:60, 
        onclick:(() => { loadScene(gameState, "linearExperiment") }), label: "Lab"})


    // ---------------------------- Puzzle buttons ----------------------------------
    const levels = ["intro1", "intro2", "intro4Pos", "introNeg", "introFrac", "introCombined", "intro8", "intro16"]
    var buttons = []
    for (let i = 0; i < levels.length; i++) {
        const button = new Button({originX:0, originY:0, width:50, height:50, fontSize: 20,
            onclick:(() => {
                gameState.stored.levelIndex = i;
                loadScene(gameState,levels[i])
            }),
            label: 1 + "." + (i + 1)
        })
        if (gameState.stored.planetCompletedLevels[gameState.stored.planetIndex][levels[i]]) {
            button.color = Color.blue
        }
        buttons.push(button)
    }

    const buttonLocations = [
        [700,600],[1088,603],[1388,707],[1416,505],
        [961,170],[1271,42],[753,28],[585,67]
    ]

    for (let i = 0; i < buttons.length; i++) {
        buttons[i].originX = buttonLocations[i][0]
        buttons[i].originY = buttonLocations[i][1]
    }

    //-------------------------------- Dialogue Buttons -----------------------------



    gameState.objects = [
        new ImageObject(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, "linearPlanetBg"),
        new ImageObject(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT, "linearPlanetFg"),
        //new TextBox({originX:100, originY:100, content: "1. Linear Planet", font : "40px monospace", color : Color.black}),
        //puzzleButton,
        experimentButton,
        door_button,
        // new Button({originX:200, originY:600, width:100, height:100, 
        //     onclick:(() => { loadScene(gameState, "linearRule") }),
        //     label: "Rule"
        // }),
    ]
    gameState.objects = gameState.objects.concat(buttons)
}

/**
 * A 4x4 discrete level with given targets.
 * 
 * @param {*} gameState 
 * @param {*} targetVals The y-values of the targets
 * @param {*} tracerStart y-intercept where the tracer starts from
 * @param {number} targetSize The size of the targets and sliders
 */
export function simpleDiscLevel(gameState, targetVals, tracerStart = 0, targetSize = 20, sliderSize = 15, exitTo = 'introDoor') {
    const backButton = new Button({originX:50, originY: 50, width:100, height: 100, onclick: ()=>loadScene(gameState,exitTo), label:"↑"})
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
    const objs = [gridLeft, gridRight, tracer, backButton].concat(targets).concat(sliders)
    gameState.objects = objs
    gameState.update = () => { }
}

