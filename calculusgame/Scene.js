/**
 * This file contains all of the data for the levels.
 * 
 * The canvas is set to 1600 x 900 px, and scaled down if the window is too small.
 * We do all layout math relative to the 1600 x 900 px.
 * We know that we want the aspect ratio to be 16:9, so we hardcode to 1600 x 900.
 * Its arguably more human readable.
 * 
 * 
*/

const canvas_width = 1600
const canvas_height = 900

// Center, align, distribute
// align_x([obj]): 
// For each obj 
//
// dist 
// 
// group
// 

function preIntro(gameState){
    text = new TextBox(0,0,"")
    gameState.objects = [
        
    ]
    gameState.update = (()=>{})
}

/**
 * 
 * 
 */

function mainMenu(gameState){
    gameState.objects = {
        // Could use alignment and distribution helpers
        button1 : new NavButton(300,250,100,100, (()=> gameState.sceneName = "introMenu"), "1"),
        button2 : new NavButton(600,250,100,100, (()=> gameState.sceneName = "quadMenu"), "2"),
        button3 : new NavButton(900,250,100,100, (()=> gameState.sceneName = "cubicMenu"), "3"),
        button4 : new NavButton(1200,250,100,100, (()=> gameState.sceneName = "expMenu"), "4"),
        button5 : new NavButton(300,550,100,100, (()=> gameState.sceneName = "sinMenu"), "5"),
        button6 : new NavButton(600,550,100,100, (()=> gameState.sceneName = "sumMenu"), "6"),
        button7 : new NavButton(900,550,100,100, (()=> gameState.sceneName = "prodMenu"), "7"),
        button8 : new NavButton(1200,550,100,100, (()=> gameState.sceneName = "chainMenu"), "8"),
    }
    gameState.update = (()=>{})
}

// function introMenu(gameState){
//     mainMenu(gameState)
//     gameState.objects.button1.onclick =  (()=> gameState.sceneName = "intro1")
//     gameState.objects.button1.label = "1.1"
//     gameState.objects.button2.onclick =  (()=> gameState.sceneName = "intro2")
//     gameState.objects.button2.label = "1.2"
//     gameState.objects.button3.onclick =  (()=> gameState.sceneName = "intro3")
//     gameState.objects.button3.label = "1.3"
//     gameState.objects.button4.onclick =  (()=> gameState.sceneName = "intro4")
//     gameState.objects.button4.label = "1.4"
//     delete gameState.objects.button5
//     delete gameState.objects.button6
//     delete gameState.objects.button7
//     delete gameState.objects.button8
//     gameState.objects.backButton = new NavButton(100,100,100,100, (()=> gameState.sceneName = "mainMenu"), "↑"),
//     buttons = [gameState.objects.button1, gameState.objects.button2,gameState.objects.button3,
//         gameState.objects.button4,gameState.objects.button5,gameState.objects.button6,gameState.objects.button7,gameState.objects.button8
//     ]
//     gameState.update = (()=>{
//         for (let i = 0; i < buttons.length; i++){
//             if (gameState.completedLevels["intro"+(i+1)]){
//                 gameState.objects["button"+(i+1)].color = Color.blue
//             }
//         }
//     })

// }

function subMenu(gameState, num, name){
    buttons = []
    for (let i = 0; i < 8; i++){
        buttons.push(new NavButton(300*(i%4+1),250+300*Math.floor(i/4),100,100, (()=> gameState.sceneName = name+(i+1)), num+"."+(i+1)))
    }
    const backButton = new NavButton(100,100,100,100, (()=> gameState.sceneName = "mainMenu"), "↑")
    buttons.push(backButton)

    gameState.update = (()=>{
        for (let i = 0; i < buttons.length; i++){
            if (gameState.completedLevels[name+(i+1)]){
                buttons[i].color = Color.blue
            }
        }
    })
    gameState.objects = buttons
    
}

