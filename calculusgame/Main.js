/**
 * 
 *  The game state is:
 *    - the current scene number
 *    - the game objects in that scene
 *    - an update function
 *    - an object storing which levels have been solved
 *    - a flag that tells us to save data to local storage
 * 
 * 
 *  A scene is an object with:
 *    - objs: a list of game objects
 * 
 */

const build = "dev"
// = "dev" c key clears local storage, s key sets solved
// = "play" no console logs, no dev tools
// = ""
keysPressed = {}
function setup() {
    "use strict";

    var canvas = document.getElementById('myCanvas');

    const audioManager = new AudioManager();
    const audioPaths = ["click_001.mp3"];

    Promise.all(
        audioPaths.map(path => {
            const name = path.split(".")[0]; // e.g., "click_001"
            return audioManager.load(name, "audio/" + path);
        })
    ).then(() => {
        console.log("All audio loaded.");
    });

    var gameState = {
        objects: [], // The GameObjects in the current scene
        update: (() => { }), //
        //layout: { ind: 0, prec: 10 },
        stored: {}, // The part of the state that is saved. See initStoredState for object contents
        temp: {}, // Cleared on scene change.
    }

    function initStoredState(){
        var initCompletedLevels = []
        var initPuzzleMastery = []
        var initNumPuzzles = []
        var initCompletedTrials = []
        var initCompletedRule = []
        var initTrialSolutions = []
        for (let i = 0; i < PLANET_DATA.length; i++){
            initCompletedLevels.push({})
            initCompletedRule.push(false)
            initCompletedTrials.push(0)
            initPuzzleMastery.push(0)
            initNumPuzzles.push(0)
            for (let j = 0; j < PLANET_DATA[i].trials.length; j++){
                initTrialSolutions.push([])
            }
        }

        gameState.stored = {
            sceneName: "startMenu",
            landed:true, // true if the ship is on a planet, false if it is in space
            planetIndex:0,// The current planet in progress (if landed), or the planet just completed
            planetCompletedLevels: initCompletedLevels, // objects storing completed levels, like {"level1":true}, indexed by planet
            planetCompletedTrials: initCompletedTrials,
            planetCompletedRule: initCompletedRule,
            planetTrialSolutions: initTrialSolutions,
            totalDistance: 0, // the total distance the ship has traveled
            currentNavFunction: null, // the puzzle that the navigation is currently on
            strikes: 0, // the number of strikes (incorrect answers) at the navigation puzzle
            puzzleMastery: initPuzzleMastery, // list of mastery scores, indexed by puzzle type
            numPuzzles: initNumPuzzles, // number of attempted puzzles, indexed by puzzle type
            mathblocksUnlocked: [MathBlock.CONSTANT],// the MathBlocks currently available
        }
        
    }

    // Try to load stored data
    const storedState = localStorage.getItem('storedState')
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
                if (build != 'dev') {
                    gameState.temp.nextScene = gameState.stored.sceneName
                    gameState.stored.sceneName = 'startMenu' // always start at menu
                }
            }
        }catch (e){
            console.log('Unable to parse stored state')
            initStoredState()
        }
        
    }
    
    loadScene(gameState, gameState.stored.sceneName, false)

    // const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    // const desiredFreq = 440;
    // const sampleRate = audioCtx.sampleRate;
    // const samplesPerCycle = Math.round(sampleRate / desiredFreq);
    // const baseFreq = sampleRate / samplesPerCycle;

    // const buffer = audioCtx.createBuffer(1, samplesPerCycle, sampleRate);
    // const data = buffer.getChannelData(0);

    // for (let i = 0; i < samplesPerCycle; i++) {
    //   data[i] = 0.01*Math.sin((2 * Math.PI * i) / samplesPerCycle);
    // }

    // const source = audioCtx.createBufferSource();
    // source.buffer = buffer;
    // source.loop = true;
    // source.playbackRate.value = desiredFreq / baseFreq;

    // source.connect(audioCtx.destination);
    //source.start();


    // ----------------------------------------------------------------------------------------------
    // Mouse events
    // ----------------------------------------------------------------------------------------------

    // When the mouse is clicked, the (x,y) of the click is broadcast
    // to all GameObjects.
    canvas.addEventListener('mousedown', function (event) {
        new Audio('audio/click_001.mp3').play();
        var rect = canvas.getBoundingClientRect();
        const x = (event.clientX - rect.left) * (canvas.width / rect.width);
        const y = (event.clientY - rect.top) * (canvas.height / rect.height);
        canvas.style.cursor = 'default'
        Object.values(gameState.objects).forEach(obj => {
            if (typeof obj.mouseDown === 'function') {
                const cursor = obj.mouseDown(x, y)
                if (cursor != null) {
                    canvas.style.cursor = cursor
                }
            }
        })
        if (gameState.mouseDown) {
            gameState.mouseDown(x, y)
        }

    });

    canvas.addEventListener('mousemove', function (event) {
        var rect = canvas.getBoundingClientRect();
        const x = (event.clientX - rect.left) * (canvas.width / rect.width);
        const y = (event.clientY - rect.top) * (canvas.height / rect.height);
        canvas.style.cursor = 'default'
        Object.values(gameState.objects).forEach(obj => {
            if (typeof obj.mouseMove === 'function') {
                const cursor = obj.mouseMove(x, y)
                if (cursor != null) {
                    canvas.style.cursor = cursor
                }
            }
        })
    });

    canvas.addEventListener('mouseup', function (event) {
        var rect = canvas.getBoundingClientRect();
        const x = (event.clientX - rect.left) * (canvas.width / rect.width);
        const y = (event.clientY - rect.top) * (canvas.height / rect.height);
        canvas.style.cursor = 'default'
        Object.values(gameState.objects).forEach(obj => {
            if (typeof obj.mouseUp === 'function') {
                const cursor = obj.mouseUp(x, y)
                if (cursor != null) {
                    canvas.style.cursor = cursor
                }
            }
        })
    });


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
                    gameState.stored.planetCompletedLevels[gameState.stored.planetIndex][gameState.stored.sceneName] = true
                    break
                case 'r':
                    localStorage.setItem("startScene", gameState.sceneName)
                    break
                case '0':
                    gameState.stored.totalDistance = 0
                    break
                case 'ArrowRight':
                    gameState.stored.totalDistance++
                    break
                case 'ArrowLeft':
                    gameState.stored.totalDistance = Math.floor(gameState.stored.totalDistance) - 1
                    break
                case 'p':
                    gameState.stored.planetIndex = 0 
                    break
                case 'f':
                    gameState.stored.currentNavFunction = null 
                    break
            }
        }
    });


    // ----------------------------------------------------------------------------------------------
    // Main update loop
    // ----------------------------------------------------------------------------------------------
    let timer = 0
    function update() {

        // Save progress periodically
        timer++
        if (timer >= 200) {
            localStorage.setItem('storedState', JSON.stringify(gameState.stored));
            timer = 0
        }

        if (build == 'dev') {
            //console.log(gameState.stored.sceneName)
        }

        // 
        // if (currentSceneName != gameState.stored.sceneName || gameState.refresh) {
        //     currentSceneName = gameState.sceneName
        //     gameState.refresh = false
        //     loadScene(gameState)
        //     if (build == "layout") {
        //         gameState.layout.ind = 0
        //     }
        // }
        gameState.update()
        var ctx = canvas.getContext('2d');

        // Draw background
        Color.setColor(ctx, Color.black)
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        Color.setColor(ctx, new Color(10, 10, 10))
        ctx.lineWidth = 5
        ctx.strokeRect(0, 0, canvas.width, canvas.height);


        // Draw all GameObjects
        for (let i = 0; i < Object.values(gameState.objects).length; i++) {
            Object.values(gameState.objects)[i].draw(ctx, audioManager);
        }

        if (build == 'layout') {
            const layout_obj = gameState.objects[gameState.layout.ind]
            ctx.strokeStyle = 'rgb(255,0,0)'
            Shapes.Line(ctx, 0, layout_obj.originY, canvas.width, layout_obj.originY, 1)
            Shapes.Line(ctx, layout_obj.originX, 0, layout_obj.originX, canvas.height, 1)
        }

        window.requestAnimationFrame(update);
    }

    update();
}
window.onload = setup;




