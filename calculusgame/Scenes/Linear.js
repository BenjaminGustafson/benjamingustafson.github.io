import {Color, Shapes} from '../util/index.js'
import {Grid, FunctionTracer, Button, ImageObject, IntegralTracer, MathBlock, MathBlockManager, MathBlockField, Slider, Target, TargetAdder, TextBox, DialogueBox} from '../GameObjects/index.js'
import * as Scene from '../Scene.js'
import { GameObject } from '../GameObjects/GameObject.js'
import { createPuzzleButtons, unlockScenes } from './Planet.js'

/**
 * The map is isometric tiles of 128 x 64. 
 * The map is 1600 x 900, so that is 12.5 x 14.0625 tiles
 * The top left corner should be right at a tile intersection
 * Then to move along the path we just need the path coordinates
 * 
 */



function isometricToCanvas(x, y){
    const cx = x * 64 + (y- 8) * -64 - 160
    const cy = x * 32 + (y- 8) * 32 + 192
    return {x: cx, y : cy}
}

export const dialogue1 = [
    "⯘Ⳃⱙⰺⳡ ⰺⳝ⯨⯃⯎ ⱤⳆⰸ⯃ ⳙ⯹ⱡ ⯷ⳞⳤⱭⰶ.",
    "ⳏⳐⰷ⯁Ⱨⰴ ⯢ⱋⳒⰳⳙ ⯚⯜⯍ ⳙⰿⱆ ⳨⯟ⳑ⳪⳰ ⰴⱢⳈⳡ ⱍ⳧Ⳑⰿ.",
    "ⳟ⯔ ⳓ⯥ⱄⰳ ⳉⳂⳙ⯎ ⱤⳆⰸ⯃ Ɀⰳⱅⰸⳝ ⯢ⳔⳂⳚ ⱇⱏⰴⳂ ⰳⳤⱑ⯅ⰴ!"
]



function drawGlowSprite(ctx, img, x, y, {
    glowColor = 'rgba(255,255,0,0.9)',
    radius = 12,
    strength = 2 // extra passes for intensity
  } = {}) {
    // 1) colorize the sprite’s silhouette offscreen
    const off = document.createElement('canvas');
    off.width = img.width; off.height = img.height;
    const octx = off.getContext('2d');
    octx.drawImage(img, 0, 0);
    octx.globalCompositeOperation = 'source-in';
    octx.fillStyle = glowColor;
    octx.fillRect(0, 0, off.width, off.height);
  
    // 2) blur + additive composite as halo
    ctx.save();
    ctx.filter = `blur(${radius}px)`;
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < strength; i++) ctx.drawImage(off, x, y);
    ctx.restore();
  
    // 3) draw the sprite on top
    ctx.drawImage(img, x, y);
  }
  

const computerSE = document.getElementById('computerSE')
function drawComputer(ctx, x, y, {dir = 'SE', complete = null, mouseOver = false}){


}


class Ship{

}

class PuzzleComputer extends GameObject{
    constructor(){

    }
    update(ctx, audio, mouse){

    }
}

function computerPuzzle(){

    computerObj = {
        update(ctx,audio,mouse){

        }
    }
    return computerObj
}