// TODO: switch over to one tracer class
function introLevels(gameState, vals, name, next){
    // Right align 100px left of middle (800-100-400=300)
    // Center vertically (450-400/2=250)
    const gridLeft = new Grid(300,250,400,400,4,4,5,2,2)
    // Left align 100px right of middle (800+100=900)
    const gridRight = new Grid(900,250,400,400,4,4,5,2,2)
    // On first four cols of gridRight
    // x = 900, 950, 1000, 1050. top_y = 250.  
    const slider1 = new Slider(900, 250, 400,  4, 0, 2, 0.1, false)
    const slider2 = new Slider(1000, 250, 400, 4, 0, 2, 0.1, false)
    const slider3 = new Slider(1100, 250, 400, 4, 0, 2, 0.1, false)
    const slider4 = new Slider(1200, 250, 400, 4, 0, 2, 0.1, false)
    const target1_coord = gridLeft.gridToCanvas(-1,vals[0])
    const target2_coord = gridLeft.gridToCanvas(0,vals[1])
    const target3_coord = gridLeft.gridToCanvas(1,vals[2])
    const target4_coord = gridLeft.gridToCanvas(2,vals[3])
    const target1 = new Target(target1_coord.x,target1_coord.y,15)
    const target2 = new Target(target2_coord.x,target2_coord.y,15)
    const target3 = new Target(target3_coord.x,target3_coord.y,15)
    const target4 = new Target(target4_coord.x,target4_coord.y,15)
    const tracer = new Tracer(300,450,gridLeft,
        {type:"sliders",sliders:[slider1,slider2,slider3,slider4],slider_spacing:100},
        4,[target1,target2,target3,target4])
    const back_button = new NavButton(100,100,100,100, (()=> gameState.sceneName = "introMenu"),"↑")
    const forward_button = new NavButton(300,100,100,100, (()=> gameState.sceneName = next),"→")
    forward_button.active = false
    function update (){
        if(tracer.solved && !gameState.completedLevels[name]){
            //localStorage.setItem(name, "solved");
            gameState.completedLevels[name] = true
            gameState.writeToStorage = true
            
        }
        if (gameState.completedLevels[name]){
            forward_button.active = true
        }
    }
    const objs = [gridLeft,gridRight,slider1,slider2,slider3,slider4,tracer,target1,target2,target3,target4, back_button, forward_button]
    gameState.objects = objs
    gameState.update = update
}

function simpleDiscLevel(gameState, target_vals, next, tracer_start = 0){
    const num_sliders = target_vals.length
    const gridLeft = new Grid(300,250,400,400,4,4,5,2,2)
    const gridRight = new Grid(900,250,400,400,4,4,5,2,2)
    var sliders = []
    const slider_spacing = 400/num_sliders
    for (let i = 0; i < num_sliders; i++){
        sliders.push(new Slider(900+slider_spacing*i, 250, 400, 4, 0, 2, 0.01, false, vertical=true,circleRadius=10))
    }
    var targets = []
    for (let i = 0; i < num_sliders; i++){
        const x = -2 + (i+1)/num_sliders*4
        const coord = gridLeft.gridToCanvas(x,target_vals[i])
        targets.push(new Target(coord.x, coord.y, 10))
    }
    const tracer_coord = gridLeft.gridToCanvas(-2,tracer_start)
    const tracer = new Tracer(tracer_coord.x,tracer_coord.y,gridLeft,
        {type:"sliders",sliders:sliders,slider_spacing:slider_spacing},
        4,targets)
    const back_button = new NavButton(100,100,100,100, (()=> gameState.sceneName = "introMenu"),"↑")
    const forward_button = new NavButton(300,100,100,100, (()=> gameState.sceneName = next),"→")
    forward_button.active = false
    function update (){
        if(tracer.solved && !gameState.completedLevels[gameState.sceneName]){
            gameState.completedLevels[gameState.sceneName] = true
            gameState.writeToStorage = true
            
        }
        if (gameState.completedLevels[gameState.sceneName]){
            forward_button.active = true
        }
    }
    const objs = [gridLeft,gridRight,tracer, back_button, forward_button].concat(targets).concat(sliders)
    gameState.objects = objs
    gameState.update = update
}


