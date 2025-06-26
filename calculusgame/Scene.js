/**
 * This file contains all of the data for the levels.
 * 
 * The canvas is set to 1600 x 900 px, and scaled down if the window is too small.
 * We do all layout math relative to the 1600 x 900 px. * 
 * 
 * 
 * 
*/

const canvas_width = 1600
const canvas_height = 900

/**
 * The list of all levels
 * 
 * The game is composed of sections
 * Each section has an ordered list of levels
 * 
 * Ex:
 * gameState.section = "intro"
 * gameState.sceneIndex = 1
 *  
 */
const levels = {
    intro: ["intro1", "intro2", "intro4Pos", "introNeg", "introFrac", "introCombined", "intro8"],
    quad: ["quad4", "quad8", "quad16", "quad32", "quad400", "quad2x", "quadHalf", "quadShiftLeft", "quadShiftRight"],
    cubic: ["cubic4", "cubic8", "cubic16", "cubic32", "cubic400"],
    exp: ["exp1", "exp2"],
    sin: ["sin1"],
    sum: ["sum1"],
    prod: ["prodTest"],
    chain: [],
}

const PLANETS = ["Linear", "Quadratic", "Exponential"]
const DISTANCES = [0, 10, 30]


function subMenu(gameState, menu_num, exitTo) {
    gameState.section = gameState.sceneName;
    buttons = []
    for (let i = 0; i < levels[gameState.section].length; i++) {
        buttons.push(new Button(0, 0, 100, 100,
            (() => {
                gameState.sceneIndex = i;
                gameState.sceneName = levels[gameState.section][i];
            }),
            menu_num + "." + (i + 1)))
    }

    // Button layout: 6 buttons per row
    // 100 px between buttons, 100px size buttons = 1100px
    // Leaves 500px, so 250 on either side
    const start_x = 250
    var x = start_x
    var y = 300
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].origin_x = x
        buttons[i].origin_y = y
        if (build == "dev") console.log(x - buttons[i].width / 2 == buttons[i].origin_x)
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
    const backButton = new Button(100, 100, 100, 100, (() => gameState.sceneName = exitTo), "↑")
    buttons.push(backButton)

    // const actionButton = new Button(300,100,200,100, (()=> gameState.sceneName = exitTo), "Open Door")
    // actionButton.active = false
    // buttons.push(actionButton)

    gameState.update = (() => {
        var allComplete = true
        for (let i = 0; i < levels[gameState.section].length; i++) {
            if (gameState.completedLevels[levels[gameState.section][i]]) {
                buttons[i].color = Color.blue
            } else {
                allComplete = false
            }
        }
        if (allComplete) {
            gameState.completedLevels[gameState.section] = true
        }
    })
    gameState.objects = buttons

}

/**
 * Adds an up and next button.
 */
function levelNavigation(gameState, winCon) {
    const back_button = new Button(100, 100, 100, 100, (() => gameState.sceneName = gameState.section), "↑")
    const forward_button = new Button(300, 100, 100, 100, (() => {
        if (build == "dev") console.log("section", gameState.section, "index", gameState.sceneIndex)
        if (gameState.sceneIndex < levels[gameState.section].length - 1) {
            gameState.sceneIndex += 1
            gameState.sceneName = levels[gameState.section][gameState.sceneIndex]
        } else {
            gameState.sceneName = gameState.section
        }
    }),
        "→")
    forward_button.active = false
    gameState.objects.push(back_button)
    gameState.objects.push(forward_button)

    // non-destructively add to the update function
    const prev_update = gameState.update
    function update() {
        prev_update()
        if (winCon() && !gameState.completedLevels[gameState.sceneName]) {
            gameState.completedLevels[gameState.sceneName] = true
            gameState.writeToStorage = true

        }
        if (gameState.completedLevels[gameState.sceneName]) {
            forward_button.active = true
        }
    }
    gameState.update = update
}


function levelNavigationObj(gameState, winCon) {
    let objs = gameState.objects
    objs.back_button = new Button(100, 100, 100, 100, (() => gameState.sceneName = gameState.section), "↑")
    objs.forward_button = new Button(300, 100, 100, 100, (() => {
        if (build == "dev") console.log("section", gameState.section, "index", gameState.sceneIndex)
        if (gameState.sceneIndex < levels[gameState.section].length - 1) {
            gameState.sceneIndex += 1
            gameState.sceneName = levels[gameState.section][gameState.sceneIndex]
        } else {
            gameState.sceneName = gameState.section
        }
    }),
        "→")
    objs.forward_button.active = false

    // non-destructively add to the update function
    const prev_update = gameState.update
    function update() {
        prev_update()
        if (winCon() && !gameState.completedLevels[gameState.sceneName]) {
            gameState.completedLevels[gameState.sceneName] = true
            gameState.writeToStorage = true

        }
        if (gameState.completedLevels[gameState.sceneName]) {
            objs.forward_button.active = true
        }
    }
    gameState.update = update
}

function introLevels(gameState, vals) {
    // Right align 100px left of middle (800-100-400=300)
    // Center vertically (450-400/2=250)
    const gridLeft = new Grid(300, 250, 400, 400, 4, 4, 5, 2, 2)
    // Left align 100px right of middle (800+100=900)
    const gridRight = new Grid(900, 250, 400, 400, 4, 4, 5, 2, 2)
    // On first four cols of gridRight
    // x = 900, 950, 1000, 1050. top_y = 250.  
    const slider1 = new Slider(900, 250, 400, 4, 0, 2, 0.1, false)
    const slider2 = new Slider(1000, 250, 400, 4, 0, 2, 0.1, false)
    const slider3 = new Slider(1100, 250, 400, 4, 0, 2, 0.1, false)
    const slider4 = new Slider(1200, 250, 400, 4, 0, 2, 0.1, false)
    const target1_coord = gridLeft.gridToCanvas(-1, vals[0])
    const target2_coord = gridLeft.gridToCanvas(0, vals[1])
    const target3_coord = gridLeft.gridToCanvas(1, vals[2])
    const target4_coord = gridLeft.gridToCanvas(2, vals[3])
    const target1 = new Target(target1_coord.x, target1_coord.y, 15)
    const target2 = new Target(target2_coord.x, target2_coord.y, 15)
    const target3 = new Target(target3_coord.x, target3_coord.y, 15)
    const target4 = new Target(target4_coord.x, target4_coord.y, 15)
    const tracer = new Tracer(300, 450, gridLeft,
        { type: "sliders", sliders: [slider1, slider2, slider3, slider4], slider_spacing: 100 },
        4, [target1, target2, target3, target4])
    const objs = [gridLeft, gridRight, slider1, slider2, slider3, slider4, tracer, target1, target2, target3, target4]
    gameState.objects = objs
    gameState.update = () => { }
    levelNavigation(gameState, () => tracer.solved)
}

