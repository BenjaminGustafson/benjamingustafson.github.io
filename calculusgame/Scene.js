import * as GameObjects from './GameObjects/index.js'
import {Shapes, Color} from './util/index.js'
import * as Menus from './Scenes/Menus.js'
import * as Scenes from './Scenes/index.js'
import * as Linear from './Scenes/Linear.js'
import * as Quadratic from './Scenes/Quadratic.js'
import * as Exponential from './Scenes/Exponential.js'
import * as Navigation from './Scenes/Navigation.js'


export const CANVAS_WIDTH = 1600
export const CANVAS_HEIGHT = 900
export const PLANETS = ['linear', 'quadratic']

export function loadSceneWithTransition(gameState, sceneName, {x = 800, y=450, out=false}, message = {}){
    const transitionTime = 1000
    const startTime = Date.now() 
    gameState.objects.forEach(o => o.noInput = true)

    const mask = {
        startTime: Date.now(),
        loaded: false,
        update: function(ctx) {
            const time = (Date.now() - startTime)/transitionTime
            var t = time
            // if (time >= 2){
            //     this.hidden = true
            //     return
            // }else
            if (time >= 1){
                if (!this.loaded){
                    loadScene(gameState, sceneName, message)
                    //gameState.objects.push(mask)
                    // this.loaded = true
                    // x = 800
                    // y = 450
                }
                //t = Math.max(0,Math.min(1,2-time))
            }
            ctx.save()
            ctx.beginPath()
            ctx.rect(0, 0, ctx.canvas.width, ctx.canvas.height)
            //t = t * t * t * (t * (6 * t - 15) + 10)
            t = 2 / ((t-1) * (t-1) * (t-1) * (t-1) + 1) - 1
            ctx.arc(x, y, 1600*(1-t), 0, Math.PI * 2)
            Color.setFill(ctx, Color.black)
            ctx.fill('evenodd')
            ctx.restore()
        }
    }

    gameState.objects.push(mask)
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
    console.log('scene', sceneName, gameState.stored)
    gameState.stored.prevScene = gameState.stored.sceneName
    gameState.stored.sceneName = sceneName

    gameState.update = () => { }

    const sceneNameSplit = sceneName.toLowerCase().split('.')

    switch (sceneNameSplit[0]) {
        //------------------------------------------------------------
        // Menus (see Menus.js)
        //------------------------------------------------------------
        default:
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
        case "quadratic": Quadratic.loadScene(gameState, sceneName, message)
            break
        case "exponential": Exponential.loadScene(gameState, sceneName, message)
            break
        case "sine": Exponential.loadScene(gameState, sceneName, message)
            break
        case "power": Exponential.loadScene(gameState, sceneName, message)
            break
        case "sum": Exponential.loadScene(gameState, sceneName, message)
            break
        case "product": Exponential.loadScene(gameState, sceneName, message)
            break
        case "chain": Exponential.loadScene(gameState, sceneName, message)
            break
    }
}


