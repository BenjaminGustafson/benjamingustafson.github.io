class OverworldMap {
  constructor(config) {
    this.overworld = null;
    this.gameObjects = config.gameObjects;
    this.cutsceneSpaces = config.cutsceneSpaces || {};
    this.walls = this.getWalls(config.controls) || {};

    this.lowerImage = new Image();
    this.lowerImage.src = config.lowerSrc;

    this.upperImage = new Image();
    this.upperImage.src = config.upperSrc;

    this.isCutscenePlaying = false;
  }

  getWalls(controls){
    const width = 16
    const height = 16
    var walls = {}
    for (let y = 0; y < height; y++)
        for (let x = 0; x < width; x++)
            if(controls[y*width+x] === 0)
                walls[`${x},${y}`] = true
    return walls
}

  drawLowerImage(ctx, cameraPerson) {
    ctx.drawImage(
      this.lowerImage, 
      16*10.5 - cameraPerson.drawX,
      16*6 - cameraPerson.drawY
      )
  }

  drawUpperImage(ctx, cameraPerson) {
    ctx.drawImage(
      this.upperImage, 
      16*10.5 - cameraPerson.drawX,
      16*6 - cameraPerson.drawY
    )
  } 

  isSpaceTaken(currentX, currentY, direction) {
    const {x,y} = utils.nextPosition(currentX, currentY, direction);
    return this.walls[`${x},${y}`] || false;
  }

  mountObjects() {
    Object.keys(this.gameObjects).forEach(key => {

      let object = this.gameObjects[key];
      object.id = key;

      //TODO: determine if this object should actually mount
      object.mount(this);

    })
  }

  async startCutscene(events) {
    this.isCutscenePlaying = true;

    for (let i=0; i<events.length; i++) {
      const eventHandler = new OverworldEvent({
        event: events[i],
        map: this,
      })
      await eventHandler.init();
    }

    this.isCutscenePlaying = false;

    //Reset NPCs to do their idle behavior
    Object.values(this.gameObjects).forEach(object => object.doBehaviorEvent(this))
  }

  checkForActionCutscene() {
    const hero = this.gameObjects["hero"];
    const nextCoords = utils.nextPosition(hero.gridX, hero.gridY, hero.direction);
    const match = Object.values(this.gameObjects).find(object => {
      return `${object.gridX},${object.gridY}` === `${nextCoords.x},${nextCoords.y}`
    });
    if (!this.isCutscenePlaying && match && match.talking.length) {
      this.startCutscene(match.talking[0].events)
    }
  }

  checkForFootstepCutscene() {
    const hero = this.gameObjects["hero"];
    const heroCoords = `${hero.gridX},${hero.gridY}`
    const match = Object.values(this.gameObjects).find(object => {
      const nextCoords1 = utils.nextPosition(object.gridX, object.gridY, object.direction)
      const nextCoords2 = utils.nextPosition(nextCoords1.x, nextCoords1.y, object.direction)
      return `${nextCoords1.x},${nextCoords1.y}` ===  heroCoords || `${nextCoords2.x},${nextCoords2.y}` ===  heroCoords
    });
    if (!this.isCutscenePlaying && match && match.talking.length) {
      this.startCutscene(match.talking[0].events)
    }
    /*
    const hero = this.gameObjects["hero"];
    const match = this.cutsceneSpaces[ `${hero.gridX},${hero.gridY}` ];
    if (!this.isCutscenePlaying && match) {
      this.startCutscene( match[0].events )
    }*/
  }

  addWall(x,y) {
    this.walls[`${x},${y}`] = true
  }

  removeWall(x,y) {
    delete this.walls[`${x},${y}`]
  }

  moveWall(oldX,oldY,direction) {
    this.removeWall(oldX,oldY)
    const {x, y} = utils.nextPosition(oldX,oldY,direction)
    this.addWall(x,y)
  }

}

window.OverworldMaps = {
  Main: {
    lowerSrc: "/assets/maps/background.png",
    upperSrc: "/assets/maps/foreground.png",
    gameObjects: {
      hero: new Person({
        isPlayerControlled: true,
        src: "/assets/sprites/hero.png",
        gridX: 5,
        gridY: 6,
      }),
      Fermat: new Person({
        gridX: 10,
        gridY: 5,
        src: "/assets/sprites/wigblue.png",
        talking: [
          {
              events:[
                  {type: "textMessage", 
                    text: "Bonjour! I have a little theorem for you.",
                    who: "Pierre De Fermat (1640)"},
                  {type: "flashCard", 
                   question: "Fermat's Little Theorem: $$a^p \\equiv \\underline{   } (\\text{mod } \\underline{   }),$$ where $p$ is ___, and $a$ is an ___.",
                   answer: ["a", "p", "prime", "integer"]},

              ]
          },
      ]
      }),
      Euler1: new Person({
        gridX: 6,
        gridY: 5,
        direction: "down",
        src: "/assets/sprites/wigblue.png",
        behaviorLoop: [],
        talking: [
          {
              events:[
                  {type: "textMessage", text: "Hey! ", who: "Leonhard Euler (1000 BCE)"},
                  {type: "flashCard",
                   question: `Euler's totient function $\\phi (n)$ counts the number of integers
                              between _ and _, inclusive, that are ___ to _.`,
                   answer: ["1","n","relatively prime", "n"]},

              ]
          },
      ]
      }),
    },
    cutsceneSpaces: {
    },
    controls: //Don't forget to add commas when copy pasting TODO: find a better way
    [
      -1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,
-1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,-1,
-1,0,-1,-1,-1,1,-1,1,-1,1,-1,-1,-1,-1,0,-1,
-1,0,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,0,-1,
-1,0,-1,-1,0,0,0,0,0,0,0,0,-1,-1,0,-1,
-1,0,-1,-1,20,1,-1,-1,1,-1,1,-1,-1,-1,0,-1,
-1,0,-1,-1,20,-1,-1,-1,-1,-1,-1,-1,-1,20,0,-1,
-1,0,-1,-1,0,0,20,0,0,0,0,0,-1,20,0,-1,
-1,0,-1,-1,0,-1,20,0,-1,20,1,20,20,20,0,-1,
-1,0,-1,-1,0,1,20,0,-1,20,-1,20,20,-1,0,-1,
-1,0,-1,-1,0,-1,20,0,20,20,-1,-1,-1,-1,0,-1,
-1,0,-1,-1,0,1,20,0,20,0,0,0,-1,-1,0,-1,
-1,0,-1,-1,-1,20,20,20,20,-1,-1,-1,-1,-1,0,-1,
-1,0,-1,-1,-1,-1,20,20,-1,-1,-1,-1,-1,-1,0,-1,
-1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,-1,
-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1

    ]
    ,
    
  },
}