import {Color, Shapes, AudioManager} from './util/index.js'
import {loadScene, PLANET_DATA} from './Scene.js'
import { MathBlock } from './GameObjects/MathBlock.js'

/** 
 * -------------------------------------------------------
 * Main.js
 * -------------------------------------------------------
 * Loads assets and stored data. Launches the game
 * and runs the update loop.
 * 
 * The gameState object keeps track of the current scene
 * and the player's progress. Any data that should be saved
 * between sessions goes in gameState.stored. The gameState.stored
 * object is saved to local storage. 
 * 
 *  A scene is an object with 
 *  - a list of game objects
 *  - an update function
 * 
 * 
 */

// Build "dev" c key clears local storage, s key sets solved
// "play" release version
const build = "dev"

var keysPressed = {}

// Setup - called on page load 
function setup() {
    console.log ('version 8-6-2025')
    // Game is drawn on this canvas
    var canvas = document.getElementById('myCanvas');

    // Load audio
    const audioManager = new AudioManager();
    const audioPaths = ["click_001.ogg", "click4.ogg", // slider
        "drop_002.ogg","confirmation_001.ogg",
         "glass_002.ogg", "switch1.ogg","switch9.ogg","switch6.ogg", "switch13.ogg", 'click_003.ogg', 'click2.ogg',
        'click3.ogg',
        'drop_003.ogg', 'drop_001.ogg', //target adder
        'error_008.ogg','bong_001.ogg', // dialogue
        'click_005.ogg', // footstep
    ];

    Promise.all(
        audioPaths.map(path => {
            const name = path.split(".")[0]; // e.g., "click_001"
            return audioManager.load(name, "audio/" + path)
        })
    ).then(() => {
        console.log("All audio loaded.")
    })

    // Mouse object
    const mouse = {
        x:0,
        y:0,
        down:false, // the mouse has just been pressed
        held:false, // the mouse is being pressed
        up: false,
        moved: false,
        cursor: 'default'
    }

    // Game state
    var gameState = {
        objects: [], // The GameObjects in the current scene
        update: (() => { }), // The update function for the scene
        stored: {}, // The part of the state that is saved. See initStoredState for object contents
    }

    function initStoredState(){
        gameState.stored = {
            sceneName: "startMenu", // the unique name of the current scene
            planet: 'Linear', // the current planet landed on, or the planet we just left
            landed:true, // true if the ship is on a planet, false if it is in space
            
            // Planet puzzles and experiments
            planetProgress: {}, // progress on each planet. {'PlanetName' : 'complete'} or 'in progress' or 'locked'
            completedScenes: {}, // completed puzzles, trials, and rules by scene name. {"level1":true}
            playerLocation: 'planetMap', // where the player is in the planet scene
            
            // Navigation
            nextPlanet: null,
            navDistance: 0, // the distance the trip has travelled during navigation
            currentNavFunction: null, // the puzzle that the navigation is currently on
            strikes: 0, // the number of strikes (incorrect answers) at the navigation puzzle
            navPuzzleMastery: {}, // list of mastery scores, indexed by puzzle type. {'linear1': 0.9}. null if puzzle not unlocked yet
            navPuzzleAttempts: {}, // number of attempted puzzles, indexed by puzzle type
            mathBlocksUnlocked: [{type:MathBlock.CONSTANT}],// the MathBlocks currently available, excluding variables
        }

        for (const planet in PLANET_DATA){
            gameState.stored.planetProgress[planet] = 'locked'
        }
        gameState.stored.planetProgress['Linear'] = 'in progress'        
    }

    // Try to load stored data
    const storedState = localStorage.getItem('storedState')
    var savedScene = null
    if (storedState == null){ // Local storage does not have stored data
        console.log('No stored data. Creating new save')
        initStoredState()
    }else{ // Try to parse stored data
        try {
            const parsed = JSON.parse(storedState);
            if (parsed == null){ // Data has parse error
                console.log('Stored state is null')
                initStoredState()
            }else { // Save data exists
                gameState.stored = parsed
                console.log("Loaded save")

                // TODO: Check that save data has the expected fields

                if (build != 'dev') {
                    savedScene = gameState.stored.sceneName
                    gameState.stored.sceneName = 'startMenu' // always start at menu
                }
            }
        }catch (e){
            console.log('Unable to parse stored state')
            initStoredState()
        }
        
    }
    
    loadScene(gameState, gameState.stored.sceneName, {'nextScene':savedScene})

    // ----------------------------- Mouse events -------------------------------------------------------
    canvas.addEventListener('mousedown', e => {
        e.preventDefault()
        mouse.held = true
        mouse.down = true
    });

    canvas.addEventListener('mouseup', e => {
        mouse.held = false
        mouse.up = true
    });

    canvas.addEventListener("dragstart", e => e.preventDefault());
    
    document.addEventListener('mousemove', e => {
        mouse.moved = true
        var rect = canvas.getBoundingClientRect();
        mouse.x = (e.clientX - rect.left) * (canvas.width / rect.width);
        mouse.y = (e.clientY - rect.top) * (canvas.height / rect.height);
    });

    document.addEventListener("mouseout", (event) => {
        mouse.held = false
        mouse.up = true
     })
    


    document.addEventListener('keyup', function (event) {
        keysPressed[event.key] = false
    });


    document.addEventListener('keydown', function (event) {
        if (!keysPressed[event.key] && gameState.keyPressed) {
            gameState.keyPressed(event.key)
        }
        keysPressed[event.key] = true
        if (build == "dev") {
            switch (event.key) {
                case 'c':
                    localStorage.clear()
                    break
                case 's':
                    gameState.stored.completedScenes[gameState.stored.sceneName] = 'complete'
                    break
                case '0':
                    gameState.stored.navDistance = 0
                    break
                case 'ArrowRight':
                    gameState.stored.navDistance += 100
                    break
                case 'ArrowLeft':
                    gameState.stored.navDistance = Math.floor(gameState.stored.totalDistance) - 1
                    break
                case 'f':
                    gameState.stored.currentNavFunction = null 
                    break
                case 'm':
                    console.log(Math.round(mouse.x) + ',' + Math.round(mouse.y))
                    break
                case 'q':
                    for (let planet in PLANET_DATA){
                        for (let level of PLANET_DATA[planet].puzzles)
                            gameState.stored.completedScenes[level] = 'complete'
                        
                        gameState.stored.planetProgress[planet] = 'complete'
                    }
                    break
            }
        }
    });


    // ------------------------------------- Main update loop --------------------------------------------------------
    let timer = 0
    function update() {

        // Save progress every 200 frames
        timer++
        if (timer >= 200) {
            localStorage.setItem('storedState', JSON.stringify(gameState.stored));
            timer = 0
        }

        gameState.update()

        var ctx = canvas.getContext('2d');

        // Draw background
        Color.setColor(ctx, Color.black)
        ctx.fillRect(0, 0, canvas.width, canvas.height);


        // Reset cursor before objects update
        mouse.cursor = 'default'

        // Draw all GameObjects
        for (let i = 0; i < gameState.objects.length; i++) {
            const obj = gameState.objects[i]
            if (!obj.hidden)
                obj.update(ctx, audioManager, mouse);
        }

        // Reset mouse state
        mouse.down = false
        mouse.up = false
        mouse.moved = false
        canvas.style.cursor = mouse.cursor

        window.requestAnimationFrame(update);
    }

    update();
}
window.onload = setup;