export function linearPlanet(gameState){
    const gss = gameState.stored
    gss.planet = 'Linear'
    const levels = Scene.PLANET_DATA['Linear']['puzzles']


    const shipButton = new Button({originX:200, originY:600, width:100, height:60,
        onclick:(() => { Scene.loadScene(gameState,"planetMap") }),
        label:"Ship",
    })

    const ship = {
        computerImg: document.getElementById('computerSE'),
        update: function(ctx,audio,mouse){
            // drawGlowSprite(ctx, this.computerImg, 100,200, {glowColor : 'rgba(255,255,120,0.9)',
            //     radius : 10,
            //     strength: 2})
            // drawGlowSprite(ctx, this.computerImg, 100,300, {glowColor : 'rgba(255,255,120,0.8)',
            //     radius : 12,
            //     strength: 3})
            // drawGlowSprite(ctx, this.computerImg, 600,200, {glowColor : 'rgba(86,180,233,0.7)',
            //     radius : 8,
            //     strength: 1})
            // ctx.drawImage(this.computerImg, 100,100)
        }
    }

    const experimentButton = new Button({originX:180, originY:130, width:100, height:60, 
        onclick:(() => { Scene.loadScene(gameState, "linearExperiment") }), label: "Lab"
    })
    // TODO: abstract out this scene button creation
    switch (gss.completedScenes['linearExperiment']){
        case 'complete':
            experimentButton.bgColor = Color.blue
            break
        case 'in progress':
            experimentButton.active = true
            break
        default:
            case 'locked':
            experimentButton.active = false
            break
    }



    // Dialogue Buttons

    const dialogueButton = new Button({originX:1200, originY:300, width:50, height:50, fontSize: 20,
        onclick:(() => {
            Scene.loadScene(gameState,'linearDialogue1')
        }),
        label: "!",
    })

    switch (gss.completedScenes['linearDialogue1']){
        case 'complete':
            dialogueButton.bgColor = Color.blue
            break
        case 'in progress':
            dialogueButton.active = true
            break
        default:
            dialogueButton.active = false
            break
    }


    // Player ---------------------------------------
    // [x,y,  dx,dy] where dx dy is the direction to face when stopped at node
    // SW 0,1 NW -1,0 NE 0,-1 SE 1,0
    const nodes = {
        'planetMap': [8,9,  0,1],
        [levels[0]]: [8,7,  0,-1],
        [levels[1]]: [11,4, 0,-1],
        [levels[2]]: [14,2, 1,0],
        [levels[3]]: [12,0, 0,-1],
        [levels[4]]: [3,-5, -1,0],
        [levels[5]]: [2,-7, 0,-1],
        [levels[6]]: [0,-5, -1,0],
        [levels[7]]: [0,-2, -1,0],
        ['linearExperiment']: [11,4, -1,0],
    }

    const paths = 
    [
        {start: 'planetMap', end: levels[0]},
        {start: levels[0], end: levels[1], steps: [[10,7],[10,4]] },
        {start: levels[1], end: levels[2], steps: [[14,4]] },
        {start: levels[2], end: levels[3], steps: [[14,0]] },
        {start: levels[3], end: levels[4], steps: [[9,0],[9,-4], [3,-4]] },
        {start: levels[4], end: levels[5], steps: [[3,-7]] },
        {start: levels[5], end: levels[6], steps: [[1,-7],[1,-6],[0,-6]] },
        {start: levels[6], end: levels[7], steps: [] },
        {start: levels[7], end: 'linearExperiment', steps: [[0,0],[-1,0],[-1,1],[-2,1]]},

    ]
    
    // Path does not include starting node
    const adjacencyTable = {}
    for (const {start, end, steps=[]} of paths) {
        const forward = steps.slice() // copy array
        forward.push(nodes[end])
        const reverse = []
        for (let i = forward.length-2; i >= 0; i--){
            reverse.push(forward[i])
        }
        reverse.push(nodes[start])
        if (adjacencyTable[start] == null)
            adjacencyTable[start] = {}
        if (adjacencyTable[end] == null)
            adjacencyTable[end] = {}
        adjacencyTable[start][end] = forward
        adjacencyTable[end][start] = reverse
    }


    // BFS should be sufficient
    function bfsPath(adj, start, goal) {
        const queue = [[start]]
        const visited = new Set([start])
        
        while (queue.length > 0) {
            const nodePath = queue.shift()
            const node = nodePath[nodePath.length - 1]
            console.log(node, nodePath)
            if (node == goal) {
                var coordPath = []
                for (let i = 0; i < nodePath.length -1; i++){
                    coordPath = coordPath.concat(adj[nodePath[i]][nodePath[i+1]])
                }
                return coordPath
            }
        
            for (const neighbor in adj[node]) {
                if (!visited.has(neighbor)) {
                    visited.add(neighbor)
                    queue.push([...nodePath, neighbor])
                }
            }
        }
        return null
    }
      
    if (!nodes[gss.playerLocation]){
        gss.playerLocation = 'planetMap'
    }


    const player = {
        currentNode: gss.playerLocation,
        isoX: nodes[gss.playerLocation][0],
        isoY: nodes[gss.playerLocation][1],
        pathIndex: 0,
        currentPath: [],
        state: 'stopped',
        imgNE: document.getElementById('astronautB_NE'),
        imgSE: document.getElementById('astronautB_SE'),
        imgNW: document.getElementById('astronautB_NW'),
        imgSW: document.getElementById('astronautB_SW'),
        dx:nodes[gss.playerLocation][2],
        dy:nodes[gss.playerLocation][3],
        targetNode:'',
        startTime: 0,
        stepTime: 50,
        stepCount:0,
        moveTo: function(node){
            if (this.state == 'moving') return
            if (node == this.currentNode) {
                Scene.loadScene(gameState,this.currentNode)
                return
            }
            this.targetNode = node
            this.currentPath = bfsPath(adjacencyTable, this.currentNode, node)
            this.pathIndex = 0
            this.stepTime = Math.max(100,Math.min(200,1000/this.currentPath.length)) // not precise, but good enough
            const nextTarget = this.currentPath[this.pathIndex]
            this.dx = Math.sign(nextTarget[0] - this.isoX)
            this.dy = Math.sign(nextTarget[1] - this.isoY) 
            this.startTime = Date.now()
            this.state = 'moving'
        },
        update: function (ctx, audio, mouse){
            switch (this.state){
                case 'moving':
                    // Move one tick
                    if (Date.now() - this.startTime > this.stepTime){
                        audio.play('click_005', (this.stepCount++%2)*18-18+Math.random()*4, 0.4)
                        this.isoX += this.dx
                        this.isoY += this.dy
                        const targetCoord = this.currentPath[this.pathIndex]
                        // End of path step
                        if (this.isoX == targetCoord[0] && this.isoY == targetCoord[1]){
                            this.pathIndex ++
                            // End of path
                            if (this.pathIndex >= this.currentPath.length){
                                this.currentNode = this.targetNode
                                this.state = 'stopped'
                                gss.playerLocation = this.currentNode
                                this.dx =  nodes[this.currentNode][2]
                                this.dy = nodes[this.currentNode][3]
                                Scene.loadScene(gameState,this.currentNode)
                            }
                            // Next step
                            else{    
                                const nextTarget = this.currentPath[this.pathIndex]
                                this.dx = Math.sign(nextTarget[0] - this.isoX)
                                this.dy = Math.sign(nextTarget[1] - this.isoY) 
                            }
                        }
                        this.startTime = Date.now()
                    }


                    break
                case 'stopped':
                    break
            }
            const {x,y} = isometricToCanvas(this.isoX,this.isoY)
            const nextCoord = isometricToCanvas(this.isoX + this.dx,this.isoY+this.dy)
            const nx = nextCoord.x
            const ny = nextCoord.y
            const t = Math.max(0,Math.min(1,(Date.now() - this.startTime)/this.stepTime))
            const lerpX = this.state == 'moving' ? t*nx + (1-t)*x : x
            const lerpY = this.state == 'moving' ? t*ny + (1-t)*y : y 
            const jumpY = lerpY - 50 * (-t*t + t) 
            if (this.dx == 1){
                ctx.drawImage(this.imgSE, lerpX, jumpY)
            }else if (this.dx == -1){
                ctx.drawImage(this.imgNW, lerpX, jumpY)
            }else if (this.dy == 1){
                ctx.drawImage(this.imgSW, lerpX, jumpY)
            }else if (this.dy == -1){
                ctx.drawImage(this.imgNE, lerpX, jumpY)
            }else{
                console.warn('invalid dir', this.dx, this.dy)
            }

        }
    }


    // Computer Puzzle buttons 
    const buttons = createPuzzleButtons(gameState, {
        levels: levels,
        player: player,
        locations : [
            [700,600],[1088,603],[1388,707],[1416,505],
            [961,170],[1271,42],[753,28],[585,67]
        ]
    })



    gameState.objects = [
        new ImageObject(0, 0, Scene.CANVAS_WIDTH, Scene.CANVAS_HEIGHT, "linearPlanetBg"),
        player,
        new ImageObject(0, 0, Scene.CANVAS_WIDTH, Scene.CANVAS_HEIGHT, "linearPlanetFg"),
        experimentButton,
        shipButton,
        dialogueButton,
        ship
    ]
    gameState.objects = gameState.objects.concat(buttons)

}