function quadDiscLevel(gameState, num_sliders, next){
    const gridLeft = new Grid(300,250,400,400,4,4,5,2,2)
    const gridRight = new Grid(900,250,400,400,4,4,5,2,2)
    var sliders = []
    const slider_spacing = 400/num_sliders
    for (let i = 0; i < num_sliders; i++){
        sliders.push(new Slider(900+slider_spacing*i, 250, 400, 4, 0, 2, 0.01, false, vertical=true,circleRadius=10))
    }
    const target_coords = []
    for (let i = 0; i<num_sliders; i++){
        const x = -2 + (i+1)/num_sliders*4
        target_coords.push([x,x*x/2])
    }
    var targets = []
    for (let i = 0; i < target_coords.length; i++){
        const coord = gridLeft.gridToCanvas(target_coords[i][0],target_coords[i][1])
        targets.push(new Target(coord.x, coord.y, 10))
    }
    const tracer = new Tracer(300,250,gridLeft,
        {type:"sliders",sliders:sliders,slider_spacing:slider_spacing},
        4,targets)
    const back_button = new NavButton(100,100,100,100, (()=> gameState.sceneName = "quadMenu"),"↑")
    const forward_button = new NavButton(300,100,100,100, (()=> gameState.sceneName = next),"→")
    forward_button.active = false
    function update (){
        if(tracer.solved && !gameState.completedLevels[gameState.sceneName]){
            gameState.completedLevels[gameState.sceneName] = true
            gameState.writeToStorage = true
            
        }
        if (gameState.completedLevels[gameState.sceneName]){
            forward_button.active = true
        }
    }
    const objs = [gridLeft,gridRight,tracer, back_button, forward_button].concat(targets).concat(sliders)
    gameState.objects = objs
    gameState.update = update
}

function cubicDiscLevel(gameState, num_sliders, next){
    // To generalize
    const fun = x => x*x*x/6

    const gridLeft = new Grid(300,250,400,400,4,4,5,2,2)
    const gridRight = new Grid(900,250,400,400,4,4,5,2,2)
    var sliders = []
    const slider_spacing = 400/num_sliders
    for (let i = 0; i < num_sliders; i++){
        sliders.push(new Slider(900+slider_spacing*i, 250, 400, 4, 0, 2, 0.01, false, vertical=true,circleRadius=10))
    }
    const target_coords = []
    for (let i = 0; i<num_sliders; i++){
        const x = -2 + (i+1)/num_sliders*4
        target_coords.push([x,fun(x)])
    }
    var targets = []
    for (let i = 0; i < target_coords.length; i++){
        const coord = gridLeft.gridToCanvas(target_coords[i][0],target_coords[i][1])
        targets.push(new Target(coord.x, coord.y, 10))
    }
    const tracer_start = gridLeft.gridToCanvas(-2,fun(-2))
    const tracer = new Tracer(tracer_start.x,tracer_start.y,gridLeft,
        {type:"sliders",sliders:sliders,slider_spacing:slider_spacing},
        4,targets)
    const back_button = new NavButton(100,100,100,100, (()=> gameState.sceneName = "cubicMenu"),"↑")
    const forward_button = new NavButton(300,100,100,100, (()=> gameState.sceneName = next),"→")
    forward_button.active = false
    function update (){
        if(tracer.solved && !gameState.completedLevels[gameState.sceneName]){
            gameState.completedLevels[gameState.sceneName] = true
            gameState.writeToStorage = true
            
        }
        if (gameState.completedLevels[gameState.sceneName]){
            forward_button.active = true
        }
    }
    const objs = [gridLeft,gridRight,tracer, back_button, forward_button].concat(targets).concat(sliders)
    gameState.objects = objs
    gameState.update = update
}

