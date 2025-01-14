/**
 * 
 *  The game state is:
 *    - the current scene number
 *    - the game objects in that scene
 * 
 *  All game objects must:
 *    - have a draw(ctx) method
 *    - have a mouseMove(x,y) method that checks if the mouse is over the object and
 *      returns the grab priority of that object, or -1 if the mouse is not over the object
 *    - have a method grab(x,y) that is called if the grab is successful
 *    - have a release(x,y) method that is called when the 
 *      object is grabbed and then released.
 * 
 *  A scene is an object with:
 *    - objs: a list of game objects
 *    - winCon: a function that checks whether the level is solved
 * 
 */


function setup() { "use strict";

  var canvas = document.getElementById('myCanvas');

  var current_sceneName = "mainMenu"
  var gameState = {
    sceneName: current_sceneName,
    objects: [],
    update: (()=>{}),
    completedLevels : {},
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
    if (event.key === 'c') {
      localStorage.clear()
      gameState.completedLevels = {}
    }
  });

  // ----------------------------------------------------------------------------------------------
  // The main update loop
  // ----------------------------------------------------------------------------------------------
  function update() {
    console.log(gameState.sceneName)
    if (current_sceneName != gameState.sceneName){
      console.log("loading")
      current_sceneName = gameState.sceneName
      loadScene(gameState)
    }
    gameState.update()
    var ctx = canvas.getContext('2d');

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


    window.requestAnimationFrame(update); 
  }

  var ctx = canvas.getContext('2d');
  ctx.font = "40px monospace";
  const tokens = ["x","f","+","•","sin","e","-"]
  for (let i = 0 ; i < tokens.length; i ++){
      console.log(tokens[i], ctx.measureText(tokens[i]).width)
  }


  update();
  console.log(Object.values(gameState.objects))
}
window.onload = setup;




