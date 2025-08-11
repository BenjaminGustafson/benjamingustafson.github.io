import * as GameObjects from './GameObjects/index.js'
import {Shapes, Color} from './util/index.js'
import * as Menus from './Scenes/Menus.js'
import * as Linear from './Scenes/Linear.js'
import * as Planet from './Scenes/Planet.js'
import * as Experiment from './Scenes/Experiment.js'
import * as Navigation from './Scenes/Navigation.js'


/**
 * 
 * A scene is a 
 * 
 * The canvas is set to 1600 x 900 px, and scaled down if the window is too small.
 * We do all layout math relative to the 1600 x 900 px. * 
 * 
 * 
 * 
*/

export const CANVAS_WIDTH = 1600
export const CANVAS_HEIGHT = 900

// export const ALL_BLOCKS = [
//     new MathBlock({type:MathBlock.CONSTANT}),
//     new MathBlock({type:MathBlock.VARIABLE, token:'x'}),
//     new MathBlock({type:MathBlock.POWER, token:'2'}),
//     new MathBlock({type:MathBlock.EXPONENT}),
//     new MathBlock({type:MathBlock.FUNCTION, token:'sin'}),
//     new MathBlock({type:MathBlock.BIN_OP, token:'+'}),
//     new MathBlock({type:MathBlock.BIN_OP, token:'*'}),
// ]


/**
 * scene: the scene that the ship door exits to when we land on the planet
 * puzzles: the planet's puzzle scenes
 * trials: the planet's experiment trial scenes 
 * nextPlanets: the planets unlocked after finishing this planet
 */
export const PLANET_DATA = {
    'Linear': { 
        distance: 0,
        scene:"linearPlanet",
        puzzles: ["intro1", "intro2", "intro4Pos", "introNeg", "introFrac", "introCombined", "intro8", "intro16"],
        trials: ["linearTrial1","linearTrial2","linearTrial3","linearTrial4","linearTrial5"],
        rule: "linearRule",
        nextPlanets: ['Quadratic'],
    },
    'Quadratic':{
        distance: 10,
        scene:"quadraticPlanet",
        puzzles:["quad4", "quad8", "quad16", "quad32", "quadSmooth", "quadShort4",
            "quadShort8", "quadShort16", "quadShort32", "quadShortSmooth",
            "quadNeg4", "quadNeg8", "quadNeg16", "quadNeg32", "quadNegSmooth",
        ],
        imgId :"quad_img",
        trials:[],
        nextPlanets: ['Cubic']
    },
    'Exponential':{
        distance: 30, 
        scene:"expDoor", 
        puzzles: ["exp1", "exp2"],
        trials:[],
    },
}



/**
 * Linear
 * Quadratic 
 * Cubic
 * Power x^n
 * 1/x
 * x^(1/2)
 * 
 * e^x
 * a^x - button that sets slider to e
 * ln(x) 
 * log(x)
 * 
 * sin(x) - new tool unlock: button that sets slider to pi
 * cos(x)
 * tan(x)
 * sec(x)
 * csc(x)
 * cot(x)
 * 
 * f(x) + g(x)
 * f(x) * g(x)
 * f(g(x))
 * f(x) / g(x)
 * 
 */



/**
 * Checks how many of the levels on the current planet have been completed.
 * 
 * @param {*} gameState the current game state
 * @returns the percent of levels complete
 */
// export function planetCompletion(gameState){
//     const id = gameState.stored.planetIndex
//     const puzzles = PLANET_DATA[id].puzzles
//     const progress = gameState.stored.planetCompletedLevels[id]
//     var numComplete = 0
//     for(let i = 0; i < puzzles.length; i++){
//         if (progress[puzzles[i]]){
//             numComplete++
//         }
//     } 
//     return numComplete / puzzles.length
// }

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
                    sliders[i].setValue(val)
                }
            }
        }
    } else {
        gameState.update = () => { }
    }
    levelNavigation(gameState, () => tracer.solved)
}