function expDiscLevel(gameState, num_sliders, next){
    // To generalize

    const gridLeft = new Grid(300,250,400,400,4,4,5,4,2)
    const gridRight = new Grid(900,250,400,400,4,4,5,4,2)
    var sliders = []
    const slider_spacing = 400/num_sliders
    for (let i = 0; i < num_sliders; i++){
        sliders.push(new Slider(900+slider_spacing*i, 250, 400, 4, 0, 4, 0.01, false, vertical=true,circleRadius=10))
    }
    const target_coords = []
    for (let i = 0; i<num_sliders-1; i++){
        const x = -2 + (i+1)/num_sliders*4
        target_coords.push([x,0])
    }
    var targets = []
    for (let i = 0; i < target_coords.length; i++){
        const coord = gridLeft.gridToCanvas(target_coords[i][0],target_coords[i][1])
        targets.push(new Target(coord.x, coord.y, 10))
    }
    const tracer_start = gridLeft.gridToCanvas(-2,0.15)
    const tracer = new Tracer(tracer_start.x,tracer_start.y,gridLeft,
        {type:"sliders",sliders:sliders,slider_spacing:slider_spacing},
        4,targets)
    const back_button = new NavButton(100,100,100,100, (()=> gameState.sceneName = "expMenu"),"↑")
    const forward_button = new NavButton(300,100,100,100, (()=> gameState.sceneName = next),"→")
    forward_button.active = false
    function update (){
        for (let i = 0; i < num_sliders-1; i++){
            targets[i].setPosition(targets[i].x,gridLeft.gridToCanvas(0,sliders[i+1].value).y)
        }

        if(tracer.solved && !gameState.completedLevels[gameState.sceneName]){
            gameState.completedLevels[gameState.sceneName] = true
            gameState.writeToStorage = true
            
        }
        if (gameState.completedLevels[gameState.sceneName]){
            forward_button.active = true
        }
    }

    const objs = [gridLeft,gridRight,tracer, back_button, forward_button].concat(targets).concat(sliders.slice(1))
    gameState.objects = objs
    gameState.update = update
}

function sinDiscLevel(gameState, num_sliders, next, grid_size){
    const grid1 = new Grid(100,250,400,400,grid_size,grid_size,5,grid_size/2,grid_size/2)
    const grid2 = new Grid(600,250,400,400,grid_size,grid_size,5,grid_size/2,grid_size/2)
    const grid3 = new Grid(1100,250,400,400,grid_size,grid_size,5,grid_size/2,grid_size/2)
    var sliders = []
    const slider_spacing = 400/num_sliders
    for (let i = 0; i < num_sliders; i++){
        sliders.push(new Slider(grid3.origin_x+slider_spacing*i, 250, 400, grid_size, 0, grid_size/2, 0.01, false, vertical=true,circleRadius=10))
    }
    const target_coords = []
    for (let i = 0; i<num_sliders-1; i++){
        //const x = -2 + (i+1)/num_sliders*4
        const x = grid1.grid_x_min + (i+1)/num_sliders*grid1.gridWidth
        target_coords.push([x,0])
    }
    var targets = []
    for (let i = 0; i < target_coords.length; i++){
        const coord = grid1.gridToCanvas(target_coords[i][0],target_coords[i][1])
        targets.push(new Target(coord.x, coord.y, 10))
    }
    const tracer2_start = grid2.gridToCanvas(grid2.grid_x_min,1)
    const tracer2 = new Tracer(tracer2_start.x,tracer2_start.y,grid2,
        {type:"sliders",sliders:sliders,slider_spacing:slider_spacing},
        4,targets)
    const tracer1_start = grid1.gridToCanvas(grid2.grid_x_min,0)
    const tracer1 = new Tracer(tracer1_start.x,tracer1_start.y,grid1,
        {type:"tracer",source_tracer:tracer2},
        4,targets)
    const back_button = new NavButton(100,100,100,100, (()=> gameState.sceneName = "expMenu"),"↑")
    const forward_button = new NavButton(300,100,100,100, (()=> gameState.sceneName = next),"→")
    forward_button.active = false
    function update (){
        for (let i = 0; i < num_sliders-1; i++){
            targets[i].setPosition(targets[i].x,grid1.gridToCanvas(0,-sliders[i+1].value).y)
        }

        if(tracer1.solved && !gameState.completedLevels[gameState.sceneName]){
            gameState.completedLevels[gameState.sceneName] = true
            gameState.writeToStorage = true
        }
        if (gameState.completedLevels[gameState.sceneName]){
            forward_button.active = true
        }
    }

    const objs = [grid1,grid2,grid3,tracer2,tracer1, back_button, forward_button].concat(targets).concat(sliders.slice(1))
    gameState.objects = objs
    gameState.update = update
}


