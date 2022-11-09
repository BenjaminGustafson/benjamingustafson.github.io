const utils = {
  nextPosition(initialX, initialY, direction) {
    let x = initialX
    let y = initialY
    if (direction === "left") { 
      x -= 1
    } else if (direction === "right") {
      x += 1
    } else if (direction === "up") {
      y -= 1
    } else if (direction === "down") {
      y += 1
    }
    return {x,y}
  },
  oppositeDirection(direction) {
    if (direction === "left") { return "right" }
    if (direction === "right") { return "left" }
    if (direction === "up") { return "down" }
    return "up"
  },
  emitEvent(name, detail) {
    const event = new CustomEvent(name, {
      detail
    })
    document.dispatchEvent(event)
  },
  faceTowards(targetX, targetY, refX, refY){
    if(targetX < refX) return "left"
    else if (targetX > refX) return "right"
    else if (targetY < refY) return "up"
    else return "down"
  },
  
}