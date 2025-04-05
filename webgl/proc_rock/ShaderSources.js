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

worleyNoiseFragSrc = `#version 300 es
precision highp float;
out vec4 outColor;

uniform float u_uvScale;

// Hash function to generate a pseudo-random 2D vector from a cell coordinate.
vec2 hash2(vec2 p) {
    // Dot product seeds and sine produce a seemingly random vector.
    p = vec2(dot(p, vec2(127.1, 311.7)),
             dot(p, vec2(269.5, 183.3)));
    return fract(sin(p) * 43758.5453123);
}

// Worley noise function: returns the minimum distance from uv to a feature point.
float worley(vec2 uv) {
    vec2 i_st = floor(uv);
    vec2 f_st = fract(uv);
    float m = 1.0; // Initialize with a high value.

    // Loop through neighboring cells.
    for (int y = -1; y <= 1; y++) {
        for (int x = -1; x <= 1; x++) {
            vec2 neighbor = vec2(float(x), float(y));
            // Get a random point in the neighboring cell.
            vec2 point = hash2(i_st + neighbor);
            // Compute vector from current position to this feature point.
            vec2 diff = neighbor + point - f_st;
            float d = length(diff);
            m = min(m, d);
        }
    }
    return m;
}

void main() {
    // Scale the uv coordinates to control cell density. Adjust "5.0" to taste.
    vec2 uv = gl_FragCoord.xy / vec2(600.0, 600.0) * u_uvScale;
    float noise = worley(uv);

    // Output the noise as a grayscale color.
    outColor = vec4(vec3(noise), 1.0);
}
`

rockCommonHeader = `#version 300 es
precision highp float;
out vec4 outColor;

uniform float u_uvScale;

vec2 hash(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)),
             dot(p, vec2(269.5, 183.3)));
    return fract(sin(p) * 12.5453123);
}

// return distance, and cell id
vec2 voronoi( in vec2 x )
{
    vec2 n = floor( x );
    vec2 f = fract( x );

	vec3 m = vec3( 8.0 );
    for( int j=-1; j<=1; j++ )
    for( int i=-1; i<=1; i++ )
    {
        vec2  g = vec2( float(i), float(j) );
        vec2  o = hash( n + g );
        vec2  r = g - f + o;
	    //vec2  r = g - f + (0.5+0.5*sin(iTime+6.2831*o));
		float d = dot( r, r );
        if( d<m.x )
            m = vec3( d, o );
    }

    return vec2( sqrt(m.x), m.y+m.z );
}

// range ~[0,1]
float noise (vec2 p){
    vec2 bl = floor(p);
    vec2 br = bl+vec2(1.,0.);
    vec2 tl = bl+vec2(0.,1.);
    vec2 tr = bl+vec2(1.,1.);
    vec2 f = fract(p);
    
    float bld = dot(f,-1.+2.*hash(bl)); 
    float brd = dot(f+bl-br,-1.+2.*hash(br));
    float tld = dot(f+bl-tl,-1.+2.*hash(tl));
    float trd = dot(f+bl-tr,-1.+2.*hash(tr));
    
    //vec2 i = f*f*(3.0-2.0*f);
    vec2 i = f*f*f*(f*(f*6.0 - 15.0) + 10.0);

    float n = mix(mix(bld,brd,i.x),mix(tld,trd,i.x),i.y);
    // range ~ [-2/3,2/3]
    return n*3./2.*0.5+0.5;
}

// range ~[0,1]
float fbmOld(vec2 p, float n){
    float f = 0.0;
    float amp = 0.5;
    float maxVal = 0.;
    for (float i = 0.; i < n; i++){
        f += amp * noise(p);
        maxVal += amp;
        p *= 2.0;
        amp *= 0.5;
    }
    return (f-0.22)/0.56;
}

// Fractal Brownian Motion (fbm) with parameters for scale, detail, roughness, lacunarity, and distortion.
float fbm(vec2 p, float scale, float detail, float roughness, float lacunarity, float distortion) {
    // Apply scale to adjust the overall frequency.
    p *= scale;

    // Optionally add distortion if non-zero. The offset vectors (here, (5.2,1.3) and (1.7,9.2)) 
    // are arbitrary and can be tweaked to change the distortion pattern.
    if (distortion > 0.0) {
        p += distortion * vec2(noise(p + vec2(5.2, 1.3)), noise(p + vec2(1.7, 9.2)));
    }

    float total = 0.0;
    float amplitude = 0.5;   // Starting amplitude; you can adjust as needed.
    float frequency = 1.0;
    float maxAmplitude = 0.0; // For normalization

    // Loop 'detail' times to add octaves of noise.
    for (float i = 0.; i < detail; i++) {
        total += amplitude * noise(p * frequency);
        maxAmplitude += amplitude;
        frequency *= lacunarity; // Increase frequency by lacunarity.
        amplitude *= roughness;  // Decrease amplitude by roughness.
    }

    // Normalize the final noise value to [0,1] range.
    return total / maxAmplitude;
}

vec3 baseColor (vec2 uv){
    vec3 col = vec3(0);
    float n1 = fbm(uv, 1.0, 5.0, 0.6, 2.0, 0.0);
    float n2 = fbm(uv, 25.0, 10.0, 0.7, 2.0, 0.5);
    n1 = smoothstep(0.4,0.5,n1);
    n2 = smoothstep(0.4,0.6,n2);
    vec3 pal1 = vec3(0.2,0.2,0.2);
    vec3 pal2 = vec3(0.4,0.4,0.4);
    vec3 col1 = mix(pal1, pal2, n1);
    vec3 col2 = mix(pal1, pal2, n2);
    col = min(col1,col2);
    return col;
}
`