// NOT USED DELETE
// function quadContLevel(gameState, target_coords, next){
//     // Right align 100px left of middle (800-100-400=300)
//     // Center vertically (450-400/2=250)
//     const y_adjust = 100
//     const x_adjust = 100
//     const gridLeft = new Grid(100+x_adjust,250+y_adjust,400,400,4,4,5,2,2)
//     // Left align 100px right of middle (800+100=900)
//     const gridRight = new Grid(600+x_adjust,250+y_adjust,400,400,4,4,5,2,2)
//     const block1 = new MathBlock(MathBlock.VARIABLE,"x",1300+x_adjust,250+y_adjust)
//     const ty_slider = new Slider(1100+x_adjust, 250+y_adjust, 400, 8, 0, 4, 0.1, true, true)
//     const sy_slider = new Slider(1200+x_adjust, 250+y_adjust, 400, 8, 1, 4, 0.1, true, true)
//     const funRight = new FunctionTracer(gridRight)
//     //const funLeft = new FunctionTracer(gridLeft, (x => x*x))
//     //funLeft.color = Color.red
//     const mngr = new MathBlockManager([block1],600+x_adjust,150+y_adjust, ty_slider, sy_slider, funRight)
//     targets = []
//     for (let i = 0; i < target_coords.length; i++){
//         const canvas_coords = gridLeft.gridToCanvas(target_coords[i][0],target_coords[i][1])
//         targets.push(new Target(canvas_coords.x, canvas_coords.y,10))
//     }
//     const tracer = new Tracer(100+x_adjust,250+y_adjust,gridLeft,{type:"mathBlock",mathBlockMngr:mngr},4,targets)
//     // Nav buttons
//     const back_button = new NavButton(100,100,100,100, (()=> gameState.sceneName = "quadMenu"),"↑")
//     const forward_button = new NavButton(300,100,100,100, (()=> gameState.sceneName = next),"→")
//     forward_button.active = false
    
//     function update (){
//         if(tracer.solved && !gameState.completedLevels[gameState.sceneName]){
//             //localStorage.setItem(gameState.sceneName, "solved");
//             gameState.completedLevels[gameState.sceneName] = true
//             gameState.writeToStorage = true
            
//         }
//         if (gameState.completedLevels[gameState.sceneName]){
//             forward_button.active = true
//         }
//     }
//     gameState.objects = [gridLeft,gridRight,sy_slider,ty_slider,mngr,funRight,tracer,forward_button,back_button].concat(targets)
//     gameState.update = update
// }

function cubicContLevel(gameState, fun, next){
    const blocks = [[MathBlock.VARIABLE,"x"],[MathBlock.POWER,"2"]]

    const target_coords = []
    const num_targets = 16
    for (let i = 0; i < num_targets; i++){
        const x = -2 + (i+1)/num_targets*4
        const y = fun(x)
        target_coords.push([x,y])
    }

    const y_adjust = 100
    const x_adjust = 100
    const gridLeft = new Grid(100+x_adjust,250+y_adjust,400,400,4,4,5,2,2)
    const gridRight = new Grid(600+x_adjust,250+y_adjust,400,400,4,4,5,2,2)
    const block1 = new MathBlock(MathBlock.VARIABLE,"x",1300+x_adjust,250+y_adjust)
    const block2 = new MathBlock(MathBlock.POWER,"2",1300+x_adjust,350+y_adjust)
    const ty_slider = new Slider(1100+x_adjust, 250+y_adjust, 400, 8, 0, 4, 0.1, true, true)
    const sy_slider = new Slider(1200+x_adjust, 250+y_adjust, 400, 8, 1, 4, 0.1, true, true)
    const funRight = new FunctionTracer(gridRight)
    //const funLeft = new FunctionTracer(gridLeft, (x => x*x))
    //funLeft.color = Color.red
    const mngr = new MathBlockManager([block1,block2],600+x_adjust,150+y_adjust, ty_slider, sy_slider, funRight)
    targets = []
    for (let i = 0; i < target_coords.length; i++){
        const canvas_coords = gridLeft.gridToCanvas(target_coords[i][0],target_coords[i][1])
        targets.push(new Target(canvas_coords.x, canvas_coords.y,10))
    }
    tracer_start = gridLeft.gridToCanvas(-2,fun(-2))
    const tracer = new Tracer(tracer_start.x,tracer_start.y,gridLeft,{type:"mathBlock",mathBlockMngr:mngr},4,targets)
    // Nav buttons
    const back_button = new NavButton(100,100,100,100, (()=> gameState.sceneName = "cubicMenu"),"↑")
    const forward_button = new NavButton(300,100,100,100, (()=> gameState.sceneName = next),"→")
    forward_button.active = false
    
    function update (){
        if(tracer.solved && !gameState.completedLevels[gameState.sceneName]){
            //localStorage.setItem(gameState.sceneName, "solved");
            gameState.completedLevels[gameState.sceneName] = true
            gameState.writeToStorage = true
            
        }
        if (gameState.completedLevels[gameState.sceneName]){
            forward_button.active = true
        }
    }
    gameState.objects = [gridLeft,gridRight,sy_slider,ty_slider,mngr,funRight,tracer,forward_button,back_button].concat(targets)
    gameState.update = update
}