export function linearPuzzle1 (gameState, {nextScenes}){
    const gss = gameState.stored
    const gridLeft = new Grid({
        canvasX:560, canvasY:430, canvasWidth:100, canvasHeight:100, 
        gridXMin:0, gridYMin:0, gridXMax:1, gridYMax:1, labels:false, arrows:false
    })

    const gridRight = new Grid({canvasX:900, canvasY:430, canvasWidth:100, canvasHeight:100,
        gridXMin:0, gridYMin:0, gridXMax:1, gridYMax:1, labels:false, arrows:false
    })
    
    const slider = new Slider({grid:gridRight, gridPos:0})

    const target = new Target({grid: gridLeft, gridX:1, gridY:1, size:20})
    const tracer = new IntegralTracer({grid: gridLeft, sliders: [slider], targets:[target]})
    const backButton = new Button({originX:50, originY: 50, width:100, height: 100,
        onclick: ()=>Scene.loadScene(gameState,"linearPlanet"), label:"↑"})
    
    unlockScenes(nextScenes, gss)
    // Objects and update
    gameState.objects = [gridLeft, gridRight, slider, target, tracer, backButton]
    gameState.update = () => {
        if (tracer.solved){
            gameState.stored.completedScenes[gameState.stored.sceneName] = 'complete'
        }
    }
    
}