function simpleDiscLevel(gameState, target_vals, tracer_start = 0) {
    const num_sliders = target_vals.length
    const gridLeft = new Grid(300, 250, 400, 400, 4, 4, 5, 2, 2)
    const gridRight = new Grid(900, 250, 400, 400, 4, 4, 5, 2, 2)
    var sliders = []
    const slider_spacing = 400 / num_sliders
    for (let i = 0; i < num_sliders; i++) {
        sliders.push(new Slider(900 + slider_spacing * i, 250, 400, 4, 0, 2, 0.01, false, vertical = true, circleRadius = 10))
    }
    var targets = []
    for (let i = 0; i < num_sliders; i++) {
        const x = -2 + (i + 1) / num_sliders * 4
        const coord = gridLeft.gridToCanvas(x, target_vals[i])
        targets.push(new Target(coord.x, coord.y, 10))
    }
    const tracer_coord = gridLeft.gridToCanvas(-2, tracer_start)
    const tracer = new Tracer(tracer_coord.x, tracer_coord.y, gridLeft,
        { type: "sliders", sliders: sliders, slider_spacing: slider_spacing },
        4, targets)
    const objs = [gridLeft, gridRight, tracer].concat(targets).concat(sliders)
    gameState.objects = objs
    gameState.update = () => { }
    levelNavigation(gameState, () => tracer.solved)
}

// function quadDiscLevel(gameState, num_sliders){
//     const gridLeft = new Grid(300,250,400,400,4,4,5,2,2)
//     const gridRight = new Grid(900,250,400,400,4,4,5,2,2)
//     var sliders = []
//     const slider_spacing = 400/num_sliders
//     for (let i = 0; i < num_sliders; i++){
//         sliders.push(new Slider(900+slider_spacing*i, 250, 400, 4, 0, 2, 0.01, false, vertical=true,circleRadius=10))
//     }
//     const target_coords = []
//     for (let i = 0; i<num_sliders; i++){
//         const x = -2 + (i+1)/num_sliders*4
//         target_coords.push([x,x*x/2])
//     }
//     var targets = []
//     for (let i = 0; i < target_coords.length; i++){
//         const coord = gridLeft.gridToCanvas(target_coords[i][0],target_coords[i][1])
//         targets.push(new Target(coord.x, coord.y, 10))
//     }
//     const tracer = new Tracer(300,250,gridLeft,
//         {type:"sliders",sliders:sliders,slider_spacing:slider_spacing},
//         4,targets)
//     const objs = [gridLeft,gridRight,tracer].concat(targets).concat(sliders)
//     gameState.objects = objs
//     gameState.update = () => {}
//     levelNavigation(gameState, ()=>tracer.solved)
// }


function quadDiscLevel2(gameState, num_sliders, withButton = false, withSySlider = false, func = (x => x * x / 2)) {
    const gridLeft = new Grid(300, 350, 400, 400, 4, 4, 5, 2, 2)
    const gridRight = new Grid(900, 350, 400, 400, 4, 4, 5, 2, 2)
    var sliders = []
    const slider_spacing = 400 / num_sliders
    var slider_size = 15
    if (num_sliders >= 16) slider_size = 10
    if (num_sliders >= 64) slider_size = 5
    for (let i = 0; i < num_sliders; i++) {
        sliders.push(new Slider(900 + slider_spacing * i, 350, 400, 4, 0, 2, 0.01, false, vertical = true, circleRadius = slider_size))
    }
    const target_coords = []
    for (let i = 0; i < num_sliders; i++) {
        const x = -2 + (i + 1) / num_sliders * 4
        target_coords.push([x, func(x)])
    }
    var targets = []
    for (let i = 0; i < target_coords.length; i++) {
        const coord = gridLeft.gridToCanvas(target_coords[i][0], target_coords[i][1])
        targets.push(new Target(coord.x, coord.y, slider_size))
    }
    const tracer = new Tracer(300, 350, gridLeft,
        { type: "sliders", sliders: sliders, slider_spacing: slider_spacing },
        4, targets)


    const ty_slider = new Slider(1400, 350, 400, 4, 0, 2, 0.1, true, true)
    ty_slider.circleColorActive = Color.green
    ty_slider.active = false
    const sy_slider = new Slider(1500, 350, 400, 8, 1, 4, 0.1, true, true)
    sy_slider.circleColorActive = Color.green
    sy_slider.active = false

    //const mngr = new MathBlockManager(math_blocks,900,150, ty_slider, sy_slider, {type:"sliders", sliders:sliders})
    const linear_button = new Button(900, 220, 50, 50, () => { }, "x")
    const fun = x => x
    function set_linear() {
        if (!linear_button.toggled) {
            linear_button.toggled = true
            linear_button.color = Color.green
            ty_slider.active = true
            sy_slider.active = true
        } else {
            linear_button.toggled = false
            linear_button.color = Color.white
            ty_slider.active = false
            sy_slider.active = false
        }
    }
    linear_button.onclick = set_linear

    const objs = [gridLeft, gridRight, tracer].concat(targets).concat(sliders)
    if (withButton) {
        objs.push(linear_button)
        objs.push(ty_slider)
        if (withSySlider) {
            objs.push(sy_slider)
        }
    }
    gameState.objects = objs
    gameState.update = () => {
        if (ty_slider.active) {
            for (let i = 0; i < num_sliders; i++) {
                sliders[i].setValue(ty_slider.value + sy_slider.value * fun(gridRight.canvasToGrid(sliders[i].origin_x, 0).x))
            }
        }
    }
    levelNavigation(gameState, () => tracer.solved)
}


