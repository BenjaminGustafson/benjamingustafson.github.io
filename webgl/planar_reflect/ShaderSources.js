/**
 * ShaderSources.js
 * 
 * Contains all of the shader source code as strings.
 * 
 */

var generalVertexShaderSource = `#version 300 es
in vec3 a_position;
in vec3 a_normal;
uniform mat4 u_mvpMatrix;
uniform mat3 u_normalMatrix;
out vec3 v_normal;

void main() {
    gl_Position = u_mvpMatrix * vec4(a_position, 1.0);
    v_normal = u_normalMatrix * a_normal;
}
`;

var generalFragmentShaderSource = `#version 300 es
precision highp float;

in vec3 v_normal;
out vec4 outColor;

uniform vec3 u_lightDir;
uniform float u_ambient;

void main() {
    vec3 normal = normalize(v_normal);
    float diffuse = max(dot(normal, -u_lightDir), 0.0);
    float light = u_ambient + (1.0 - u_ambient) * diffuse;
    vec3 baseColor = vec3(0.5, 0.5, 0.5);

    outColor = vec4(baseColor * light, 1.0);
    //outColor = vec4(normalize(v_normal) * 0.5 + 0.5, 1.0); //debug normals
    //outColor = vec4(1.0, 0.0, 1.0, 1.0); //debug fixed color
}
`

var reflectPlaneVertSrc = `#version 300 es

in vec3 a_position;
in vec3 a_normal;

uniform mat4 u_modelMatrix;
uniform mat4 u_mvpMatrix;
uniform mat3 u_normalMatrix;

out vec3 v_worldPos;
out vec3 v_normal;

void main() {
    vec4 worldPos = u_modelMatrix * vec4(a_position, 1.0);
    v_worldPos = worldPos.xyz;
    v_normal = u_normalMatrix * a_normal;

    gl_Position = u_mvpMatrix * vec4(a_position, 1.0);
}
`;

var reflectPlaneFragSrc = `#version 300 es
precision highp float;

in vec3 v_worldPos;
in vec3 v_normal;

uniform vec3 u_cameraPos;
uniform sampler2D u_reflectionTexture;
uniform mat4 u_projectionMatrix;
uniform mat4 u_viewMatrix;

out vec4 outColor;

void main() {
    vec3 normal = normalize(v_normal);
    vec3 viewDir = normalize(v_worldPos - u_cameraPos);
    vec3 reflectDir = reflect(viewDir, normal);

    // Reconstruct clip space pos for sampling reflection texture
    vec4 clipPos = u_projectionMatrix * u_viewMatrix * vec4(v_worldPos, 1.0);
    vec3 ndc = clipPos.xyz / clipPos.w;
    vec2 uv = ndc.xy * 0.5 + 0.5;

    // Optional: Clamp UVs to avoid artifacts
    uv = clamp(uv, 0.001, 0.999);

    vec4 reflectedColor = texture(u_reflectionTexture, uv);

    // Blend reflection with base color
    float fresnel = pow(1.0 - dot(normal, -viewDir), 3.0);
    vec3 baseColor = vec3(0.0, 0.0, 0.0);
    outColor = vec4(mix(baseColor, reflectedColor.rgb, fresnel), 1.0);
}
`


/**
 * Shader for the mountains.
 * 
 */
var mountainFragmentShaderSource = `#version 300 es
precision highp float;

in vec3 v_normal;
out vec4 outColor;

uniform vec3 u_lightDir;
uniform float u_ambient;


void main() {

    vec3 normal = normalize(v_normal);
    float diffuse = max(dot(normal, -u_lightDir), 0.0);
    float light = u_ambient + (1.0 - u_ambient) * diffuse * 0.4;
    vec3 baseColor = vec3(0.4, 0.4, 0.4);

    outColor = vec4(baseColor * light, 1.0);
    //outColor = vec4(normalize(v_normal) * 0.5 + 0.5, 1.0);//debug normals
    //outColor = vec4(1.0, 0.0, 1.0, 1.0); //debug fixed color
}
`;

var lakeVertexShaderSource = `#version 300 es

in vec3 a_position;
in vec3 a_normal;

uniform mat4 u_modelMatrix;
uniform mat4 u_mvpMatrix;
uniform mat3 u_normalMatrix;

out vec3 v_worldPos;
out vec3 v_normal;

void main() {
    vec4 worldPos = u_modelMatrix * vec4(a_position, 1.0);
    v_worldPos = worldPos.xyz;
    v_normal = u_normalMatrix * a_normal;

    gl_Position = u_mvpMatrix * vec4(a_position, 1.0);
}
`

var lakeFragmentShaderSource = `#version 300 es
precision highp float;

in vec3 v_worldPos;
in vec3 v_normal;

uniform vec3 u_cameraPos;
uniform sampler2D u_reflectionTexture;
uniform mat4 u_projectionMatrix;
uniform mat4 u_viewMatrix;

out vec4 outColor;

void main() {
    vec3 normal = normalize(v_normal);
    vec3 viewDir = normalize(v_worldPos - u_cameraPos);
    vec3 reflectDir = reflect(viewDir, normal);

    // Reconstruct clip space pos for sampling reflection texture
    vec4 clipPos = u_projectionMatrix * u_viewMatrix * vec4(v_worldPos, 1.0);
    vec3 ndc = clipPos.xyz / clipPos.w;
    vec2 uv = ndc.xy * 0.5 + 0.5;

    // Optional: Clamp UVs to avoid artifacts
    uv = clamp(uv, 0.001, 0.999);

    vec4 reflectedColor = texture(u_reflectionTexture, uv);

    // Optional: Blend reflection with base color
    float fresnel = pow(1.0 - dot(normal, -viewDir), 3.0); // Fresnel for realism
    vec3 baseColor = vec3(0.0, 0.0, 0.0); // dark surface
    outColor = vec4(mix(baseColor, reflectedColor.rgb, fresnel), 1.0);
}
`

