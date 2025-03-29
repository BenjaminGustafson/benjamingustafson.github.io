var generalVertexShaderSource = `#version 300 es
in vec4 a_position;
in vec3 a_normal;

uniform mat4 u_normalMatrix;
uniform mat4 u_viewProjectionMatrix;

out vec3 v_normal;
out float v_clipY;

void main() {
  gl_Position = u_viewProjectionMatrix * a_position;
  v_normal = mat3(u_normalMatrix) * a_normal;
  v_clipY = gl_Position.y;
}
`;

var mountainFragmentShaderSource = `#version 300 es
precision highp float;

in vec3 v_normal;
out vec4 outColor;

uniform vec3 u_lightDir;
uniform float u_ambient;

in float v_clipY;
uniform float u_clipY;     // Y level of the lake (e.g., 0.0)
uniform bool u_clipping;   // toggle for clipping pass

void main() {
  // if (u_clipping && v_clipY < u_clipY) {
  //   discard;
  // }
  vec3 normal = normalize(v_normal);
  float diffuse = max(dot(normal, -u_lightDir), 0.0);
  float light = u_ambient + (1.0 - u_ambient) * diffuse;
  vec3 baseColor = vec3(0.3, 0.3, 0.35);
  //outColor = vec4(baseColor * light, 1.0);
  //outColor = vec4(normalize(v_normal) * 0.5 + 0.5, 1.0);//debug normals
  outColor = vec4(1.0, 0.0, 1.0, 1.0); 
}
`;

var lakeVertexShaderSource = `#version 300 es
in vec4 a_position;

uniform mat4 u_modelMatrix;
uniform mat4 u_viewProjectionMatrix;
uniform mat4 u_reflectedVP;

out vec4 v_reflectedClipPos;

void main() {
  vec4 worldPos = u_modelMatrix * a_position;

  // This is the position we're going to use to sample the reflection
  v_reflectedClipPos = u_reflectedVP * worldPos;

  gl_Position = u_viewProjectionMatrix * worldPos;
}
`

var lakeFragmentShaderSource = `#version 300 es
precision highp float;

in vec4 v_reflectedClipPos;
out vec4 outColor;

uniform sampler2D u_reflectionTex;

void main() {
  // Project from clip space to NDC
  vec3 ndc = v_reflectedClipPos.xyz / v_reflectedClipPos.w;

  // Map from NDC [-1,1] to UV [0,1]
  vec2 uv = ndc.xy * 0.5 + 0.5;
  uv = uv * 10.0;

  // Flip Y axis if needed (framebuffer rendering often does this)
  uv.y = 1.0 - uv.y;

  // Sample reflection texture
  vec3 reflectionColor = texture(u_reflectionTex, uv).rgb;

  outColor = vec4(reflectionColor, 1.0);
}
`

var skyVertexShaderSource = `#version 300 es
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

var skyFragmentShaderSource = `#version 300 es
precision highp float;

in vec2 v_uv;
out vec4 outColor;

uniform mat4 u_inverseViewProjection;

vec3 decodeDirection(vec2 uv, mat4 invVP) {
  // NDC coordinates
  vec4 ndc = vec4(uv * 2.0 - 1.0, 1.0, 1.0);
  
  // Unproject to world space
  vec4 world = invVP * ndc;
  world.xyz /= world.w;

  // Assume camera is at origin
  return normalize(world.xyz);
}

void main() {
  vec3 dir = decodeDirection(v_uv, u_inverseViewProjection);

  // Very simple gradient based on y
  vec3 skyColor = vec3(clamp(dir.x * 0.5 + 0.5, 0.0, 1.0), clamp(dir.y * 0.5 + 0.5, 0.0, 1.0), clamp(dir.z * 0.5 + 0.5, 0.0, 1.0));
  outColor = vec4(skyColor, 1.0);
}
`







// `#version 300 es
// precision highp float;

// out vec4 outColor;

// float random(vec2 uv) {
//   return fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453);
// }

// float star(vec2 uv) {
//   vec2 grid = floor(uv * 100.0);       // grid cell
//   vec2 id = grid;                      // star ID
//   vec2 offset = fract(uv * 100.0);     // pixel offset in cell

//   float rnd = random(id);
//   if (rnd < 0.8) return 0.0;           // skip most cells

//   // Random star position inside cell
//   vec2 starPos = fract(vec2(sin(rnd * 4375.0), cos(rnd * 1234.0)));

//   // Random size
//   float sizeRnd = random(id + 13.37);
//   float radius = mix(0.05, 0.3, sizeRnd);  // small to big stars

//   float d = distance(offset, starPos);
//   return smoothstep(radius, 0.0, d);   // softer = larger glow
// }

// void main() {
//   // Convert from gl_FragCoord (in pixels) to [0,1] UV
//   vec2 uv = gl_FragCoord.xy / vec2(1280.0, 720.0); // <-- Replace with canvas size if needed

//   float s = star(uv);
//   vec3 sky = mix(vec3(0.0, 0.0, 0.1), vec3(0.0), uv.y);
//   sky += s;
//   //outColor = vec4(sky, 1.0);
//   outColor = vec4(uv,1.0,1.0);
// }
// `