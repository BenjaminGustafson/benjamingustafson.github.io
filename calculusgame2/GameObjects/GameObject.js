export class GameObject {
    hidden = false // When hidden, the objects update function is not called
    noInput = false // When true, object recieves no input
    update(ctx, audioManager, mouse) { throw new Error("update() must be implemented");  }
}