var skyVertexShaderSource = `#version 300 es
precision highp float;

const vec2 positions[3] = vec2[](
  vec2(-1.0, -1.0),
  vec2( 3.0, -1.0),
  vec2(-1.0,  3.0)
);

out vec2 v_ndc;

void main() {
  v_ndc = positions[gl_VertexID];
  gl_Position = vec4(positions[gl_VertexID], 0.0, 1.0);
}
`;

var skyFragmentShaderSource = `#version 300 es
precision highp float;

in vec2 v_ndc;
out vec4 outColor;

uniform mat4 u_inverseViewProjection;
float pi = 3.1415926535;

mat2 rotate(float t){
  float s=sin(t), c=cos(t);
  return mat2(c, -s, s, c);
}

float hash(vec2 p){
  p = fract(p*vec2(125.34,444.893));
  p += dot(p, p+45.32);
  return fract(p.x*p.y);
}

float star(vec2 uv, float flare){
  float d = length(uv);
  float m = .05/d;
  float rays = max(0.,1.-((abs(uv.y)+.01)*(abs(uv.x)+.01)*1000.));
  m += rays*flare;
  uv *= rotate(3.14/4.);
  rays = max(0.,1.-((abs(uv.y)+.01)*(abs(uv.x)+.01)*1000.));
  m += rays*flare;
  m *= smoothstep(0.25,.2,d);
  return m;
}

vec3 decodeDirection(vec2 ndc, mat4 invVP) {  
  // Unproject to world space
  vec4 world = invVP * vec4(ndc, 1.0, 1.0);
  world.xyz /= world.w;
  vec3 dir = normalize(world.xyz);
  return dir;
}

void main() {
  vec3 dir = decodeDirection(v_ndc, u_inverseViewProjection);
  vec2 angle = vec2(atan(dir.x, dir.z)/pi/2.0+0.5, acos(dir.y)/pi*0.5);
  vec3 skyColor = vec3(fract(angle[0]*20.0));

  vec3 col = vec3(0.0,0.0,0.3*(1.-2.*dir.y));
  
  vec2 uv = dir.xy;
  uv *= 300.;
  vec2 gv = fract(uv)-.5;
  vec2 id = floor(uv);
  for (int y = -1; y <= 1; y++){
    for (int x = -1; x <= 1; x++){
      vec2 offset = vec2(x,y);
      float n = hash(id+offset);
      float size = fract(n*13.123);
      float star = star(gv-offset-(vec2(n,fract(n*100.))-.5), 0.0);
      float t = fract(n*2156.12)*3.14*2.;
      vec3 color = vec3(cos(t+0.1)*.5+.5,cos(t)*.5+.5,cos(t)*.5+.5);
      col += star*size*color;
    }
  }

  outColor = vec4(col, 1.0);
}
`

var genSkyVertexShaderSource = `#version 300 es
precision highp float;

const vec2 positions[3] = vec2[](
  vec2(-1.0, -1.0),
  vec2( 3.0, -1.0),
  vec2(-1.0,  3.0)
);

out vec2 v_uv;

void main() {
  v_uv = positions[gl_VertexID] * 0.5 + 0.5;
  gl_Position = vec4(positions[gl_VertexID], 0.0, 1.0);
}
`;

var genSkyFragmentShaderSource = `#version 300 es
precision highp float;

in vec2 v_uv;
out vec4 outColor;

uniform mat4 u_inverseViewProjection;

vec3 decodeDirection(vec2 uv, mat4 invVP) {
  vec4 ndc = vec4(uv * 2.0 - 1.0, 1.0, 1.0);
  
  // Unproject to world space
  vec4 world = invVP * ndc;
  world.xyz /= world.w;

  return normalize(world.xyz);
}

void main() {
  vec3 dir = decodeDirection(v_uv, u_inverseViewProjection);

  vec3 skyColor = vec3(clamp(dir.x * 0.5 + 0.5, 0.0, 1.0), clamp(dir.y * 0.5 + 0.5, 0.0, 1.0), clamp(dir.z * 0.5 + 0.5, 0.0, 1.0));
  outColor = vec4(skyColor, 1.0);
}
`



// vertex shader
const texVertexShader = `#version 300 es
in vec2 a_position;
out vec2 v_texcoord;

void main() {
    v_texcoord = (a_position + 1.0) * 0.5;
    gl_Position = vec4(a_position, 0, 1);
}`;

// fragment shader
const texFragmentShader = `#version 300 es
precision mediump float;
in vec2 v_texcoord;
uniform sampler2D u_texture;
out vec4 outColor;

void main() {
    outColor = texture(u_texture, v_texcoord);
}`;