function quadDiscLevel(gameState, num_sliders, withButton = false, withSySlider = false, func = (x => x * x / 2)) {
    gameState.objects = {}
    let objs = gameState.objects
    objs.gridLeft = new Grid(300, 350, 400, 400, 4, 4, 5, 2, 2)
    objs.gridRight = new Grid(900, 350, 400, 400, 4, 4, 5, 2, 2)
    var sliders = []
    const slider_spacing = 400 / num_sliders
    var slider_size = 15
    if (num_sliders >= 16) slider_size = 10
    if (num_sliders >= 64) slider_size = 5
    for (let i = 0; i < num_sliders; i++) {
        const slider = new Slider(900 + slider_spacing * i, 350, 400, 4, 0, 2, 0.01, false, vertical = true, circleRadius = slider_size)
        sliders.push(slider)
        objs["slider" + i] = slider
    }
    const target_coords = []
    for (let i = 0; i < num_sliders; i++) {
        const x = -2 + (i + 1) / num_sliders * 4
        target_coords.push([x, func(x)])
    }
    var targets = []
    for (let i = 0; i < target_coords.length; i++) {
        const coord = objs.gridLeft.gridToCanvas(target_coords[i][0], target_coords[i][1])
        const target = new Target(coord.x, coord.y, slider_size)
        targets.push(target)
    }
    const tracer = new Tracer(300, 350, objs.gridLeft,
        { type: "sliders", sliders: sliders, slider_spacing: slider_spacing },
        4, targets)
    objs.tracer = tracer
    // We have to do this to order the layers correctly, maybe in future game objects can get a layer property
    for (let i = 0; i < target_coords.length; i++) {
        objs["target" + i] = targets[i]
    }


    objs.ty_slider = new Slider(1400, 350, 400, 4, 0, 2, 0.1, true, true)
    objs.ty_slider.circleColorActive = Color.green
    objs.ty_slider.active = false
    objs.sy_slider = new Slider(1500, 350, 400, 8, 1, 4, 0.1, true, true)
    objs.sy_slider.circleColorActive = Color.green
    objs.sy_slider.active = false

    if (withButton) {
        objs.linear_button = new Button(900, 220, 50, 50, () => { }, "x")
        const fun = x => x
        function set_linear() {
            if (!objs.linear_button.toggled) {
                objs.linear_button.toggled = true
                objs.linear_button.color = Color.green
                objs.ty_slider.active = true
                objs.sy_slider.active = true
            } else {
                objs.linear_button.toggled = false
                objs.linear_button.color = Color.white
                objs.ty_slider.active = false
                objs.sy_slider.active = false
            }
        }
        objs.linear_button.onclick = set_linear

        gameState.update = () => {
            if (objs.ty_slider.active) {
                for (let i = 0; i < num_sliders; i++) {
                    sliders[i].setValue(objs.ty_slider.value + objs.sy_slider.value * fun(objs.gridRight.canvasToGrid(sliders[i].origin_x, 0).x))
                }
            }
        }
    } else {
        gameState.update = () => { }
    }
    levelNavigationObj(gameState, () => tracer.solved)
}

function twoGridLevel(gameState, num_sliders, buttons, func) {
    gameState.objects = {}
    let objs = gameState.objects
    objs.gridLeft = new Grid(300, 350, 400, 400, 4, 4, 5, 2, 2)
    objs.gridRight = new Grid(900, 350, 400, 400, 4, 4, 5, 2, 2)
    var sliders = []
    const slider_spacing = 400 / num_sliders
    var slider_size = 15
    if (num_sliders >= 16) slider_size = 10
    if (num_sliders >= 64) slider_size = 5
    for (let i = 0; i < num_sliders; i++) {
        const slider = new Slider(900 + slider_spacing * i, 350, 400, 4, 0, 2, 0.01, false, vertical = true, circleRadius = slider_size)
        sliders.push(slider)
        objs["slider" + i] = slider
    }
    const target_coords = []
    for (let i = 0; i < num_sliders; i++) {
        const x = -2 + (i + 1) / num_sliders * 4
        target_coords.push([x, func(x)])
    }
    var targets = []
    for (let i = 0; i < target_coords.length; i++) {
        const coord = objs.gridLeft.gridToCanvas(target_coords[i][0], target_coords[i][1])
        const target = new Target(coord.x, coord.y, slider_size)
        targets.push(target)
    }
    const tracer = new Tracer(300, 350 + (2 - func(-2)) * 100, objs.gridLeft,
        { type: "sliders", sliders: sliders, slider_spacing: slider_spacing },
        4, targets)
    objs.tracer = tracer
    // We have to do this to order the layers correctly, maybe in future game objects can get a layer property
    for (let i = 0; i < target_coords.length; i++) {
        objs["target" + i] = targets[i]
    }

    if (buttons) {
        objs.ty_slider = new Slider(1400, 350, 400, 4, 0, 2, 0.01, true, true)
        objs.ty_slider.circleColorActive = Color.green
        objs.ty_slider.active = false
        objs.sy_slider = new Slider(1500, 350, 400, 4, 1, 2, 0.01, true, true)
        objs.sy_slider.circleColorActive = Color.green
        objs.sy_slider.active = false

        var fun = x => x

        if (buttons == 1) {
            objs.linear_button = new Button(900, 220, 50, 50, () => { }, "/")
            fun = x => x
            function set_linear() {
                if (!objs.linear_button.toggled) {
                    objs.linear_button.toggled = true
                    objs.linear_button.color = Color.green
                    objs.ty_slider.active = true
                    objs.sy_slider.active = true
                } else {
                    objs.linear_button.toggled = false
                    objs.linear_button.color = Color.white
                    objs.ty_slider.active = false
                    objs.sy_slider.active = false
                }
            }
            objs.linear_button.onclick = set_linear
        }

        if (buttons == 2) {
            objs.quad_button = new Button(950, 220, 50, 50, () => { }, "U")
            fun = x => x * x
            function set_quad() {
                if (!objs.quad_button.toggled) {
                    objs.quad_button.toggled = true
                    objs.quad_button.color = Color.green
                    objs.ty_slider.active = true
                    objs.sy_slider.active = true
                } else {
                    objs.quad_button.toggled = false
                    objs.quad_button.color = Color.white
                    objs.ty_slider.active = false
                    objs.sy_slider.active = false
                }
            }
            objs.quad_button.onclick = set_quad
        }

        gameState.update = () => {
            if (objs.ty_slider.active) {
                for (let i = 0; i < num_sliders; i++) {
                    sliders[i].setValue(objs.ty_slider.value + objs.sy_slider.value * fun(objs.gridRight.canvasToGrid(sliders[i].origin_x, 0).x))
                }
            }
        }
    } else {
        gameState.update = () => { }
    }
    levelNavigationObj(gameState, () => tracer.solved)
}


