TODO:
- Implement tool mode
- Add - to syntax tree, d/dx, f(x)
  - should we limit it to x, f, g, d/dx? to start with that would be fine. a,b,c for constants. f,g,h for functions
- 

Will we ever need ternary operators? No.
We will need unary operators.

Commutativity: drag a to b (or b to a) in a+b
Associativity: in a + (b + c) drag inner plus to outer? do we allow the other way?
Distribution: drag a to + in a * (b + c), drag * to + ?
Identity: Click on the 0 in a+0
Cancellation: usually you would cross out both terms.... hard to describe this gesture
Inverse: in a + (-a) click on 


With the modify and check interface, you would not be checking just the final answer but also intermediate steps.
Like space/enter to check... 
I don't know if I like this.
The toolbar option is the most explicit in telling you all of the rules that you are allowed to do.
I feel like a lot of confusion students have is related to not knowing/remembering what is allowed.



There needs to be a way to apply algebra rules.
There are two main options for this:
- Select a current active tool
  - this option is more explicit
  - gets worse as the number of tools increases
    - hotbar system??
  - potentially less fun because more time in menus
- Use the mouse in some way to signify each rule
  - this option is hopefully more intuitive
  - it is harder to implement
- Modify the blocks, then check the answer by pushing space
  - very intuitive
  - not explicit in what tools are available
  - very blockly...
  - Is the position of the main expression fixed?
  - multiple steps at a time, might be desirable
  - not much better than just typing the answer
  - slower


Almost need an unlock or skill tree system for tools

Tool selection:
In the toolbar option, how are tools selected
Scroll wheel
12345
qwer or asdf

Gesture ideas:
Click
Drag
Double click
Rclick?



Double negative in b - (-a) drag -a to -?

Functions:


Derivative: in d/dx ( f(x) )


Don't want the user to be able to accidentally do things, or brute force
Sometimes brute force is fine in puzzle games though
Don't want the user to forget what tools are available to them, or be overwhelmed by the number of tools


Interface:
- Drag blocks
  - Block x 
- Disconnect blocks
- 
- Reconnect blocks
- Drop blocks in scratch place
- Disconnected block spots
- Duplicate blocks
- Delete blocks 


