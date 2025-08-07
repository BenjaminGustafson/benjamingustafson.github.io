import {Color, Shapes} from '../util/index.js'
import {Grid, FunctionTracer, Button, ImageObject, IntegralTracer, MathBlock, MathBlockManager, MathBlockField, Slider, Target, TargetAdder, TextBox} from '../GameObjects/index.js'
import * as Scene from '../Scene.js'

/**
 * ----------------------------------------------------------------
 * SCENE FUNCTION
 * ----------------------------------------------------------------
 * startMenu - the title screen of the game
 * ----------------------------------------------------------------
 * 
 * Additional parameters:
 * @param nextScene - the scene name of the saved scene to continue from
 */
export function startMenu(gameState, nextScene){
    const startButton = new Button({originX:200, originY:300, width:200, height:50, lineWidth:5,
        onclick:(() => Scene.loadScene(gameState,"linearPlanet")), label:"Start"})

    if (nextScene != null && nextScene != "startMenu"){
        startButton.onclick = (() => Scene.loadScene(gameState,nextScene))
        startButton.label = "Continue"
    }
    const about_button = new Button({originX:200, originY:380, width:200, height:50, lineWidth: 5,
        onclick:(() => window.location.replace("about.html")), label:"About"})
    gameState.objects = [
        new ImageObject(0, 0, Scene.CANVAS_WIDTH, Scene.CANVAS_HEIGHT, "linear_img"),
        new TextBox({originX:200, originY:150, content: "Calculus I", font : "60px monospace", color : Color.black}),
        new TextBox({originX:200, originY:200, content: "A puzzle game", font : "30px monospace", color : Color.black}),
        startButton, about_button
    ]
}


/**
 * ----------------------------------------------------------------
 * SCENE FUNCTION
 * ----------------------------------------------------------------
 * planetMap - menu for travel between planets
 * ----------------------------------------------------------------
 *  
 * 
 * TODO: 
 * - Planet icons, invisible buttons
 * - Current planet indication
 * - Planet puzzle progress, locked symbol
 * - Map decoration - orbits, stars
 */
export function planetMap (gameState){
    const gss = gameState.stored

    const backButton =  new Button({originX:50, originY: 50, width:100, height: 100,
        onclick: ()=>Scene.loadScene(gameState,Scene.PLANET_DATA[gameState.stored.planet].scene), label:"↑"})

    // Confirmation popup
    var popUp = false
    const confirmButton = new Button({originX:650, originY: 400, width:100, height: 50,
        onclick: ()=>Scene.loadScene(gameState,'navigation'), label:"Travel"})
    const cancelButton = new Button({originX:850, originY: 400, width:100, height: 50,
        onclick: () => popUp = false, label:"Cancel"}) 
    
    const confirmNav = {
        update: function(ctx, audio, mouse){
            Color.setColor(ctx, Color.darkBlack)
            Shapes.Rectangle({ctx:ctx, originX: 500, originY:200, width: 600, height:400,inset:true, shadow:8})
            Color.setColor(ctx, Color.white)
            ctx.font = "40px monospace"
            ctx.textBaseline = 'alphabetic'
            ctx.textAlign = 'center'
            ctx.fillText(`Travel to ${gameState.stored.nextPlanet}?`,800,300)
        } 
    }

    function travelTo(planet){
        // Do not travel if already at planet
        if (gameState.stored.planet == planet){
            Scene.loadScene(gameState, Scene.PLANET_DATA[planet].scene)
        }
        gss.nextPlanet = planet
        popUp = true
    }
    // Planet Buttons
    const planetButtons = {
        'Linear': new Button( {originX: 100, originY: 400, width: 200, height:50,
            onclick: () => {travelTo('Linear')}, label:'Linear'}),
        'Quadratic': new Button({originX: 400, originY: 400, width: 200, height:50,
            onclick: () => {travelTo('Quadratic')}, label:'Quadratic'})
    }



    for (const planet in planetButtons){
        switch (gss.planetProgress[planet]){
            case 'complete':
                planetButtons[planet].color = Color.blue
                break
            case 'in progress':
                break
            default:
            case 'locked':
                planetButtons[planet].active = false
                break
        } 
    }

    // Set objects and update
    const baseObjs = [backButton].concat(Object.values(planetButtons))
    gameState.update = () => {
        gameState.objects = baseObjs
        if (popUp){
            gameState.objects = baseObjs.concat([confirmNav, confirmButton, cancelButton])
        }
    }
}