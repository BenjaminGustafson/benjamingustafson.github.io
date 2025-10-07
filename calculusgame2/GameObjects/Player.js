import { GameObject } from "./GameObject.js"

export class Player extends GameObject {

    constructor({nodes, paths, currentNode, tileMap}){
        super()
        Object.assign(this, {nodes, paths, currentNode, tileMap})

        // Isometric grid location
        this.isoX = nodes[currentNode][0]
        this.isoY = nodes[currentNode][1]

        // Direction facing
        this.dx = nodes[currentNode][2]
        this.dy = nodes[currentNode][3]
        
        this.state = 'waiting'
        
        // Images
        this.imgNE = document.getElementById('astronautB_NE'),
        this.imgSE = document.getElementById('astronautB_SE'),
        this.imgNW = document.getElementById('astronautB_NW'),
        this.imgSW = document.getElementById('astronautB_SW'),

        // Defined while moving
        this.pathIndex = 0
        this.currentPath = []
        this.targetNode = ''
        this.startTime = 0
        this.stepCount = 0
        this.stepTime = 50

        this.cx = 0
        this.cy = 0

        this.adjacencyTable = this.createAdjacencyTable(nodes, paths)
    }

    createAdjacencyTable(nodes, paths){
        // Path does not include starting node
        const adjacencyTable = {}
        for (const {start, end, steps=[]} of paths) {
            const forward = steps.slice() // copy array
            forward.push(nodes[end])
            const reverse = []
            for (let i = forward.length-2; i >= 0; i--){
                reverse.push(forward[i])
            }
            reverse.push(nodes[start])
            if (adjacencyTable[start] == null)
                adjacencyTable[start] = {}
            if (adjacencyTable[end] == null)
                adjacencyTable[end] = {}
            adjacencyTable[start][end] = forward
            adjacencyTable[end][start] = reverse
        }
        return adjacencyTable
    }
        

    /**
     * Breadth-first search
     * @param {*} adj 
     * @param {*} start 
     * @param {*} goal 
     * @returns 
     */
    bfsPath(adj, start, goal) {
        const queue = [[start]]
        const visited = new Set([start])
        
        while (queue.length > 0) {
            const nodePath = queue.shift()
            const node = nodePath[nodePath.length - 1]
            if (node == goal) {
                var coordPath = []
                for (let i = 0; i < nodePath.length -1; i++){
                    coordPath = coordPath.concat(adj[nodePath[i]][nodePath[i+1]])
                }
                return coordPath
            }
        
            for (const neighbor in adj[node]) {
                if (!visited.has(neighbor)) {
                    visited.add(neighbor)
                    queue.push([...nodePath, neighbor])
                }
            }
        }
        return null
    }
      
    moveTo (node){
        if (this.state == 'moving') return
        if (node == this.currentNode) {
            this.state = 'arrived'
            return
        }
        this.targetNode = node
        this.currentPath = this.bfsPath(this.adjacencyTable, this.currentNode, node)
        this.pathIndex = 0
        this.stepTime = Math.max(50,Math.min(200,1000/this.currentPath.length)) // not precise, but good enough
        const nextTarget = this.currentPath[this.pathIndex]
        this.dx = Math.sign(nextTarget[0] - this.isoX)
        this.dy = Math.sign(nextTarget[1] - this.isoY) 
        this.startTime = Date.now()
        this.state = 'moving'
    }

    update (ctx, audio, mouse){
        switch (this.state){
            case 'moving':
                // Move one tick
                if (Date.now() - this.startTime > this.stepTime){
                    audio.play('click_005', (this.stepCount++%2)*18-18+Math.random()*4, 0.4)
                    this.isoX += this.dx
                    this.isoY += this.dy
                    const targetCoord = this.currentPath[this.pathIndex]
                    // End of path step
                    if (this.isoX == targetCoord[0] && this.isoY == targetCoord[1]){
                        this.pathIndex ++
                        // End of path
                        if (this.pathIndex >= this.currentPath.length){
                            this.currentNode = this.targetNode
                            this.state = 'arrived'
                            this.dx =  this.nodes[this.currentNode][2]
                            this.dy = this.nodes[this.currentNode][3]
                        }
                        // Next step
                        else{    
                            const nextTarget = this.currentPath[this.pathIndex]
                            this.dx = Math.sign(nextTarget[0] - this.isoX)
                            this.dy = Math.sign(nextTarget[1] - this.isoY) 
                        }
                    }
                    this.startTime = Date.now()
                }
                break
            case 'waiting':
                break
            case 'arrived':
                break
        }
        const {x,y} = this.tileMap.isometricToCanvas(this.isoX,this.isoY)
        const nextCoord = this.tileMap.isometricToCanvas(this.isoX + this.dx,this.isoY+this.dy)
        const nx = nextCoord.x
        const ny = nextCoord.y
        const t = Math.max(0,Math.min(1,(Date.now() - this.startTime)/this.stepTime))
        const lerpX = this.state == 'moving' ? t*nx + (1-t)*x : x
        const lerpY = this.state == 'moving' ? t*ny + (1-t)*y : y 
        const jumpY = lerpY - 50 * (-t*t + t) 
        this.cx = lerpX + 256
        this.cy = jumpY + 256
        if (this.dx == 1){
            ctx.drawImage(this.imgSE, lerpX, jumpY)
        }else if (this.dx == -1){
            ctx.drawImage(this.imgNW, lerpX, jumpY)
        }else if (this.dy == 1){
            ctx.drawImage(this.imgSW, lerpX, jumpY)
        }else if (this.dy == -1){
            ctx.drawImage(this.imgNE, lerpX, jumpY)
        }else{
            console.warn('invalid dir', this.dx, this.dy)
        }
    }
}