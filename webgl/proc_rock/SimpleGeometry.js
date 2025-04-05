
/**
 * A cube with side lenght size centered at the origin.
 * Faces axes aligned, and normals facing out.
 * @param {*} size 
 * @returns object with {normals, faces, indices}
 */
function generateCube(size = 1) {
    const s = size / 2;
    const positions = [
        -s, -s, s, s, -s, s, s, s, s, -s, s, s,
        -s, -s, -s, -s, s, -s, s, s, -s, s, -s, -s,
        -s, s, -s, -s, s, s, s, s, s, s, s, -s,
        -s, -s, -s, s, -s, -s, s, -s, s, -s, -s, s,
        s, -s, -s, s, s, -s, s, s, s, s, -s, s,
        -s, -s, -s, -s, -s, s, -s, s, s, -s, s, -s,
    ];
    const normals = [
        0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
        0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1,
        0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,
        0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0,
        1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
        -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0,
    ];
    const indices = [
        0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7,
        8, 9, 10, 8, 10, 11, 12, 13, 14, 12, 14, 15,
        16, 17, 18, 16, 18, 19, 20, 21, 22, 20, 22, 23
    ];
    return {
        positions: new Float32Array(positions),
        normals: new Float32Array(normals),
        indices: new Uint16Array(indices),
    };
}


/**
 * A plane of dimension width by depth centered at the origin.
 * Sits in the y = 0 plane. 
 * Has roughly square quads.
 * Normals face in positive y direction.
 * 
 * @param {*} width the size along the x axis in model units 
 * @param {*} depth the size along the z axis
 * @param {*} x_resolution the number of vertices along the x axis
 * @returns object with {normals, faces, indices}
 */
function generatePlane(width, depth, x_resolution) {
    const positions = [];
    const normals = [];
    const indices = [];

    // dx the distance from one vertex to the next along x
    const dx = width / (x_resolution - 1);
    // z_resolution as close to square as possible
    const z_resolution = Math.round(depth / dx);
    const dz = depth / z_resolution;

    for (let z = 0; z < z_resolution; z++) {
        for (let x = 0; x < x_resolution; x++) {
            const posX = -width / 2 + x * dx;
            const posZ = -depth / 2 + z * dz;
            positions.push(posX, 0, posZ);
            normals.push(0, 1, 0);
        }
    }

    /**
     *                      x
     *    __________________________________________________________
     *   |  0                                       x_resolution-1
     * z |       z*x_res+x          z*x_res+x+1
     *   |       (z+1)+x_res+x    (z+1)*x_res+x+1
     */
    for (let z = 0; z < z_resolution - 1; z++) {
        for (let x = 0; x < x_resolution - 1; x++) {
            const top_left = z * x_resolution + x
            const top_right = z * x_resolution + x + 1
            const bottom_left = (z + 1) * x_resolution + x
            const bottom_right = (z + 1) * x_resolution + x + 1
            indices.push(top_left, top_right, bottom_left);
            indices.push(top_right, bottom_left, bottom_right);
        }
    }

    return {
        positions: new Float32Array(positions),
        normals: new Float32Array(normals),
        indices: new Uint16Array(indices),
    };
}

function generateIcosphere(radius = 1, detail = 0) {
    const t = (1 + Math.sqrt(5)) / 2;
    const vertices = [];
    let faces = [];
    const middlePointIndexCache = {};
  
    // Adds a vertex, normalizing it to lie on the unit sphere.
    function addVertex(x, y, z) {
      const length = Math.sqrt(x * x + y * y + z * z);
      const vertex = { x: x / length, y: y / length, z: z / length };
      vertices.push(vertex);
      return vertices.length - 1;
    }
  
    // Returns index of midpoint vertex between vertices[i1] and vertices[i2].
    // Caches the result to avoid duplicating vertices.
    function getMiddlePoint(indexA, indexB) {
      const key = indexA < indexB ? `${indexA}_${indexB}` : `${indexB}_${indexA}`;
      if (middlePointIndexCache[key] !== undefined) {
        return middlePointIndexCache[key];
      }
      const pointA = vertices[indexA];
      const pointB = vertices[indexB];
      const middleX = (pointA.x + pointB.x) / 2;
      const middleY = (pointA.y + pointB.y) / 2;
      const middleZ = (pointA.z + pointB.z) / 2;
      const newIndex = addVertex(middleX, middleY, middleZ);
      middlePointIndexCache[key] = newIndex;
      return newIndex;
    }
  
    // Create 12 vertices of an icosahedron.
    addVertex(-1,  t,  0);
    addVertex( 1,  t,  0);
    addVertex(-1, -t,  0);
    addVertex( 1, -t,  0);
    addVertex( 0, -1,  t);
    addVertex( 0,  1,  t);
    addVertex( 0, -1, -t);
    addVertex( 0,  1, -t);
    addVertex( t,  0, -1);
    addVertex( t,  0,  1);
    addVertex(-t,  0, -1);
    addVertex(-t,  0,  1);
  
    // Create 20 triangular faces of the icosahedron.
    faces = [
      [0, 11, 5],
      [0, 5, 1],
      [0, 1, 7],
      [0, 7, 10],
      [0, 10, 11],
      [1, 5, 9],
      [5, 11, 4],
      [11, 10, 2],
      [10, 7, 6],
      [7, 1, 8],
      [3, 9, 4],
      [3, 4, 2],
      [3, 2, 6],
      [3, 6, 8],
      [3, 8, 9],
      [4, 9, 5],
      [2, 4, 11],
      [6, 2, 10],
      [8, 6, 7],
      [9, 8, 1]
    ];
  
    // Subdivide each face 'detail' times.
    for (let i = 0; i < detail; i++) {
      const newFaces = [];
      faces.forEach(face => {
        const [a, b, c] = face;
        const ab = getMiddlePoint(a, b);
        const bc = getMiddlePoint(b, c);
        const ca = getMiddlePoint(c, a);
  
        newFaces.push([a, ab, ca]);
        newFaces.push([b, bc, ab]);
        newFaces.push([c, ca, bc]);
        newFaces.push([ab, bc, ca]);
      });
      faces = newFaces;
    }
  
    // Build positions and normals arrays.
    // For a sphere, normals are the same as the normalized positions.
    const positions = [];
    const normals = [];
    vertices.forEach(v => {
      positions.push(v.x * radius, v.y * radius, v.z * radius);
      normals.push(v.x, v.y, v.z);
    });
  
    // Build indices array.
    const indices = [];
    faces.forEach(face => {
      indices.push(face[0], face[1], face[2]);
    });
  
    return { positions, normals, indices };
  }
  