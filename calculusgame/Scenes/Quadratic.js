import {Color, Shapes} from '../util/index.js'
import {TileMap, Grid, FunctionTracer, Button, ImageObject, IntegralTracer, MathBlock, MathBlockManager, MathBlockField, Slider, Target, TargetAdder, TextBox, DialogueBox} from '../GameObjects/index.js'
import * as Scene from '../Scene.js'
import { GameObject } from '../GameObjects/GameObject.js'
import { unlockScenes, planetScene, dialogueScene } from './Planet.js'
import * as Experiment from './Experiment.js'

const tileMap = new TileMap({yTileOffset:-3,xTileOffset:-7, xImgOffset:0, yImgOffset:0})

// [x,y,  dx,dy] where dx dy is the direction to face when stopped at node
// SW 0,1 NW -1,0 NE 0,-1 SE 1,0
const nodes = {
    'planetMap': [14,8,  0,1],
    'quadratic.puzzle.1': [13,8,  0,-1],
    'quadratic.puzzle.2': [11,8, 0,-1],
    'quadratic.puzzle.3': [7,1, -1,0],
    'quadratic.puzzle.4': [7,-2, -1,0],
    'quadratic.puzzle.5': [10,-3, 0,-1],
    'quadratic.puzzle.6': [13,1, -1,0],
    'quadratic.puzzle.7': [16,3, 0,-1],
    'quadratic.puzzle.8': [18,4, 0,-1],
    'quadratic.puzzle.9': [22,0, -1,0],
    'quadratic.puzzle.10': [17,-4, -1,0],
    'quadratic.lab': [14,-6, 0,-1],
}

const paths = 
[
    {start: 'planetMap', end: 'quadratic.puzzle.1'},
    {start: 'quadratic.puzzle.1', end: 'quadratic.puzzle.2', steps: [] },
    {start: 'quadratic.puzzle.2', end: 'quadratic.puzzle.3', steps: [[10,8],[10,7],[9,7],[9,2],[7,2]] },
    {start: 'quadratic.puzzle.3', end: 'quadratic.puzzle.4', steps: [] },
    {start: 'quadratic.puzzle.4', end:  'quadratic.puzzle.5', steps: [[7,-3]] },
    {start: 'quadratic.puzzle.5', end: 'quadratic.puzzle.6', steps: [[12,-3],[12,-1],[13,-1]] },
    {start: 'quadratic.puzzle.6', end: 'quadratic.puzzle.7', steps: [[13,3],[14,3],[14,4],[16,4]] },
    {start: 'quadratic.puzzle.7', end: 'quadratic.puzzle.8', steps: [[17,3],[17,4]] },
    {start: 'quadratic.puzzle.8', end: 'quadratic.puzzle.9', steps: [[22,4]] },
    {start: 'quadratic.puzzle.9', end: 'quadratic.puzzle.10', steps: [[22,-2],[21,-2],[21,-3],[17,-3]] },
    {start: 'quadratic.puzzle.10', end: 'quadratic.lab', steps: [[17,-5],[16,-5],[16,-6]]},
]


const experimentData =  {
    '1':{
        solutionFun: x=>0.5*x,
        solutionDdx:x=>0.5,
        solutionFunString:"0.5t",
        solutionDdxString:"0.5",
        syFunMax: 2, syFunLen: 4, tyFunMax: 10, tyFunLen: 10,
        syDdxMax: 2,
        syDdxLen: 4,
        tyDdxMax: 2,
        tyDdxLen: 4,
        numMeasurement:5,
        ddxSliderSpacing:2,
    },
    '2': {
        solutionFun: x=>5-0.5*x,
        solutionDdx: x=>-0.5,
        solutionFunString:"-0.5t + 5",
        solutionDdxString:"-0.5",
        syFunMax: 2, syFunLen: 4, tyFunMax: 10, tyFunLen: 10,
        syDdxMax: 2,
        syDdxLen: 4,
        tyDdxMax: 2,
        tyDdxLen: 4,
        numMeasurement:5,
        ddxSliderSpacing:2,
    },
    '3':{
        solutionFun: x=>1+1.5*x,
        solutionDdx: x=>-0.5,
        solutionFunString:"1.5t + 1",
        solutionDdxString:"1.5",
        syFunMax: 2, syFunLen: 4, tyFunMax: 10, tyFunLen: 10,
        syDdxMax: 2,
        syDdxLen: 4,
        tyDdxMax: 2,
        tyDdxLen: 4,
        numMeasurement:4,
        ddxSliderSpacing:2,
    },
    '4':{
        solutionFun: x=>2*x,
        solutionDdx: x=>2,
        solutionFunString:"2 t",
        solutionDdxString:"2",
        syFunMax: 2, syFunLen: 4, tyFunMax: 10, tyFunLen: 10,
        syDdxMax: 2,
        syDdxLen: 4,
        tyDdxMax: 2,
        tyDdxLen: 4,
        numMeasurement:5,
        ddxSliderSpacing:1,
    },
    '5':{
        solutionFun: x=>10-x,
        solutionDdx: x=>-1,
        solutionFunString:"-1t + 10",
        solutionDdxString:"-1",
        syFunMax: 2, syFunLen: 4, tyFunMax: 10, tyFunLen: 10,
        syDdxMax: 2,
        syDdxLen: 4,
        tyDdxMax: 2,
        tyDdxLen: 4,
        numMeasurement:5,
        ddxSliderSpacing:2,
    }
}