function cubicDiscLevel(gameState, num_sliders, next) {
    // To generalize
    const fun = x => x * x * x / 6

    const gridLeft = new Grid(300, 250, 400, 400, 4, 4, 5, 2, 2)
    const gridRight = new Grid(900, 250, 400, 400, 4, 4, 5, 2, 2)
    var sliders = []
    const slider_spacing = 400 / num_sliders
    for (let i = 0; i < num_sliders; i++) {
        sliders.push(new Slider(900 + slider_spacing * i, 250, 400, 4, 0, 2, 0.01, false, vertical = true, circleRadius = 10))
    }
    const target_coords = []
    for (let i = 0; i < num_sliders; i++) {
        const x = -2 + (i + 1) / num_sliders * 4
        target_coords.push([x, fun(x)])
    }
    var targets = []
    for (let i = 0; i < target_coords.length; i++) {
        const coord = gridLeft.gridToCanvas(target_coords[i][0], target_coords[i][1])
        targets.push(new Target(coord.x, coord.y, 10))
    }
    const tracer_start = gridLeft.gridToCanvas(-2, fun(-2))
    const tracer = new Tracer(tracer_start.x, tracer_start.y, gridLeft,
        { type: "sliders", sliders: sliders, slider_spacing: slider_spacing },
        4, targets)
    const back_button = new Button(100, 100, 100, 100, (() => gameState.sceneName = "cubicMenu"), "↑")
    const forward_button = new Button(300, 100, 100, 100, (() => gameState.sceneName = next), "→")
    forward_button.active = false
    function update() {
        if (tracer.solved && !gameState.completedLevels[gameState.sceneName]) {
            gameState.completedLevels[gameState.sceneName] = true
            gameState.writeToStorage = true

        }
        if (gameState.completedLevels[gameState.sceneName]) {
            forward_button.active = true
        }
    }
    const objs = [gridLeft, gridRight, tracer, back_button, forward_button].concat(targets).concat(sliders)
    gameState.objects = objs
    gameState.update = update
}

function expDiscLevel(gameState, num_sliders, next) {
    // To generalize

    const gridLeft = new Grid(300, 250, 400, 400, 4, 4, 5, 4, 2)
    const gridRight = new Grid(900, 250, 400, 400, 4, 4, 5, 4, 2)
    var sliders = []
    const slider_spacing = 400 / num_sliders
    for (let i = 0; i < num_sliders; i++) {
        sliders.push(new Slider(900 + slider_spacing * i, 250, 400, 4, 0, 4, 0.01, false, vertical = true, circleRadius = 10))
    }
    const target_coords = []
    for (let i = 0; i < num_sliders - 1; i++) {
        const x = -2 + (i + 1) / num_sliders * 4
        target_coords.push([x, 0])
    }
    var targets = []
    for (let i = 0; i < target_coords.length; i++) {
        const coord = gridLeft.gridToCanvas(target_coords[i][0], target_coords[i][1])
        targets.push(new Target(coord.x, coord.y, 10))
    }
    const tracer_start = gridLeft.gridToCanvas(-2, 0.15)
    const tracer = new Tracer(tracer_start.x, tracer_start.y, gridLeft,
        { type: "sliders", sliders: sliders, slider_spacing: slider_spacing },
        4, targets)
    const back_button = new Button(100, 100, 100, 100, (() => gameState.sceneName = "expMenu"), "↑")
    const forward_button = new Button(300, 100, 100, 100, (() => gameState.sceneName = next), "→")
    forward_button.active = false
    function update() {
        for (let i = 0; i < num_sliders - 1; i++) {
            targets[i].setPosition(targets[i].x, gridLeft.gridToCanvas(0, sliders[i + 1].value).y)
        }

        if (tracer.solved && !gameState.completedLevels[gameState.sceneName]) {
            gameState.completedLevels[gameState.sceneName] = true
            gameState.writeToStorage = true

        }
        if (gameState.completedLevels[gameState.sceneName]) {
            forward_button.active = true
        }
    }

    const objs = [gridLeft, gridRight, tracer, back_button, forward_button].concat(targets).concat(sliders.slice(1))
    gameState.objects = objs
    gameState.update = update
}

function sinDiscLevel(gameState, num_sliders, next, grid_size) {
    const grid1 = new Grid(100, 250, 400, 400, grid_size, grid_size, 5, grid_size / 2, grid_size / 2)
    const grid2 = new Grid(600, 250, 400, 400, grid_size, grid_size, 5, grid_size / 2, grid_size / 2)
    const grid3 = new Grid(1100, 250, 400, 400, grid_size, grid_size, 5, grid_size / 2, grid_size / 2)
    var sliders = []
    const slider_spacing = 400 / num_sliders
    for (let i = 0; i < num_sliders; i++) {
        sliders.push(new Slider(grid3.origin_x + slider_spacing * i, 250, 400, grid_size, 0, grid_size / 2, 0.01, false, vertical = true, circleRadius = 10))
    }
    const target_coords = []
    for (let i = 0; i < num_sliders - 1; i++) {
        //const x = -2 + (i+1)/num_sliders*4
        const x = grid1.grid_x_min + (i + 1) / num_sliders * grid1.gridWidth
        target_coords.push([x, 0])
    }
    var targets = []
    for (let i = 0; i < target_coords.length; i++) {
        const coord = grid1.gridToCanvas(target_coords[i][0], target_coords[i][1])
        targets.push(new Target(coord.x, coord.y, 10))
    }
    const tracer2_start = grid2.gridToCanvas(grid2.grid_x_min, 1)
    const tracer2 = new Tracer(tracer2_start.x, tracer2_start.y, grid2,
        { type: "sliders", sliders: sliders, slider_spacing: slider_spacing },
        4, targets)
    const tracer1_start = grid1.gridToCanvas(grid2.grid_x_min, 0)
    const tracer1 = new Tracer(tracer1_start.x, tracer1_start.y, grid1,
        { type: "tracer", source_tracer: tracer2 },
        4, targets)
    const back_button = new Button(100, 100, 100, 100, (() => gameState.sceneName = "expMenu"), "↑")
    const forward_button = new Button(300, 100, 100, 100, (() => gameState.sceneName = next), "→")
    forward_button.active = false
    function update() {
        for (let i = 0; i < num_sliders - 1; i++) {
            targets[i].setPosition(targets[i].x, grid1.gridToCanvas(0, -sliders[i + 1].value).y)
        }

        if (tracer1.solved && !gameState.completedLevels[gameState.sceneName]) {
            gameState.completedLevels[gameState.sceneName] = true
            gameState.writeToStorage = true
        }
        if (gameState.completedLevels[gameState.sceneName]) {
            forward_button.active = true
        }
    }

    const objs = [grid1, grid2, grid3, tracer2, tracer1, back_button, forward_button].concat(targets).concat(sliders.slice(1))
    gameState.objects = objs
    gameState.update = update
}

