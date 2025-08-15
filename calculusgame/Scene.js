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

export function loadSceneWithTransition(gameState, sceneName, transition, message = {}){
    const transitionTime = 1000
    const startTime = Date.now() 
    gameState.objects.forEach(o => o.noInput = true)
    
    const mask = {
        x: transition.x,
        y: transition.y,
        t:0,
        update: function(ctx) {
            ctx.save()
            ctx.beginPath()
            ctx.rect(0, 0, ctx.canvas.width, ctx.canvas.height)
            var t = Math.max(0,Math.min(1,this.t)) 
            //t = t * t * t * (t * (6 * t - 15) + 10)
            t = 2 / ((t-1) * (t-1) * (t-1) * (t-1) + 1) - 1
            ctx.arc(this.x, this.y, 1600*(1-t), 0, Math.PI * 2)
            Color.setFill(ctx, Color.black)
            ctx.fill('evenodd')
            ctx.restore()
        }
    }

    gameState.objects.push(mask)

    gameState.update = () => {        
        const elapsed = Date.now() - startTime
        mask.t = elapsed/transitionTime
        if (elapsed > transitionTime){
            loadScene(gameState, sceneName, message)
        }
    }
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
        case 'linear': Linear.loadScene(gameState, sceneName, message)
            break

        // Quadratic Planet
        case "quadratic": {
            Quadratic.loadScene(gameState, sceneName)
            break
        }
    }
}