export function linearPuzzle2 (gameState, {nextScenes}){
    const gss = gameState.stored
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
        new Target({grid: gridLeft, gridX:0, gridY:1, size:20}),
        new Target({grid: gridLeft, gridX:1, gridY:2, size:20})
    ]
    const tracer =  new IntegralTracer({grid: gridLeft, sliders: sliders, targets:targets})
    const backButton = new Button({originX:50, originY: 50, width:100, height: 100, 
        onclick: ()=>Scene.loadScene(gameState,"linearPlanet"), label:"↑"})
        
    gameState.objects = [gridLeft, gridRight, tracer, backButton].concat(sliders).concat(targets)
    gameState.update = () => {
        if (tracer.solved){
            gameState.stored.completedScenes[gameState.stored.sceneName] = 'complete'
        }
    }
    unlockScenes(nextScenes, gss)
}

/**
 * A 4x4 discrete level with given targets.
 * 
 * @param {*} gameState 
 * @param {*} targetVals The y-values of the targets
 * @param {*} tracerStart y-intercept where the tracer starts from
 * @param {number} targetSize The size of the targets and sliders
 */
export function simpleDiscLevel(gameState, {
    targetVals, tracerStart = 0,
    targetSize = 20, sliderSize = 15,
    exitTo = 'linearPlanet',
    nextScenes
}) {
    const gss = gameState.stored
    const backButton = new Button({originX:50, originY: 50, width:100, height: 100, onclick: ()=>Scene.loadScene(gameState,exitTo), label:"↑"})
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
    gameState.update = () => {
        if (tracer.solved){
            gameState.stored.completedScenes[gameState.stored.sceneName] = 'complete'
        }
    }
    unlockScenes(nextScenes, gss)
}

