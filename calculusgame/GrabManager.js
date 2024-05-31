class GrabManager{

    constructor(){
        this.topPriority = -1
        this.topObj = null
    }

    requestGrab(obj, priority){
        if (priority > this.topPriority){
            this.topObj = obj 
        }
    }
}