// Merge with genCont???
function cubicContLevel(gameState, fun, next) {
    const blocks = [[MathBlock.VARIABLE, "x"], [MathBlock.POWER, "2"]]

    const target_coords = []
    const num_targets = 16
    for (let i = 0; i < num_targets; i++) {
        const x = -2 + (i + 1) / num_targets * 4
        const y = fun(x)
        target_coords.push([x, y])
    }

    const y_adjust = 100
    const x_adjust = 100
    const gridLeft = new Grid(100 + x_adjust, 250 + y_adjust, 400, 400, 4, 4, 5, 2, 2)
    const gridRight = new Grid(600 + x_adjust, 250 + y_adjust, 400, 400, 4, 4, 5, 2, 2)
    const block1 = new MathBlock(MathBlock.VARIABLE, "x", 1300 + x_adjust, 250 + y_adjust)
    const block2 = new MathBlock(MathBlock.POWER, "2", 1300 + x_adjust, 350 + y_adjust)
    const ty_slider = new Slider(1100 + x_adjust, 250 + y_adjust, 400, 8, 0, 4, 0.1, true, true)
    const sy_slider = new Slider(1200 + x_adjust, 250 + y_adjust, 400, 8, 1, 4, 0.1, true, true)
    const funRight = new FunctionTracer(gridRight)
    //const funLeft = new FunctionTracer(gridLeft, (x => x*x))
    //funLeft.color = Color.red
    const mngr = new MathBlockManager([block1, block2], 600 + x_adjust, 150 + y_adjust, ty_slider, sy_slider, funRight)
    targets = []
    for (let i = 0; i < target_coords.length; i++) {
        const canvas_coords = gridLeft.gridToCanvas(target_coords[i][0], target_coords[i][1])
        targets.push(new Target(canvas_coords.x, canvas_coords.y, 10))
    }
    tracer_start = gridLeft.gridToCanvas(-2, fun(-2))
    const tracer = new Tracer(tracer_start.x, tracer_start.y, gridLeft, { type: "mathBlock", mathBlockMngr: mngr }, 4, targets)
    // Nav buttons
    const back_button = new Button(100, 100, 100, 100, (() => gameState.sceneName = "cubicMenu"), "↑")
    const forward_button = new Button(300, 100, 100, 100, (() => gameState.sceneName = next), "→")
    forward_button.active = false

    function update() {
        if (tracer.solved && !gameState.completedLevels[gameState.sceneName]) {
            //localStorage.setItem(gameState.sceneName, "solved");
            gameState.completedLevels[gameState.sceneName] = true
            gameState.writeToStorage = true

        }
        if (gameState.completedLevels[gameState.sceneName]) {
            forward_button.active = true
        }
    }
    gameState.objects = [gridLeft, gridRight, sy_slider, ty_slider, mngr, funRight, tracer, forward_button, back_button].concat(targets)
    gameState.update = update
}


function genContLevel(gameState, fun, blocks,
    grid_setting = { grid_width: 4, grid_height: 4, x_axis: 2, y_axis: 2 },
) {
    const target_coords = []
    const num_targets = 16
    for (let i = 0; i < num_targets; i++) {
        const x = -2 + (i + 1) / num_targets * 4
        const y = fun(x)
        target_coords.push([x, y])
    }

    const y_adjust = 100
    const x_adjust = 100
    const gridLeft = new Grid(100 + x_adjust, 250 + y_adjust, 400, 400, grid_setting.grid_width, grid_setting.grid_height, 5, grid_setting.x_axis, grid_setting.y_axis)
    const gridRight = new Grid(600 + x_adjust, 250 + y_adjust, 400, 400, grid_setting.grid_width, grid_setting.grid_height, 5, grid_setting.x_axis, grid_setting.y_axis)
    const ty_slider = new Slider(1100 + x_adjust, 250 + y_adjust, 400, 8, 0, 4, 0.1, true, true)
    const sy_slider = new Slider(1200 + x_adjust, 250 + y_adjust, 400, 8, 1, 4, 0.1, true, true)
    const funRight = new FunctionTracer(gridRight)
    //const funLeft = new FunctionTracer(gridLeft, (x => x*x))
    //funLeft.color = Color.red
    const math_blocks = []
    for (let i = 0; i < blocks.length; i++) {
        math_blocks.push(new MathBlock(blocks[i][0], blocks[i][1], 1300 + x_adjust, 150 + y_adjust + 100 * i))
    }
    const mngr = new MathBlockManager(math_blocks, 600 + x_adjust, 150 + y_adjust, ty_slider, sy_slider, { type: "fun_tracer", fun_tracer: funRight })
    targets = []
    for (let i = 0; i < target_coords.length; i++) {
        const canvas_coords = gridLeft.gridToCanvas(target_coords[i][0], target_coords[i][1])
        targets.push(new Target(canvas_coords.x, canvas_coords.y, 10))
    }
    tracer_start = gridLeft.gridToCanvas(-2, fun(-2))
    const tracer = new Tracer(tracer_start.x, tracer_start.y, gridLeft, { type: "mathBlock", mathBlockMngr: mngr }, 4, targets)

    gameState.objects = [gridLeft, gridRight, sy_slider, ty_slider, mngr, funRight, tracer].concat(targets)
    gameState.update = () => { }
    levelNavigation(gameState, () => tracer.solved)
}