/**
 * 
 * The main function for serving up scenes.
 * 
 * The comments above each level describe the intended 
 * things that the level should teach.
 * 
 */
export function loadScene(gameState, sceneName, message = {}) {
    gameState.stored.prevScene = gameState.stored.sceneName
    gameState.stored.sceneName = sceneName

    gameState.update = () => { }

    switch (sceneName) {
        default:
        //------------------------------------------------------------
        // Menus (see Menus.js)
        //------------------------------------------------------------
        case "startMenu": Menus.startMenu(gameState, message['nextScene'])
        break

        case "planetMap": Menus.planetMap(gameState)
        break

        case "navigation": Navigation.navScene(gameState, 'ship')
        break

        //------------------------------------------------------------
        // Linear Planet (see Linear.js)
        //------------------------------------------------------------

        case 'linearPlanet': Linear.linearPlanet(gameState)
            break

        // Puzzles ------------------------------------------------- 

        /**
         * 1x1 grid to introduce interface
         */
        case "intro1": Linear.linearPuzzle1(gameState, {nextScenes:["intro2"]})
        break

        /**
         * 2x2 grid to introduce interface
         */
        case "intro2": Linear.linearPuzzle2(gameState,  {nextScenes:["intro4Pos"]})
        break

        /**
         * 4x4 grid but still only nonnegative slopes.
         */
        case "intro4Pos": 
            Linear.simpleDiscLevel(gameState, {targetVals:[0, 1, 1, 2],  nextScenes:["introNeg"]})
            break

        /**
         * Introduce negative slopes.
         */
        case "introNeg": 
            Linear.simpleDiscLevel(gameState, {targetVals:[1, 0, -1, 0], nextScenes:["linearDialogue1"]})
            break

        case 'linearDialogue1':
            Planet.dialogueScene(gameState, {exitTo:"linearPlanet", nextScenes:["introFrac"], text: Linear.dialogue1})
            break


        /**
         * Introduce fractional slopes, slope = 1/2
         */
        case "introFrac": 
            Linear.simpleDiscLevel(gameState, {targetVals:[0.5, 1, 0.5, 1.5], nextScenes:["introCombined"]})
            break

        /**
         * Reinforce previous levels, some fractional, some negative
         */
        case "introCombined": 
            Linear.simpleDiscLevel(gameState, {targetVals:[2, 1.5, -0.5, -2], nextScenes:["intro8"]})
            break

        /**
         * 4x4 grid with 8 sliders. Teaches that if sliders are on half units,
         *  the resulting slope is halved.
         */
        case "intro8": 
            Linear.simpleDiscLevel(gameState, {targetVals:[1, 0.5, -0.1, -0.8, -0.4, 0.6, 0.2, 0.4], nextScenes:["intro16"]})
            break

        /**
         * 4x4 grid with 8 sliders. A final challenge for the introduction.
         * The only time we will ask for 16 sliders  to be manually moved.
         */
        case "intro16": 
            Linear.simpleDiscLevel(gameState, {targetVals:[0.25, 0.5, 0.75, 1, 1.25, 1, 0.75, 0.5,
                0.25, 0, 0.5, 1, 0.5, 0, 0.5, 1],  targetSize:15,  sliderSize:12, nextScenes:["linearExperiment"]})
            break

        // Experiment ------------------------------------------------- 
        case "linearExperiment":
            Experiment.experimentMenu(gameState)
            break
        

        case "linearTrial1":
        case "linearTrial2":
        case "linearTrial3":
        case "linearTrial4":
        case "linearTrial5":
            Experiment.experimentTrial(gameState, 'linearExperiment')
            break

        case "linearRule": Experiment.ruleGuess(gameState)            
        break

        

        //------------------------------------------------------------
        // Quadratic Planet
        //------------------------------------------------------------
        case "quadraticPlanet": {
            
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
//     //const funTracer = new FunctionTracer(gridLeft, (x => x*x))
//     //funTracer.color = Color.red
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
//     //const funTracer = new FunctionTracer(gridLeft, (x => x*x))
//     //funTracer.color = Color.red
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
