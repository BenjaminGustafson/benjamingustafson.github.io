/**
 * ______________________________
 *             Sprite
 * ______________________________
 * 
 * Sprites are all 16 x 24, so they take up
 * the width of 1 grid space and the height of 1.5
 * grid spaces. They are drawn 8 pixels above the 
 * square their GameObject is on. The result is that 
 * sprites will never overlap horizontally, and will
 * only ever overlap vertically by half a square.
 * 
 * TThe sprite has a spritesheet, an image
 * 
 * An animation is an array of points where
 * 
 * A point is an array: [x,y].
 * Ex: "walk-down" is [ [1,0],[2,0],[3,0],[0,0] ]
 * 
 * Constructor (config):
 *     - src : url string of the sprite/spritesheet
 *     - gameObject : GameObject
 *     * animations : dict[name string -> array of points], defaults to character animations
 *     * currentAnimation: name string, default "idle-down"
 *     * animationFrameLimit: integer, default 8
 *     
 * 
 * Methods:
 *      setAnimation (key)
 *      updateAnimationProgress()
 *      draw(ctx, cameraPerson)
 * 
 */
class Sprite{
    constructor(config){

        //Set up the image
        this.image = new Image()
        this.image.src = config.src
        this.image.onload = () => {
            this.isLoaded = true
        }

        // //Shadow
        // this.shadow = new Image()
        // this.useShadow = true
        // if (this.useShadow){
        //     this.shadow.src = "/images/characters/shadow.png"
        // }
        // this.shadow.onload = () => {
        //     this.isShadowLoaded = true
        // }

        //Configure animation and initial state
        this.animations = config.animations || {
            "idle-down"  : [ [0,0] ],
            "idle-right" : [ [0,1] ],
            "idle-up"    : [ [0,2] ],
            "idle-left"  : [ [0,3] ],
            "walk-down"  : [ [1,0],[2,0],[3,0],[0,0] ],
            "walk-right" : [ [1,1],[2,1],[3,1],[0,1] ],
            "walk-up"    : [ [1,2],[2,2],[3,2],[0,2] ],
            "walk-left"  : [ [1,3],[2,3],[3,3],[0,3] ],
        }
        this.currentAnimation = config.currentAnimation || "idle-down"
        this.currentAnimationFrame = 0

        //Adjust animation speed here
        this.animationFrameLimit = config.animationFrameLimit || 8
        this.animationFrameProgress = this.animationFrameLimit

        //Reference game object
        this.gameObject = config.gameObject
    }

    get frame() {
        return this.animations[this.currentAnimation][this.currentAnimationFrame]
    }

    setAnimation(key){
        if(this.currentAnimation !== key){
            this.currentAnimation = key
            this.currentAnimationFrame = 0
            this.animationFrameProgress = this.animationFrameLimit
        }
    }

    updateAnimationProgress() {
        //Downtick frame progress
        if (this.animationFrameProgress > 0) {
            this.animationFrameProgress -= 1
            return
        }

        //Reset counter
        this.animationFrameProgress = this.animationFrameLimit
        this.currentAnimationFrame += 1
        if (this.frame === undefined){
            this.currentAnimationFrame = 0
        }
    }

    draw(ctx, cameraPerson){
        const x = this.gameObject.drawX - cameraPerson.drawX + 10.5 * 16
        const y = this.gameObject.drawY - cameraPerson.drawY + 5.5 * 16

        this.isShadowLoaded && ctx.drawImage(this.shadow, x,y)

        const [frameX, frameY] = this.frame

        this.isLoaded && ctx.drawImage(
            this.image,
            frameX * 16, frameY * 24, //cut top left
            16,24, //cut dimensions
            x,y, //draw top left
            16,24 //draw dimensions
        )
        
        this.updateAnimationProgress()
    }
}