function genContLevel(gameState, fun, blocks, next, back,
    grid_setting = {grid_width: 4, grid_height: 4, x_axis: 2, y_axis: 2},
){
    const target_coords = []
    const num_targets = 16
    for (let i = 0; i < num_targets; i++){
        const x = -2 + (i+1)/num_targets*4
        const y = fun(x)
        target_coords.push([x,y])
    }

    const y_adjust = 100
    const x_adjust = 100
    const gridLeft = new Grid(100+x_adjust,250+y_adjust,400,400,grid_setting.grid_width,grid_setting.grid_height,5,grid_setting.x_axis,grid_setting.y_axis)
    const gridRight = new Grid(600+x_adjust,250+y_adjust,400,400,grid_setting.grid_width,grid_setting.grid_height,5,grid_setting.x_axis,grid_setting.y_axis)
    const ty_slider = new Slider(1100+x_adjust, 250+y_adjust, 400, 8, 0, 4, 0.1, true, true)
    const sy_slider = new Slider(1200+x_adjust, 250+y_adjust, 400, 8, 1, 4, 0.1, true, true)
    const funRight = new FunctionTracer(gridRight)
    //const funLeft = new FunctionTracer(gridLeft, (x => x*x))
    //funLeft.color = Color.red
    const math_blocks = []
    for (let i = 0; i < blocks.length; i++){
        math_blocks.push(new MathBlock(blocks[i][0],blocks[i][1],1300+x_adjust,250+y_adjust+100*i))
    }
    const mngr = new MathBlockManager(math_blocks,600+x_adjust,150+y_adjust, ty_slider, sy_slider, funRight)
    targets = []
    for (let i = 0; i < target_coords.length; i++){
        const canvas_coords = gridLeft.gridToCanvas(target_coords[i][0],target_coords[i][1])
        targets.push(new Target(canvas_coords.x, canvas_coords.y,10))
    }
    tracer_start = gridLeft.gridToCanvas(-2,fun(-2))
    const tracer = new Tracer(tracer_start.x,tracer_start.y,gridLeft,{type:"mathBlock",mathBlockMngr:mngr},4,targets)
    // Nav buttons
    const back_button = new NavButton(100,100,100,100, (()=> gameState.sceneName = back),"↑")
    const forward_button = new NavButton(300,100,100,100, (()=> gameState.sceneName = next),"→")
    forward_button.active = false
    
    function update (){
        if(tracer.solved && !gameState.completedLevels[gameState.sceneName]){
            //localStorage.setItem(gameState.sceneName, "solved");
            gameState.completedLevels[gameState.sceneName] = true
            gameState.writeToStorage = true
            
        }
        if (gameState.completedLevels[gameState.sceneName]){
            forward_button.active = true
        }
    }
    gameState.objects = [gridLeft,gridRight,sy_slider,ty_slider,mngr,funRight,tracer,forward_button,back_button].concat(targets)
    gameState.update = update
}




/**
 * 
 * The main function for serving up scenes.
 * 
 * The comments above each level describe the intended 
 * things that the level should teach.
 * 
 */