function rngLevel(gameState) {
    const grid_setting = { grid_width: 4, grid_height: 4, x_axis: 2, y_axis: 2 }
    const blocks = [[MathBlock.CONSTANT, ""]]

    const randM = Math.floor(Math.random()*4*10)/10 
    const randB = gameState.stored.totalDistance
    const fun = x => randM * x + randB
    const funString = "f(x)=" + randM + "x+" + randB

    

    const y_adjust = 100
    const x_adjust = 100
    const gridLeftX = 150
    const intDist = Math.floor(gameState.stored.totalDistance)
    const gridLeft = new Grid(gridLeftX, 250 + y_adjust, 400, 400, grid_setting.grid_width, grid_setting.grid_height, 5, 4+intDist, 0, labels=true)
    const gridRight = new Grid(600 + x_adjust, 250 + y_adjust, 400, 400, grid_setting.grid_width, grid_setting.grid_height, 5, 4, 0, labels=true)
    const leftSlider = new Slider(1100 + x_adjust, 250 + y_adjust, 400, 4, 0, 4, 0.1, true, true)
    const sy_slider = new Slider(1200 + x_adjust, 250 + y_adjust, 400, 8, 1, 4, 0.1, true, true)
    const funRight = new FunctionTracer(gridRight)
    //const funLeft = new FunctionTracer(gridLeft, (x => x*x))
    //funLeft.color = Color.red
    

    const math_blocks = []
    for (let i = 0; i < blocks.length; i++) {
        math_blocks.push(new MathBlock(blocks[i][0], blocks[i][1], 1300 + x_adjust, 150 + y_adjust + 100 * i))
    }
    const mngr = new MathBlockManager(math_blocks, 600 + x_adjust, 150 + y_adjust, leftSlider, sy_slider, { type: "fun_tracer", fun_tracer: funRight })
    
    const target_coords = []
    const num_targets = 200
    for (let i = 0; i < num_targets; i++) {
        const x = (i + 1) / num_targets * 4
        const y = fun(x)
        console.log(x,y,gridLeft.grid_y_max)
        if (y <= gridLeft.grid_y_max && y >= gridLeft.grid_y_min) {
            target_coords.push([x, y])
        }
    }
    console.log("grid", gridLeft.grid_y_max, gridLeft.grid_x_max, gridLeft.grid_y_min, gridLeft.grid_y_max)

    targets = []



    for (let i = 0; i < target_coords.length; i++) {
        const canvas_coords = gridLeft.gridToCanvas(target_coords[i][0], target_coords[i][1])
        console.log(i, "canvas coords", canvas_coords)
        targets.push(new Target(canvas_coords.x, canvas_coords.y, 5))
    }
    tracer_start = gridLeft.gridToCanvas(0, fun(0))
    const tracer = new Tracer(tracer_start.x, tracer_start.y, gridLeft, { type: "mathBlock", mathBlockMngr: mngr }, 4, targets)
    tracer.stopped = true

    const shipIcon = document.getElementById("shipicon_img");
    const linIcon = document.getElementById("linearicon_img");
    const quadIcon = document.getElementById("quadraticicon_img");
    const progressBar = {
        dist: 0,
        originX: 300,
        length: 500,
        updateDistance: function(d){
            const startDist = DISTANCES[gameState.stored.nextPlanet-1]
            const endDist = DISTANCES[gameState.stored.nextPlanet]
            this.dist = (d - startDist) * this.length / (endDist - startDist)
        },
        draw: function(ctx){
            const startDist = DISTANCES[gameState.stored.nextPlanet-1]
            const endDist = DISTANCES[gameState.stored.nextPlanet]
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
            ctx.fillText(PLANETS[gameState.stored.nextPlanet-1]+" Planet", this.originX, originY-60)
            ctx.fillText(PLANETS[gameState.stored.nextPlanet]+" Planet", this.originX+this.length, originY-60)
            ctx.fillText(gameState.stored.totalDistance+" u charted", this.originX+this.length/2, originY-60)
            ctx.fillText(startDist+" u", this.originX, originY+25)
            ctx.fillText(endDist+" u", this.originX+this.length, originY+25)
            

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

    const backButton = new Button(100, 100, 100, 100, (() => gameState.sceneName = "ship"), "↑")
    const startButton = new Button(925, 100, 100, 100, (() => { }), "Start")
    startButton.onclick = (() => {
        tracer.reset();
        gameState.local.state = "Tracing"
    })
    const nextButton = new Button(925, 100, 100, 100, (() => { }), "Next")
    nextButton.onclick = (() => {
        gameState.refresh = true
    })
    nextButton.visible = false
    const targetText = new TextBox(gridLeftX, 300, funString, font = '40px monospace', color = Color.white)
    const axisLabels = {
        draw: function(ctx){
            ctx.font = '20px monospace'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'top'
            Color.setColor(ctx, Color.white)
            ctx.fillText("Time (s)", gridLeftX + 200, 800)
            ctx.fillText("Time (s)", 900, 800)
            ctx.translate(gridLeftX -60,550)
            ctx.rotate(-Math.PI/2)
            ctx.fillText("Position (units)", 0, 0)
            ctx.resetTransform()
            ctx.translate(620,550)
            ctx.rotate(-Math.PI/2)
            ctx.fillText("Velocity (units/s)", 0, 0)
            ctx.resetTransform()
        }
    }
    

    gameState.stored.strikes = 0
    const strikes = {
        draw: (ctx) => {
            for (let i = 0; i < 3; i++) {
                if (gameState.stored.strikes <= i) {
                    Color.setColor(ctx, Color.white)
                    if(gameState.local.state == "Solved" && gameState.stored.strikes == i) {
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
        draw: function(ctx) {
            if (!this.visible){
                return
            }
            ctx.font = '20px monospace'
            ctx.textAlign = 'left'
            ctx.textBaseline = 'top'
            Color.setColor(ctx, Color.white)
            ctx.fillText("Drag a block", 1200, 320)
            ctx.fillText("to set function", 1200, 360)
            Shapes.Line(ctx, 1350,280,1200,280,5,endCapStyle="arrow",endCapSize=5,oneSideCap=true)
        }
    }

    gameState.local.state = "Input"
    gameState.objects = [gridLeft, gridRight, leftSlider, mngr, funRight, tracer, backButton, startButton, nextButton, targetText,
        progressBar, strikes, axisLabels, toolTip
    ].concat(targets)
    gameState.update = () => {
        if (mngr.field_block == null){
            leftSlider.hidden = true
            toolTip.visible = true
        }else{
            leftSlider.hidden = false
            toolTip.visible = false
        }
        switch (gameState.local.state) {
            case "Input":
                progressBar.updateDistance(gameState.stored.totalDistance)
                mngr.frozen = false
                startButton.visible = true
                nextButton.visible = false
                nextButton.active = false
                tracer.stopped = true
                if (mngr.field_block != null && mngr.field_block.toFunction != null) {
                    startButton.active = true
                } else {
                    startButton.active = false
                }
                break
            case "Tracing":
                tracer.stopped = false
                startButton.active = false
                mngr.frozen = true
                progressBar.updateDistance(Math.min(tracer.getValue(),DISTANCES[gameState.stored.nextPlanet]))
                if (tracer.doneTracing) {
                    if (tracer.solved) {
                        gameState.local.state = "Solved"

                    } else {
                        gameState.stored.strikes += 1
                        if (gameState.stored.strikes == 3) {
                            gameState.local.state = "Strikeout"
                        } else {
                            gameState.local.state = "Input"
                        }
                    }
                }
                break
            case "Solved":
                const dist = Math.min(tracer.getValue(),DISTANCES[gameState.stored.nextPlanet])
                gameState.stored.totalDistance = Math.floor(dist*10)/10
                nextButton.color = Color.blue
                nextButton.visible = true
                nextButton.active = true
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
 * Adds the button to pull up the notebook
 * Notebook pages correspond to certain levels
 * So we check the completed levels in the gamestate 
 * to see which pages are available. 
 * 
 */
function notebook(gameState) {


}

/**
 * 
 * The main function for serving up scenes.
 * 
 * The comments above each level describe the intended 
 * things that the level should teach.
 * 
 */
function loadScene(gameState) {
    gameState.update = () => { }
    gameState.mouseDown = null
    gameState.keyPressed = null
    switch (gameState.sceneName) {
        case "":
        case "startMenu": {
            start_button = new Button(100, 250, 200, 100, (() => gameState.sceneName = "shipDoor"), "Start")
            start_button.color = Color.black
            about_button = new Button(100, 400, 200, 100, (() => window.location.replace("about.html")), "About")
            about_button.color = Color.black
            gameState.objects = [
                new ImageObject(0, 0, canvas_width, canvas_height, "start_img"),
                new TextBox(100, 150, "Calculus I", font = "60px monospace", color = Color.black),
                start_button, about_button
            ]
            gameState.keyPressed = key => {
                if (key == 'Enter' || key == ' ' || key == 'ArrowRight') {
                    gameState.sceneName = "shipDoor"
                }
            }
            break
        }
        case "shipDoor": {
            const open = gameState.completedLevels["intro"]
            const door_button = new Button(880, 450, 120, 230, (() => { gameState.sceneName = (open ? "ship" : "intro") }), "")
            door_button.visible = false
            gameState.objects = [
                new ImageObject(0, 0, canvas_width, canvas_height, open ? "shipDoorOpen_img" : "start2_img"),
                door_button
            ]
            gameState.keyPressed = key => {
                if (key == 'Enter' || key == ' ' || key == 'ArrowRight') {
                    gameState.sceneName = (open ? "ship" : "intro")
                }
            }
            break
        }
        case "escapeMenu": {
            gameState.objects = [
                new Button(300, 250, 100, 100, (() => gameState.sceneName = "intro"), "Continue"),
                new Button(300, 250, 100, 100, (() => gameState.sceneName = "intro"), "Main menu")
            ]
            break
        }
        case "ship": {
            gameState.shipState = {
                landed: true,
                currentLocation: 'Linear Prime',
                inFlight: false,
                fuelLevel: 100,
            }
            text_content = [
                "Current location: Landed on Linear Prime",
                "Navigating to: Quadratic System",
                "Fuel level: [■■■■■] 100%"
            ]
            var exitTo = "shipDoor"
            const door_button = new Button(90, 90, 250, 800, (() => { gameState.sceneName = exitTo }), "")
            door_button.visible = false
            const nav_button = new Button(670, 470, 410, 190, (() => { gameState.sceneName = "navigation" }), "")
            nav_button.visible = false
            gameState.objects = [
                new ImageObject(0, 0, canvas_width, canvas_height, "interior_img"),
                new TextBox(580, 160, text_content[0], "30px monospace", Color.green),
                new TextBox(580, 220, text_content[1], "30px monospace", Color.green),
                new TextBox(580, 280, text_content[2], "30px monospace", Color.green),
                door_button, nav_button
            ]
            gameState.update(() => {
                if (landed && !inFlight) {
                    door_button.active = true
                } else {
                    door_button.active = false
                }
            })
            break
        }
        case "navigation": {
            rngLevel(gameState)
            break
        }
        // old main menu
        case "mainMenu": {
            text_content = ["This is a game about calculus.",
                "If you get stuck, feel free to skip a level.",
                "The game is not finished, so some features might not work as intended.",
            ]
            gameState.objects = [
                new Button(300, 250, 100, 100, (() => gameState.sceneName = "intro"), "1"),
                new Button(600, 250, 100, 100, (() => gameState.sceneName = "quad"), "2"),
                new Button(900, 250, 100, 100, (() => gameState.sceneName = "cubic"), "3"),
                new Button(1200, 250, 100, 100, (() => gameState.sceneName = "exp"), "4"),
                new Button(300, 500, 100, 100, (() => gameState.sceneName = "sin"), "5"),
                new Button(600, 500, 100, 100, (() => gameState.sceneName = "sum"), "6"),
                new Button(900, 500, 100, 100, (() => gameState.sceneName = "prod"), "7"),
                new Button(1200, 500, 100, 100, (() => gameState.sceneName = "chain"), "8"),
                // new TextBox(300,160,text_content[0],"30px sans-serif"),
                // new TextBox(300,220,text_content[1],"30px sans-serif"),
                // new TextBox(300,280,text_content[2],"30px sans-serif")
            ]
            gameState.update = (() => { })
            break
        }

        /** Intro Levels
         * Difficulty here is quite low, player should only struggle with
         * understanding what the goal is and what they have under their
         * control. They should grasp this in the first 4 puzzles, and 
         * then 5-8 are a victory lap to encourage them before we introduce
         * complexity in 2.
         */
        case "intro": {
            subMenu(gameState, "1", "shipDoor")
            gameState.keyPressed = key => {
                console.log(key)
                if (key == 'Escape' || key == 'ArrowLeft') {
                    gameState.sceneName = "shipDoor"
                }
            }
            break
        }

        /**
         * 1x1 to gradually introduce the slider/target mechanics
         */
        case "intro1": {
            const gridLeft = new Grid(560, 430, 100, 100, 1, 1, 5)
            const gridRight = new Grid(900, 430, 100, 100, 1, 1, 5)
            const slider = new Slider(gridRight.origin_x, gridRight.origin_y, 100, 1, 0, 1, 0.1, false)
            const target = new Target(gridLeft.origin_x + 100, gridLeft.origin_y, 15)
            const tracer = new Tracer(gridLeft.origin_x, gridLeft.origin_y + 100, gridLeft,
                { type: "sliders", sliders: [slider], slider_spacing: 100 },
                4, [target])
            gameState.objects = [gridLeft, gridRight, slider, target, tracer]
            gameState.update = () => { }
            levelNavigation(gameState, (() => tracer.solved))
            break
        }

        /**
         * 2x2
         */
        case "intro2": {
            const gridLeft = new Grid(560, 430, 200, 200, 2, 2, 5)
            const gridRight = new Grid(900, 430, 200, 200, 2, 2, 5)
            const sliders = [
                new Slider(gridRight.origin_x, gridRight.origin_y, 200, 2, 0, 1, 0.1, false),
                new Slider(gridRight.origin_x + 100, gridRight.origin_y, 200, 2, 0, 1, 0.1, false)
            ]
            const targets = [
                new Target(gridLeft.origin_x + 100, gridRight.origin_y + 100, 15),
                new Target(gridLeft.origin_x + 200, gridRight.origin_y, 15)
            ]
            const tracer = new Tracer(gridLeft.origin_x, gridLeft.origin_y + 200, gridLeft,
                { type: "sliders", sliders: sliders, slider_spacing: 100 },
                4, targets)
            gameState.objects = [gridLeft, gridRight, tracer].concat(sliders).concat(targets)
            gameState.update = () => { }
            levelNavigation(gameState, (() => tracer.solved))
            break
        }

        /**
         * Now go to 4x4 but still only move in positive direction or 0.
         */
        case "intro4Pos": {
            introLevels(gameState, [0, 1, 1, 2])
            break
        }

        /**
         * Introduce negative direction.
         */
        case "introNeg": {
            introLevels(gameState, [1, 0, -1, 0])
            break
        }

        /**
         * Sliders can be set to partial units, specifically half
         */
        case "introFrac": {
            introLevels(gameState, [0.5, 1, 0.5, 1.5])
            break
        }

        /**
         * Reinforce previous levels, also use max slider values
         */
        case "introCombined": {
            introLevels(gameState, [2, 1.5, -0.5, -2])
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
                0.25, 0, 0.5, 1, 0.5, 0, 0.5, 1])
            break
        }

        // 
        case "notesIntro": {

        }


        /**
         * Quadratic Levels
         * We introduce the mathblock interface while teaching that the 
         * derivative of $x^2$ is $x$. We don't actually identify the 
         * quadratic as $x^2$ until the next section.
         */
        case "quad": {
            subMenu(gameState, "2")
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
            quadDiscLevel(gameState, 16, withButton = true)
            break
        }

        case "quad32": {
            quadDiscLevel(gameState, 32, withButton = true)
            break
        }

        case "quad400": {
            quadDiscLevel(gameState, 400, withButton = true)
            break
        }

        case "quad2x": {
            quadDiscLevel(gameState, 400, withButton = true, withSySlider = true, func = (x => x * x - 2))
            break
        }

        case "quadNeg": {
            quadDiscLevel(gameState, 400, withButton = true, withSySlider = true, func = (x => -x * x / 2))
            break
        }

        case "quadHalf": {
            quadDiscLevel(gameState, 400, withButton = true, withSySlider = true, func = (x => x * x / 4))
            gameState.objects.tracer.origin_y += 100
            break
        }

        case "quadShiftLeft": {
            quadDiscLevel(gameState, 400, withButton = true, withSySlider = true, func = (x => (x + 1) * (x + 1) / 2 - 2))
            gameState.objects.tracer.origin_y += 350
            break
        }

        case "quadShiftRight": {
            quadDiscLevel(gameState, 400, withButton = true, withSySlider = true, func = (x => (x - 1) * (x - 1) / 4 - 1))
            gameState.objects.tracer.origin_y += 75
            break
        }

        /**
         * - We introduce symbols for the first time. The level solves itself.
         * - You have to drag the mathblocks to the field.
         */
        case "quad4": {
            const fun = x => x * x / 2
            const blocks = [[MathBlock.VARIABLE, "x"]]
            genContLevel(gameState, fun, blocks)
            break
        }

        /**
         * Scaling the line smaller scales the quadratic smaller.
         */
        case "quad5": {
            const fun = x => x * x / 4
            const blocks = [[MathBlock.VARIABLE, "x"]]
            genContLevel(gameState, fun, blocks)
            break
        }

        /**
         * Scaling the line larger scales the quadratic larger.
         */
        case "quad6": {
            const fun = x => x * x
            const blocks = [[MathBlock.VARIABLE, "x"]]
            genContLevel(gameState, fun, blocks, { grid_width: 4, grid_height: 4, x_axis: 4, y_axis: 2 })
            break
        }

        /**
         * Shifting the line up/down shifts the quadratic left/right.
         * This happens because shifting the function left shifts the integral left.
         * I'm not sure this is an effective way of teaching this connection. Maybe a discrete puzzle would be better.
         */
        case "quad7": {
            const fun = x => x * x / 4 + x - 1
            const blocks = [[MathBlock.VARIABLE, "x"]]
            genContLevel(gameState, fun, blocks)
            break
        }

        /**
         * - Scaling the line by a negative flips it.
         */
        case "quad8": {
            const fun = x => -x * x / 2 + 2
            const blocks = [[MathBlock.VARIABLE, "x"]]
            genContLevel(gameState, fun, blocks)
            break
        }

        /**
         *  Shifting the line up/down shifts the quadratic left/right.
         */
        case "quad9": {
            const fun = x => x * x / 4 - x - 1
            const blocks = [[MathBlock.VARIABLE, "x"]]
            genContLevel(gameState, fun, blocks)
            break
        }

        // I vote no more puzzles here to reduce fatigue of quadratic
        //  style puzzles. Can cover negative scaling and shifting in cubic 5-8.

        /**
         * Cubic levels
         * 
         * - Another thing that could be good for cubic is triple discrete graphs.
         */
        case "cubic": {
            subMenu(gameState, "3")
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
            subMenu(gameState, "4")
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
            subMenu(gameState, "5", "sin")
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
            subMenu(gameState, "6", "sum")
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
            subMenu(gameState, "7", "prod")
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
            subMenu(gameState, "8", "chain")
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