rockFragSrc = rockCommonHeader + `
void main() {
    vec2 uv = gl_FragCoord.xy / vec2(600.0, 600.0) * u_uvScale;
    outColor = vec4(baseColor(uv), 1.0);
}
`
rockFullFragSrc = rockCommonHeader + `
in vec3 v_normal;
in vec3 v_modelPos;

uniform vec3 u_cameraPos;
uniform float u_roughness;    // Range [0,1]: 0 = smooth, 1 = rough
uniform float u_metalness;    // Range [0,1]: 0 = dielectric, 1 = metal
uniform float u_lightIntensity;
uniform float u_ambientLight;
uniform float u_bumpStrength; // Controls how strong the bump effect is
uniform float u_bumpNoiseScale;

#define PI 3.141592653589793

float fbm(vec2 uv) {
    return fbm(uv, 1.0, 5.0, 0.6, 2.0, 0.0);
}

// Perturb the normal using a noise height field as a bump map.
// We approximate the derivative of the noise (height) function using small offsets.
vec3 perturbNormal(vec3 normal, vec2 uv) {
    // Sample the base height from noise.
    float height = fbm(uv);
    // Sample noise at a small offset to compute derivatives.
    float heightDx = fbm(uv + vec2(0.001, 0.0));
    float heightDy = fbm(uv + vec2(0.0, 0.001));
    float dHeightDx = (heightDx - height) / 0.001;
    float dHeightDy = (heightDy - height) / 0.001;
    
    // Compute screen-space derivatives of the model position to approximate tangents.
    vec3 dpdx = dFdx(v_modelPos);
    vec3 dpdy = dFdy(v_modelPos);
    vec3 tangent = normalize(dpdx);
    vec3 bitangent = normalize(dpdy);
    
    // Perturb the normal by subtracting a scaled combination of the height derivatives.
    vec3 bumpedNormal = normal - u_bumpStrength * (dHeightDx * tangent + dHeightDy * bitangent);
    return normalize(bumpedNormal);
}

void main() {
    // Compute spherical UV coordinates from the normalized model-space position.
    vec3 n = normalize(v_normal);
    vec3 p = normalize(v_modelPos);
    float u = 0.5 + atan(p.z, p.x) / (2.0 * PI);
    float v = 0.5 - asin(p.y) / PI;
    vec2 uv = vec2(u, v) * u_uvScale;
    
    // Create a base rock color from procedural noise.
    vec3 baseCol = baseColor(uv);
    
    // Perturb the normal using the noisy bump map.
    vec3 bumpedNormal = perturbNormal(n, uv * u_bumpNoiseScale);
    
    // Calculate lighting using a Cook-Torrance BRDF.
    vec3 lightDir = normalize(vec3(0.5, 1.0, 0.5));
    vec3 viewDir = normalize(u_cameraPos - v_modelPos);
    vec3 halfDir = normalize(lightDir + viewDir);

    // Compute dot products with clamping.
    float NdotL = max(dot(bumpedNormal, lightDir), 0.001);
    float NdotV = max(dot(bumpedNormal, viewDir), 0.001);
    float NdotH = max(dot(bumpedNormal, halfDir), 0.0);
    float VdotH = max(dot(viewDir, halfDir), 0.0);

    // Fresnel term using Schlick's approximation.
    float F0 = 0.04;
    F0 = mix(F0, 1.0, u_metalness);
    vec3 F = vec3(F0 + (1.0 - F0) * pow(1.0 - VdotH, 5.0));

    // Normal Distribution Function (GGX)
    float alpha = u_roughness * u_roughness;
    float denom = (NdotH * NdotH * (alpha - 1.0) + 1.0);
    float D = alpha / (PI * denom * denom + 0.0001);

    // Geometry term (Schlick-GGX)
    float k = (u_roughness + 1.0) * (u_roughness + 1.0) / 8.0;
    float G_L = NdotL / (NdotL * (1.0 - k) + k);
    float G_V = NdotV / (NdotV * (1.0 - k) + k);
    float G = G_L * G_V;

    // Cook-Torrance specular term.
    vec3 specular = (D * F * G) / (4.0 * NdotL * NdotV + 0.0001);

    // Diffuse term (Lambertian) for non-metallic surfaces.
    vec3 diffuse = baseCol / PI;

    // Combine diffuse and specular contributions.
    vec3 lightContribution = (1.0 - u_metalness) * diffuse + specular;
    lightContribution *= u_lightIntensity * NdotL;

    // Add ambient lighting.
    vec3 ambient = u_ambientLight * baseCol;
    
    vec3 color = ambient + lightContribution;
    
    outColor = vec4(color, 1.0);
}
`;



var generalVertexShaderSource = `#version 300 es
in vec3 a_position;
in vec3 a_normal;
uniform mat4 u_mvpMatrix;
uniform mat3 u_normalMatrix;
out vec3 v_normal;
out vec3 v_modelPos;

void main() {
    gl_Position = u_mvpMatrix * vec4(a_position, 1.0);
    v_normal = u_normalMatrix * a_normal;
    v_modelPos = a_position;
}
`;


var rockBumpVertSrc = `#version 300 es
in vec3 a_position;
in vec3 a_normal;
uniform mat4 u_mvpMatrix;
uniform mat3 u_normalMatrix;
out vec3 v_normal;
out vec3 v_modelPos;

void main() {
    gl_Position = u_mvpMatrix * vec4(a_position, 1.0);
    v_normal = u_normalMatrix * a_normal;
    v_modelPos = a_position;
}
`;