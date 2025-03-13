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
 *    - winCon: a function that checks whether the level is solved
 * 
 */

const build = "dev" 
// = "dev" c key clears local storage
// = "layout" wasd keys moves gameobjects, qe to cycle objs, 12345 changes layout precision
// = "play" no console logs, no dev tools
// = ""

function setup() { "use strict";

  var canvas = document.getElementById('myCanvas');

  var current_sceneName = "mainMenu"
  var gameState = {
    sceneName: current_sceneName,
    objects: [],
    update: (()=>{}),
    completedLevels : {},
    writeToStorage: false,
    layout : {ind: 0, prec: 10},
  }

  Object.keys(localStorage).forEach(key => {
    gameState.completedLevels[key] = true
  })
  
  loadScene(gameState)


  // ----------------------------------------------------------------------------------------------
  // Mouse events
  // ----------------------------------------------------------------------------------------------

  // When the mouse is clicked, the (x,y) of the click is broadcast
  // to all objects.
  canvas.addEventListener('mousedown', function (event) {
    var rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left)*(canvas.width/rect.width);
    const y = (event.clientY - rect.top)*(canvas.height/rect.height);
    canvas.style.cursor = 'default'
    Object.values(gameState.objects).forEach(obj => {
        if (typeof obj.mouseDown === 'function'){
            const cursor = obj.mouseDown(x,y)
            if (cursor != null){
                canvas.style.cursor = cursor
            }
        }
    })

    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const desiredFreq = 440;
        const sampleRate = audioCtx.sampleRate;
        const samplesPerCycle = Math.round(sampleRate / desiredFreq);
        const baseFreq = sampleRate / samplesPerCycle;

        const buffer = audioCtx.createBuffer(1, samplesPerCycle, sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < samplesPerCycle; i++) {
          data[i] = 0.01*Math.sin((2 * Math.PI * i) / samplesPerCycle);
        }

        const source = audioCtx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        source.playbackRate.value = desiredFreq / baseFreq;

        source.connect(audioCtx.destination);
        //source.start();
  });

  canvas.addEventListener('mousemove', function (event) {
    var rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left)*(canvas.width/rect.width);
    const y = (event.clientY - rect.top)*(canvas.height/rect.height);
    canvas.style.cursor = 'default'
    Object.values(gameState.objects).forEach(obj => {
        if (typeof obj.mouseMove === 'function'){
            const cursor = obj.mouseMove(x,y)
            if (cursor != null){
                canvas.style.cursor = cursor
            }
        }
    })
  });

  canvas.addEventListener('mouseup', function (event) {
    var rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left)*(canvas.width/rect.width);
    const y = (event.clientY - rect.top)*(canvas.height/rect.height);
    canvas.style.cursor = 'default'
    Object.values(gameState.objects).forEach(obj => {
        if (typeof obj.mouseUp === 'function'){
            const cursor = obj.mouseUp(x,y)
            if (cursor != null){
                canvas.style.cursor = cursor
            }
        }
    })
  });

  document.addEventListener('keydown', function(event) {
    if (build == "dev"){
      if (event.key == 'c'){
        localStorage.clear()
        gameState.completedLevels = {}
      }
    }

    if (build == "layout"){
      const obj = gameState.objects[gameState.layout.ind]
      switch (event.key){
        case 'w':
          obj.origin_y -= gameState.layout.prec
          break
        case 'a':
          obj.origin_x -= gameState.layout.prec
          break
        case 's':
          obj.origin_y += gameState.layout.prec
          break
        case 'd':
          obj.origin_x += gameState.layout.prec
          
          break
        case 'e':
          gameState.layout.ind = (gameState.layout.ind + 1) % gameState.objects.length
          break
        case 'q':
          gameState.layout.ind = (gameState.objects.length + gameState.layout.ind - 1) % gameState.objects.length
          break
        case '1':
          gameState.layout.prec = 1
          break
        case '2':
          gameState.layout.prec = 10
          break
        case '3':
          gameState.layout.prec = 100
          break
        case '4':
          gameState.layout.prec = 25
          break
        case '5':
          gameState.layout.prec = 5
          break
        case 'p':
          console.log(obj.origin_x + "," +obj.origin_y)
          break
      }
    }
  });

  // ----------------------------------------------------------------------------------------------
  // The main update loop
  // ----------------------------------------------------------------------------------------------
  function update() {
    if (build == 'dev'){console.log(gameState.sceneName)}
    if (current_sceneName != gameState.sceneName){
      current_sceneName = gameState.sceneName
      loadScene(gameState)
      if (build == "layout"){
        gameState.layout.ind = 0
      }
    }
    gameState.update()
    var ctx = canvas.getContext('2d');

    // Flag writeToStorage tells us to save the completedLevels
    if (gameState.writeToStorage){
      Object.keys(gameState.completedLevels).forEach(key => {
        localStorage.setItem(key, "solved")
      })
      gameState.writeToStorage = false
    }

    //Background
    Color.setColor(ctx,Color.black)
    ctx.fillRect(0,0,canvas.width,canvas.height);
    Color.setColor(ctx,new Color(10,10,10))
    ctx.strokeRect(0,0,canvas.width,canvas.height);


    for (let i = 0; i < Object.values(gameState.objects).length; i++){
      Object.values(gameState.objects)[i].draw(ctx);
    }

    if (build == 'layout'){
      const layout_obj = gameState.objects[gameState.layout.ind]
      ctx.strokeStyle = 'rgb(255,0,0)'
      Shapes.Line(ctx, 0, layout_obj.origin_y, canvas.width, layout_obj.origin_y, 1)
      Shapes.Line(ctx, layout_obj.origin_x, 0, layout_obj.origin_x, canvas.height, 1)
    }

    window.requestAnimationFrame(update); 
  }

  update();
}
window.onload = setup;




