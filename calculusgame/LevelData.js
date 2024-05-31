/**
 * This file contains all of the data for the levels.
 */

const data = {
    level1: {
        gridSize: 4,
        correctAnswer: 1,
        lineSegments: [
            [0,1, 1,1]
        ],
    },
    level2: {
        preset: "level1",
        correctAnswer: 2,
    }
}

// TODO: A function to play a level from the data
// And Go to next level


// It might just be easier to have a function for each level.... We'll see.
// Need an efficient way to do code resuse.
// Many of the levels will be similar. But also I want the freedom to have a lot of variety...
// How about a separate function for each type of level...

function loadLevel(levelNumber){
    switch (levelNumber){
        // Use for testing only
        case 0: return multiSliderLevel([{start_x:-1, start_y:1, end_x:0, end_y:0},{start_x:0, start_y:0, end_x:1, end_y:1}],[-1,1],4,4,-1);

        // case 0: return slidableGridLevel([
        //     {start_x:-2, start_y:-2, end_x:-1, end_y:-1},
        //     {start_x:-1, start_y:-1, end_x:0, end_y:1},
        //     {start_x:0, start_y:1, end_x:1, end_y:0},
        //     {start_x:1, start_y:0, end_x:2, end_y:1},
        // ],
        //     [1,2,-1,1],16,16,-1,4);

        // Starts here
        // Probably change these to be objects, for readability
        case 1: return simpleSlopeLevel({start_x:0, start_y:0, end_x:1, end_y:1},1,4,4,-1);
        case 2: return simpleSlopeLevel({start_x:0, start_y:0, end_x:1, end_y:2},2,4,4,-1);
        case 3: return simpleSlopeLevel({start_x:0, start_y:0, end_x:1, end_y:-1},-1,4,4,-1);
        case 4: return simpleSlopeLevel({start_x:0, start_y:0, end_x:2, end_y:1},1/2,4,8,2);
        case 5: return simpleSlopeLevel({start_x:-1, start_y:0, end_x:2, end_y:1},1/3,4,12,3);
        case 6: return simpleSlopeLevel({start_x:0, start_y:0, end_x:2, end_y:2},1,4,8,2);
        case 7: return multiSliderLevel([{start_x:-1, start_y:1, end_x:0, end_y:0},{start_x:0, start_y:0, end_x:1, end_y:1}],[-1,1],4,4,-1);
        case 8: return slidableGridLevel([
            {start_x:-2, start_y:-2, end_x:-1, end_y:-1},
            {start_x:-1, start_y:-1, end_x:0, end_y:1},
            {start_x:0, start_y:1, end_x:1, end_y:0},
            {start_x:1, start_y:0, end_x:2, end_y:1},
        ],
            [1,2,-1,1],4,4,-1,10);
        default: return endLevel();
    }
}

function slidableGridLevel(lines, answer, gridSize, sliderSize, sliderDivision, lineWidth){
    const grid1 = new Grid(50,150,300,300,gridSize,lineWidth)
    const grid2 = new Grid(450,150,300,300,gridSize,lineWidth)
    var sliders = []
    var objs = [grid1,grid2]
    for (let i = 0; i < gridSize; i++){
        const slider = new Slider(450+(i+0.5)*300/gridSize,150,300, sliderSize, sliderDivision, -1, lineWidth*1.5)
        objs.push(slider)
        sliders.push(slider)
    }
    for (let i = 0; i < lines.length; i++){
        grid1.addLine(lines[i])
    }
    function winCon(objs){
        for (let i = 0; i < gridSize; i++){
            tickValue = (sliderSize/2 - sliders[i].value)/(sliderDivision == -1 ? 1 : sliderDivision)
            if (tickValue != answer[i])
                return false
            if (sliders[i].grabbed)
                return false            
        }
        return true
    }
    return {objs: objs, winCon: winCon}
}

function simpleSlopeLevel(line, answer, gridSize, sliderSize, sliderDivision){
    const slider = new Slider(1200,200,500, sliderSize, sliderDivision, 10)
    const grid = new Grid(400,200,500,500,gridSize,10)
    grid.addLine(line)
    const objs = [slider,grid]
    function winCon(){
        tickValue = (sliderSize/2 - slider.value)/(sliderDivision == -1 ? 1 : sliderDivision) 
        return tickValue == answer && slider.grabbed == false
    }
    return {objs: objs, winCon: winCon}
}


function multiSliderLevel(lines, answer, gridSize, sliderSize, sliderDivision, numSliders){
    const grid = new Grid(400,200,500,500,gridSize,10)
    var objs = [grid]
    var sliders = []
    for (let i = 0; i < numSliders; i++){
        const slider = new Slider(600,100,400, sliderSize, sliderDivision, 10)
        objs.push(slider)
        sliders.push(slider)
    }
    for (let i = 0; i < lines.length; i++){
        grid.addLine(lines[i])
    }
    function winCon(){
        for (let i = 0; i < numSliders; i++){
            tickValue = (sliderSize/2 - sliders[i].value)/(sliderDivision == -1 ? 1 : sliderDivision)
            if (tickValue != answer[i || sliders[i].grabbed])
                return false
        }
        return true
    }
    return {objs: objs, winCon: winCon}
}



function endLevel(){
    return {objs: [], winCon: ()=>false}
}



function level1(ctx){

}