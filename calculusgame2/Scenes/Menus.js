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
    

    var popUp = false
    const startButton = new Button({originX:200, originY:300, width:200, height:50, lineWidth:5,
        onclick:(() => {
            if (document.fullscreenElement){
                Scene.loadScene(gameState,nextScene)
            }else{
                popUp = true
            }
        }),
        label:"Start"
    })

    const clearButton = new Button({originX:200, originY:460, width:200, height:50, lineWidth: 5,
        onclick:(() => { 
            localStorage.clear();
            gameState.stored = null;
            location.reload();
        }), label:"Clear Save"})
    clearButton.hidden = true

    if (nextScene == null){
        nextScene = 'linear'
    } else {
        clearButton.hidden = false
        startButton.label = "Continue"
    }
    
    const about_button = new Button({originX:200, originY:380, width:200, height:50, lineWidth: 5,
        onclick:(() => window.location.replace("about.html")), label:"About"})

    
    
    
    // Fullscreen request popup
    
    const confirmButton = new Button({originX:650, originY: 400, width:300, height: 50,
        onclick: ()=>{
            document.documentElement.requestFullscreen()
            Scene.loadScene(gameState,nextScene)
        },
        label:"Go fullscreen"})
    const cancelButton = new Button({originX:625, originY: 500, width:350, height: 50,
        onclick: () => Scene.loadScene(gameState,nextScene),
        label:"Continue in window"}) 
    
    const popUpBox = {
        update: function(ctx, audio, mouse){
            Color.setColor(ctx, Color.darkBlack)
            Shapes.Rectangle({ctx:ctx, originX: 500, originY:200, width: 600, height:400,inset:true, shadow:8})
            Color.setColor(ctx, Color.white)
            ctx.font = "40px monospace"
            ctx.textBaseline = 'alphabetic'
            ctx.textAlign = 'center'
            ctx.fillText(`Playing in fullscreen`,800,300)
            ctx.fillText(`is recommended.`,800,350)
        } 
    }


    const baseObjs = [
        new ImageObject({originX:0, originY:0, width:Scene.CANVAS_WIDTH, height:Scene.CANVAS_HEIGHT, id:"menuImg"}),
        //new ImageObject(0, 0, Scene.CANVAS_WIDTH, Scene.CANVAS_HEIGHT, "linearPlanetFg"),
        new TextBox({originX:200, originY:150, content: "Calculus I", font : "60px monospace", color : Color.white}),
        new TextBox({originX:200, originY:200, content: "A puzzle game", font : "30px monospace", color : Color.white}),
        startButton, about_button, clearButton
    ]

    gameState.update = () => {
        gameState.objects = baseObjs
        if (popUp){
            gameState.objects = baseObjs.concat([popUpBox, confirmButton, cancelButton])
        }
    }
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
        onclick: ()=>Scene.loadScene(gameState,gss.planet), label:"↑"})

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
        if (gss.planet == planet){
            Scene.loadScene(gameState, planet)
            return
        }
        // Teleport if planet has been visited 
        if (gss.planetProgress[planet] == 'visited' || gss.planetProgress[planet] == 'complete'){
            Scene.loadScene(gameState, planet)
            return
        }
        gss.navDistance = 0
        gss.nextPlanet = planet
        popUp = true
    }
    // Planet Buttons
    const planetPositions = {
        'linear':[100,400],
        'quadratic':[300,500],
        'cubic':[400,200],
        'exponential':[600,300],
        'sine':[600,600],
        'power':[800,400],
        'sum':[1000,400],
        'product':[1200,400],
        'chain':[1400,400]
    }
    
    const planetButtons = {}
    for (let planet in planetPositions){
        planetButtons[planet] = new Button( {
            originX: planetPositions[planet][0], originY: planetPositions[planet][1],
            width: planet.length*15+30, height:50,
            onclick: () => {travelTo(planet)},
            label: planet.charAt(0).toUpperCase() + planet.slice(1),
        })

        switch (gss.planetProgress[planet]){
            case 'complete':
                planetButtons[planet].color = Color.blue
                break
            case 'visited':
            case 'unvisited':
                break
            case 'locked':
                planetButtons[planet].active = false
                break
            default:
                planetButtons[planet].hidden = true
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