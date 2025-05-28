
var variables = {
    test: {
        value: 10
    }

}

const canvas = document.getElementById("canvas") 


// ------------------------------- Setup  ---------------------------------------------
function setup() {
    const controlsDiv = document.getElementById("controls");
    for (const [name, variable] of Object.entries(variables)){
        controlsDiv.append(createSliderControl(name,variable));
    }
}

// ------------------------------- Draw  ---------------------------------------------
function draw(){
    var ctx = canvas.getContext("2d")
    canvas.width = canvas.width
    ctx.strokeRect(10,10,variables.test.value,100)
    requestAnimationFrame(draw)
}

setup()
requestAnimationFrame(draw)



function createSliderControl(name, variable) {
    // Create a container div.
    const container = document.createElement("div");

    // Create a label.
    const label = document.createElement("label");
    label.htmlFor = name;
    label.textContent = name;
    container.appendChild(label);

    // Create the slider input.
    const slider = document.createElement("input");
    slider.type = "range";
    slider.id = name;
    slider.min = variable.min;
    slider.max = variable.max;
    slider.step = variable.step;
    slider.value = variable.value;
    container.appendChild(slider);

    // Create a span to display the current value.
    const span = document.createElement("span");
    span.class = "slider-label";
    span.textContent = variable.initialValue;
    container.appendChild(span);

    slider.addEventListener("input", function() {
        const value = parseFloat(slider.value);
        variable.value = value;
        span.textContent = slider.value;
    });
    return container;
}
