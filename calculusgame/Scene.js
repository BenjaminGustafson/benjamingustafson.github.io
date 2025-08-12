import * as GameObjects from './GameObjects/index.js'
import {Shapes, Color} from './util/index.js'
import * as Menus from './Scenes/Menus.js'
import * as Linear from './Scenes/Linear.js'
import * as Planet from './Scenes/Planet.js'
import * as Experiment from './Scenes/Experiment.js'
import * as Navigation from './Scenes/Navigation.js'


export const CANVAS_WIDTH = 1600
export const CANVAS_HEIGHT = 900
export const PLANETS = ['Linear', 'Quadratic']

/**
 * 
 * The main function for serving up scenes.
 * 
 * The comments above each level describe the intended 
 * things that the level should teach.
 * 
 */
export function loadScene(gameState, sceneName, message = {}) {
    console.log('scene', sceneName)
    gameState.stored.prevScene = gameState.stored.sceneName
    gameState.stored.sceneName = sceneName

    gameState.update = () => { }

    const sceneNameSplit = sceneName.toLowerCase().split('.')

    switch (sceneNameSplit[0]) {
        default:
        //------------------------------------------------------------
        // Menus (see Menus.js)
        //------------------------------------------------------------
        case "startmenu": Menus.startMenu(gameState, message['nextScene'])
        break

        case "planetmap": Menus.planetMap(gameState)
        break

        case "navigation": Navigation.navScene(gameState, 'ship')
        break

        // Linear Planet (see Linear.js)
        case 'linear': Linear.loadScene(gameState, sceneName)
            break

        // Quadratic Planet
        case "quadratic": {
            
            break
        }
    }
}


/**
 * 
 * puzzleMastery is the exponential moving average of the .
 * It is a score from 0 to 1.
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
