import * as GameObjects from './GameObjects/index.js'
import {Shapes, Color} from './util/index.js'
import * as Menus from './Scenes/Menus.js'
import * as Linear from './Scenes/Linear.js'
import * as Quadratic from './Scenes/Quadratic.js'
import * as Planet from './Scenes/Planet.js'
import * as Experiment from './Scenes/Experiment.js'
import * as Navigation from './Scenes/Navigation.js'


export const CANVAS_WIDTH = 1600
export const CANVAS_HEIGHT = 900
export const PLANETS = ['linear', 'quadratic']

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
            Quadratic.loadScene(gameState, sceneName)
            break
        }
    }
}


