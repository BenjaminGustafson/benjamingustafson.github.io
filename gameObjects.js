const gameObjects = {

hero: new Person({
isPlayerControlled: true,
src: "/assets/sprites/hero.png",
gridX: 5, gridY: 6,
}),

Fermat: new Person({
gridX: 10, gridY: 5,
src: "/assets/sprites/hero.png",
talking: [{ 
events:[
{type: "textMessage", 
text: "Bonjour! I have a little theorem for you.",
who: "Pierre De Fermat (1640)"},
{type: "flashCard", 
question: `Fermat's Little Theorem:
$$a^p \\equiv \\underline{\\phantom{a}} (\\text{mod } \\underline{   }),$$
where $p$ is ___, and $a$ is an ___.`,
answer: "a"},
{type: "flashCard",
question: `Fermat's Little Theorem: 
$$a^p \\equiv a (\\text{mod } \\underline{   }),$$ where $p$ is ___, and $a$ is an ___.`,
answer: "p"},
{type: "flashCard", question: "Fermat's Little Theorem: $$a^p \\equiv a (\\text{mod } p),$$ <br> where $p$ is ___, and $a$ is an ___.", answer: "prime"},
{type: "flashCard", question: "Fermat's Little Theorem: $$a^p \\equiv a (\\text{mod } p),$$ <br> where $p$ is prime, and $a$ is an ___.", answer: "integer"},
]},]}),

UnknownChinese: new Person({
gridX: 8,
gridY: 5,
direction: "down",
src: "/assets/sprites/hero.png",
behaviorLoop: [],
talking: [
{
events:[
{type: "textMessage", text: "Greetings. Let me tell you about hexagrams.", who: "Zhou Dynasty (1000 BCE)"},
{type: "textMessage", text: "A hexagram has six lines. Each line is either solid, for Yang, or broken for Yin.", who: "Zhou Dynasty (1000 BCE)"},
{type: "flashCard", question: "", answer: ""},

]
},
]
}),
Euler1: new Person({
gridX: 6,
gridY: 5,
direction: "down",
src: "/assets/sprites/hero.png",
behaviorLoop: [],
talking: [
{
events:[
{type: "textMessage", text: "Hey! ", who: "Leonhard Euler (1000 BCE)"},
{type: "flashCard", question: "", answer: ""},

]
},
]
}),
}