function loadScene(gameState){
    switch (gameState.sceneName){
        case "":
        case "mainMenu":{   
            mainMenu(gameState)
            break
        }

        /** Intro Levels
         * Difficulty here is quite low, player should only struggle with
         * understanding what the goal is and what they have under their
         * control. They should grasp this in the first 4 puzzles, and 
         * then 5-8 are a victory lap to encourage them before we introduce
         * complexity in 2.
         */
        case "introMenu":{
            subMenu(gameState,"1","intro")
            break
        }
        
        /**
         * - The purple squares turn blue when hit by the line.   
         * - The sliders change the line
         */
        case "intro1":{
            introLevels(gameState, [0,1,1,2], "intro1", "intro2")
            break
        }

        /**
         * - Moving the slider up makes the line go up, and likewise down.
         * - One unit on the slider corresponds to one unit on the tracer.
         */
        case "intro2":{
            introLevels(gameState, [1,0,-1,0], "intro2", "intro3")
            break
        }

        /**
         * - Sliders can be set to partial units, specifically half
         * - The end spot of the tracer is not the slider location, 
         *   but the accumulation of slider values
         */
        case "intro3":{
            introLevels(gameState, [0.5,1,0.5,1.5], "intro3", "intro4")
            break
        }

        /**
         * - Reinforce 1.1-1.3 while using max slider values
         */
        case "intro4":{
            introLevels(gameState, [2,1.5,-0.5,-2], "intro4", "intro5")
            break
        }

        /**
         * - If sliders are on half units, the resulting slope is halved.
         */
        case "intro5":{
            simpleDiscLevel(gameState, [1,0.5,-0.1,-0.8,-0.4,0.6,0.2,0.4], "intro6")
            break
        }

        /**
         * 
         */
        case "intro6":{
            simpleDiscLevel(gameState, [0.25,0.5,0.75,1,1.25,1,0.75,0.5,
                                        0.25,0,0.5,1,0.5,0,0.5,1], "intro7")
            break
        }

        /**
         * 
         */
        case "intro7":{
            simpleDiscLevel(gameState, [1,0,-1,0], "intro8",1)
            break
        }

        /**
         * 
         */
        case "intro8":{
            simpleDiscLevel(gameState, [-1,-0.5,-0.1,0.2,0.4,0.5,0.3,0.6], "quadMenu", -1.5)
            break
        }


        /**
         * Quadratic Levels
         * We introduce the mathblock interface while teaching that the 
         * derivative of $x^2$ is $x$. We don't actually identify the 
         * quadratic as $x^2$ until the next section.
         */
        case "quadMenu":{
            subMenu(gameState,"2","quad")
            break
        }

        /**
         * - A quadratic shape on the left can be achieved by a linear
         *   shape on the right.
         */
        case "quad1":{
            quadDiscLevel(gameState,4,"quad2")
            break
        }

        /**
         * - As we add more sliders the curve becomes smoother
         */
        case "quad2":{
            quadDiscLevel(gameState,8,"quad3")
            break
        }

        /**
         * - As we add more sliders the curve becomes smoother
         */
        case "quad3":{
            quadDiscLevel(gameState,16,"quad4")
            break
        }

        /**
         * - We introduce symbols for the first time. The level solves itself.
         * - You have to drag the mathblocks to the field.
         */
        case "quad4":{
            const fun = x => x*x/2
            const blocks = [[MathBlock.VARIABLE,"x"]]
            genContLevel(gameState, fun, blocks, "quad5", "quadMenu")
            break
        }

        /**
         * Scaling the line smaller scales the quadratic smaller.
         */
        case "quad5":{
            const fun = x => x*x/4
            const blocks = [[MathBlock.VARIABLE,"x"]]
            genContLevel(gameState, fun, blocks, "quad6", "quadMenu")
            break
        }

        /**
         * Scaling the line larger scales the quadratic larger.
         */
        case "quad6":{
            const fun = x => x*x
            const blocks = [[MathBlock.VARIABLE,"x"]]
            genContLevel(gameState, fun, blocks, "quad7", "quadMenu", {grid_width:4, grid_height:4, x_axis:4, y_axis:2})
            break
        }

        /**
         * Shifting the line up/down shifts the quadratic left/right.
         * This happens because shifting the function left shifts the integral left.
         * I'm not sure this is an effective way of teaching this connection. Maybe a discrete puzzle would be better.
         */
        case "quad7":{
            const fun = x => x*x/4+x-1
            const blocks = [[MathBlock.VARIABLE,"x"]]
            genContLevel(gameState, fun, blocks, "quad8", "quadMenu")
            break
        }

        /**
         * - Scaling the line by a negative flips it.
         */
        case "quad8":{
            const fun = x =>-x*x/2+2
            const blocks = [[MathBlock.VARIABLE,"x"]]
            genContLevel(gameState, fun, blocks, "cubicMenu", "quadMenu")
            break
        }

        /**
         *  Shifting the line up/down shifts the quadratic left/right.
         */
        case "quad9":{
            const fun = x =>   x*x/4-x-1
            const blocks = [[MathBlock.VARIABLE,"x"]]
            genContLevel(gameState, fun, blocks, "cubicMenu", "quadMenu")
            break
        }

        // I vote no more puzzles here to reduce fatigue of quadratic
        //  style puzzles. Can cover negative scaling and shifting in cubic 5-8.

        /**
         * Cubic levels
         * 
         * - Another thing that could be good for cubic is triple discrete graphs.
         */
        case "cubicMenu":{
            subMenu(gameState,"3","cubic")
            break
        }

        /**
         * Same as 2.1-2.3, just with the cubic target.
         */
        case "cubic1":{
            cubicDiscLevel(gameState, 4, "cubic2")
            break
        }

        case "cubic2":{
            cubicDiscLevel(gameState, 8, "cubic3")
            break
        }

        case "cubic3":{
            cubicDiscLevel(gameState, 16, "cubic4")
            break
        }

        /**
         * Might want to label x^3 here. After this we don't off x^3 as a mathblock.
         */
        case "cubic4":{
            const fun = x => x*x*x/6
            cubicContLevel(gameState, fun, "cubic5")
            break
        }

        /**
         * Small scale
         */
        case "cubic5":{
            const fun = x => x*x*x/10
            cubicContLevel(gameState, fun, "cubic6")
            break
        }

        /**
         * 
         */
        case "cubic6":{
            const fun = x => x*x*x*2/3 - x*2 
            cubicContLevel(gameState, fun, "cubic7")
            break
        }

        case "cubic7":{
            const fun = x => -x*x*x*2/3 + x*2 
            cubicContLevel(gameState, fun, "cubic8")
            break
        }

        case "cubic8":{
            const fun = x => 0.1*x*x*x+0.3*x*x+0.3*x-1
            cubicContLevel(gameState, fun, "expMenu")
            break
        }



        /**
         * Exponential Levels
         * 
         */
        case "expMenu":{
            subMenu(gameState,"4","exp")
            break
        }

        case "exp1":{
            expDiscLevel(gameState, 4, "exp2")
            break
        }

        case "exp2":{
            expDiscLevel(gameState, 8, "exp3")
            break
        }

        case "exp3":{
            expDiscLevel(gameState, 16, "exp4")
            break
        }

        /**
         * 
         */
        case "exp4":{
            const fun = x => Math.E ** x/2
            const blocks = [[MathBlock.VARIABLE,"x"],[MathBlock.POWER,"2"],[MathBlock.EXPONENT,"e"]]
            const grid_setting = {grid_width: 4, grid_height: 4, x_axis: 4, y_axis: 2}
            genContLevel(gameState, fun, blocks, "exp5", "expMenu", grid_setting)
            break
        }

        case "exp5":{
            const fun = x => Math.E ** x/2
            const blocks = [[MathBlock.VARIABLE,"x"],[MathBlock.POWER,"2"],[MathBlock.EXPONENT,"e"]]
            const grid_setting = {grid_width: 4, grid_height: 4, x_axis: 4, y_axis: 2}
            genContLevel(gameState, fun, blocks, "exp6", "expMenu", grid_setting)
            break
        }
        
        case "sinMenu":{
            subMenu(gameState,"5","sin")
            break
        }

        case "sin1":{
            sinDiscLevel(gameState, 4, "sin2", 4)
            break
        }

        case "sin2":{
            sinDiscLevel(gameState, 8, "sin3", 4)
            break
        }

        case "sin3":{
            sinDiscLevel(gameState, 8, "sin4",8)
            break
        }

        case "sin4":{
            sinDiscLevel(gameState, 16, "sin5",8)
            break
        }

        /**
         * 6 sum
         * 
         * Now we for sure have labels on the left graph.
         * 
         * These puzzles work best if 
         */

        case "sumMenu":{
            subMenu(gameState,"6","sum")
            break
        }



        /**
         * 7 prod
         */

        case "prodMenu":{
            subMenu(gameState,"7","prod")
            break
        }

        /**
         * 8 chain
         */

        case "chainMenu":{
            subMenu(gameState,"8","chain")
            break
        }
    }
}