export function loadScene(gameState, sceneName, message = {}){
    gameState.stored.planet = 'quadratic'

    const sceneNameSplit = sceneName.toLowerCase().split('.')

    // Main scene
    if (sceneNameSplit.length == 1) {
        quadraticPlanet(gameState, message)
        return
    }

    // Sub-scenes
    switch(sceneNameSplit[1]){
        case "puzzle": 
            switch(sceneNameSplit[2]){
                case '1':
                    quadraticPuzzle1(gameState, {nextScenes:["quadratic.puzzle.2"]})
                    break
                case '2':
                    quadraticPuzzle2(gameState,  {nextScenes:["quadratic.puzzle.3"]})
                    break
                case '3':
                    simpleDiscLevel(gameState, {targetVals:[0, 1, 1, 2],  nextScenes:["quadratic.puzzle.4"]})
                    break
                case '4':
                    simpleDiscLevel(gameState, {targetVals:[1, 0, -1, 0], nextScenes:["quadratic.dialogue.1"]})
                    break
                case '5':
                    simpleDiscLevel(gameState, {targetVals:[0.5, 1, 0.5, 1.5], nextScenes:["quadratic.puzzle.6"]})
                    break
                case '6':
                    simpleDiscLevel(gameState, {targetVals:[2, 1.5, -0.5, -2], nextScenes:["quadratic.puzzle.7"]})
                    break
                case '7':
                    simpleDiscLevel(gameState, {targetVals:[1, 0.5, -0.1, -0.8, -0.4, 0.6, 0.2, 0.4], nextScenes:["quadratic.puzzle.8"]})
                    break
                case '8':
                    simpleDiscLevel(gameState, {targetVals:[0.25, 0.5, 0.75, 1, 1.25, 1, 0.75, 0.5,
                        0.25, 0, 0.5, 1, 0.5, 0, 0.5, 1],  targetSize:15,  sliderSize:12, nextScenes:["quadratic.lab"]})
                    break
            }
        break

        case 'dialogue':
            quadraticPlanet(gameState)
            switch(sceneNameSplit[2]){
                case '1':
                    dialogueScene(gameState, {exitTo:"quadratic", nextScenes:["quadratic.puzzle.5"], text: [    
                        "⯘Ⳃⱙⰺⳡ ⰺⳝ⯨⯃⯎ ⱤⳆⰸ⯃ ⳙ⯹ⱡ ⯷ⳞⳤⱭⰶ.",
                        "ⳏⳐⰷ⯁Ⱨⰴ ⯢ⱋⳒⰳⳙ ⯚⯜⯍ ⳙⰿⱆ ⳨⯟ⳑ⳪⳰ ⰴⱢⳈⳡ ⱍ⳧Ⳑⰿ.",
                        "ⳟ⯔ ⳓ⯥ⱄⰳ ⳉⳂⳙ⯎ ⱤⳆⰸ⯃ Ɀⰳⱅⰸⳝ ⯢ⳔⳂⳚ ⱇⱏⰴⳂ ⰳⳤⱑ⯅ⰴ!"
                    ]})
                break
            }
            break

        case "lab":
            Experiment.experimentMenu(gameState, {experimentData: experimentData})
            break
        
        case "trial":
            if (sceneNameSplit[2] == 'rule') {
                Experiment.ruleGuess(gameState, {})
            } else {
                Experiment.experimentTrial(gameState, experimentData[sceneNameSplit[2]])
            } 
            break
    }
}

function quadraticPlanet(gameState,message){
    planetScene(gameState, {
        planetName:'quadratic',
        shipX:20, shipY: 450,
        labX: 1150, labY:-150, labDir:'SW',
        tileMap:tileMap,
        playerNodes:nodes,
        playerPaths:paths,
        bgImg: 'riverPlanetBg',
        fgImg: 'riverPlanetFg',
        message
    })
}

function placeHolderLevel(gameState){

}
