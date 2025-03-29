
function createSeededRNG(seed) {
    // Simple LCG (linear congruential generator)
    let s = seed >>> 0;
    return function() {
      s = (1664525 * s + 1013904223) % 4294967296;
      return s / 4294967296;
    };
}

/**
 * 
 * 
 * 
 * @param {*} seed 
 * @returns 
 */
function createPerlinNoise(seed = 0) {
    const grad2 = [
      [1,1], [-1,1], [1,-1], [-1,-1],
      [1,0], [-1,0], [0,1], [0,-1],
    ];
  
    // Generate permutation table with seeded RNG
    const perm = new Uint8Array(512);
    const p = new Uint8Array(256);
    const rng = createSeededRNG(seed);
  
    for (let i = 0; i < 256; i++) p[i] = i;
    for (let i = 255; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [p[i], p[j]] = [p[j], p[i]];
    }
    for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
  
    function fade(t) {
      return t * t * t * (t * (t * 6 - 15) + 10);
    }
  
    function lerp(a, b, t) {
      return a + (b - a) * t;
    }
  
    function dotGrid(ix, iy, x, y) {
      const g = grad2[perm[ix + perm[iy]] % grad2.length];
      return g[0] * (x - ix) + g[1] * (y - iy);
    }
  
    // The Perlin noise function
    function noise(x, y) {
      const x0 = Math.floor(x);
      const x1 = x0 + 1;
      const y0 = Math.floor(y);
      const y1 = y0 + 1;
  
      const sx = fade(x - x0);
      const sy = fade(y - y0);
  
      const n00 = dotGrid(x0, y0, x, y);
      const n10 = dotGrid(x1, y0, x, y);
      const n01 = dotGrid(x0, y1, x, y);
      const n11 = dotGrid(x1, y1, x, y);
  
      const ix0 = lerp(n00, n10, sx);
      const ix1 = lerp(n01, n11, sx);
      return lerp(ix0, ix1, sy);
    }
  
    return noise;
}

function createFBM(perlinFn, {
    octaves = 5,
    persistence = 0.5,
    lacunarity = 2.0,
    scale = 1.0
  } = {}) {
    return function(x, y) {
      let value = 0;
      let amplitude = 1;
      let frequency = 1;
      let maxAmplitude = 0;
  
      for (let i = 0; i < octaves; i++) {
        const nx = x * frequency / scale;
        const ny = y * frequency / scale;
        value += perlinFn(nx, ny) * amplitude;
        maxAmplitude += amplitude;
  
        amplitude *= persistence;
        frequency *= lacunarity;
      }
  
      // Normalize to [-1, 1]
      return value / maxAmplitude;
    };
}


function generateTerrain(width, depth, resolution, fbm, options = {}) {
  const {
    mountainSlope = 1.0,
  } = options;

  const positions = [];
  const normals = [];
  const indices = [];

  const cols = resolution;
  const rows = resolution;

  const dx = width / (cols - 1);
  const dz = depth / (rows - 1);

  // Generate vertices
  for (let z = 0; z < rows; z++) {
    for (let x = 0; x < cols; x++) {
      const u = x / (cols - 1);
      const v = z / (rows - 1);

      const worldX = -width / 2 + x * dx;
      const worldZ = -depth / 2 + z * dz;

      const noiseHeight = fbm(u * width, v * depth);
      //const gradient = Math.pow(v, gradientPower);  // goes from 0 to 1
      const height = noiseHeight * (rows-z)*0.01 + (rows-z)*0.007;

      positions.push(worldX, height, worldZ);
      normals.push(0, 1, 0); // Placeholder — will be replaced
    }
  }

  // Generate indices
  for (let z = 0; z < rows - 1; z++) {
    for (let x = 0; x < cols - 1; x++) {
      const i = z * cols + x;

      indices.push(i, i + 1, i + cols);
      indices.push(i + 1, i + cols + 1, i + cols);
    }
  }

  // Compute normals
  computeVertexNormals(positions, indices, normals);

  return {
    positions: new Float32Array(positions),
    normals: new Float32Array(normals),
    indices: new Uint16Array(indices),
  };
}


function computeVertexNormals(positions, indices, normals) {
    // Zero out normals
    for (let i = 0; i < normals.length; i++) normals[i] = 0;
  
    for (let i = 0; i < indices.length; i += 3) {
      const i0 = indices[i] * 3;
      const i1 = indices[i + 1] * 3;
      const i2 = indices[i + 2] * 3;
  
      const v0 = positions.slice(i0, i0 + 3);
      const v1 = positions.slice(i1, i1 + 3);
      const v2 = positions.slice(i2, i2 + 3);
  
      const a = vec3.sub([], v1, v0);
      const b = vec3.sub([], v2, v0);
      const normal = vec3.cross([], a, b);
      vec3.normalize(normal, normal);
  
      for (let j of [i0, i1, i2]) {
        normals[j + 0] += normal[0];
        normals[j + 1] += normal[1];
        normals[j + 2] += normal[2];
      }
    }
  
    // Normalize each vertex normal
    for (let i = 0; i < normals.length; i += 3) {
      const n = normals.slice(i, i + 3);
      vec3.normalize(n, n);
      normals[i + 0] = n[0];
      normals[i + 1] = n[1];
      normals[i + 2] = n[2];
    }
  }
  
