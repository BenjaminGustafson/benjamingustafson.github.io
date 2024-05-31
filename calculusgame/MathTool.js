/**
 * Tools:
 * Field algebra
 * - Commutativity
 * - Associativity
 * - Identity
 * - Inverse
 * - Distribution
 * 
 * Power
 *  
 */
class MathTool{

    static commute(block){
        if (block.num_children != 2 || !(block.token in ['+','-','*','/'])){
            console.log("Block is not commutative");
            return;
        }
        const tmp = block.children[0]
        block.children[0] = block.children[1]
        block.children[1] = block.children[0]
    }



}