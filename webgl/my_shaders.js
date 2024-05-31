texVert = `#version 300 es
in vec4 position;
in vec3 normal;
in vec2 texcoord;

uniform mat4 projection;
uniform mat4 modelView;

out vec3 v_normal;
out vec2 v_texcoord;

void main() {
    gl_Position = projection * modelView * position;
    v_normal = mat3(modelView) * normal;
    v_texcoord = texcoord;
}
`;

texFrag = `#version 300 es
precision highp float;

in vec3 v_normal;
in vec2 v_texcoord;

uniform sampler2D diffuse;
uniform sampler2D decal;
uniform vec4 diffuseMult;
uniform vec3 lightDir;

out vec4 outColor;

void main() {
    vec3 normal = normalize(v_normal);
    float light = dot(normal, lightDir) * 0.5 + 0.5;
    vec4 color = texture(diffuse, v_texcoord) * diffuseMult;
    vec4 decalColor = texture(decal, v_texcoord);
    decalColor.rgb *= decalColor.a;
    color = color * (1.0 - decalColor.a) + decalColor; 
    outColor = vec4(color.rgb * light, color.a);
}
`;