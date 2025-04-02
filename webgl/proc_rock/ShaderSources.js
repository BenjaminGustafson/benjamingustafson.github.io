fullscreenVertSrc = `#version 300 es
precision highp float;

const vec2 positions[3] = vec2[](
    vec2(-1.0, -1.0),
    vec2( 3.0, -1.0),
    vec2(-1.0,  3.0)
);

void main() {
    gl_Position = vec4(positions[gl_VertexID], 0.0, 1.0);
}
`

fullscreenFragSrc = `#version 300 es
precision highp float;

out vec4 outColor;

void main() {
    vec2 uv = gl_FragCoord.xy / vec2(600.0, 600.0); // assuming square canvas
    outColor = vec4(uv.x, uv.y, 1.0 - uv.x, 1.0);
}
`