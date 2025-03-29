
/**
 * A cube with side lenght size centered at the origin.
 * Faces axes aligned, and normals facing out.
 * @param {*} size 
 * @returns object with {normals, faces, indices}
 */
function generateCube(size = 1) {
    const s = size / 2;
    const positions = [
      -s, -s, s,   s, -s, s,   s, s, s,   -s, s, s,
      -s, -s, -s, -s, s, -s,  s, s, -s,  s, -s, -s,
      -s, s, -s,  -s, s, s,   s, s, s,   s, s, -s,
      -s, -s, -s, s, -s, -s,  s, -s, s,  -s, -s, s,
      s, -s, -s,  s, s, -s,   s, s, s,   s, -s, s,
      -s, -s, -s, -s, -s, s,  -s, s, s,  -s, s, -s,
    ];
    const normals = [
      0,0,1, 0,0,1, 0,0,1, 0,0,1,
      0,0,-1,0,0,-1,0,0,-1,0,0,-1,
      0,1,0, 0,1,0, 0,1,0, 0,1,0,
      0,-1,0,0,-1,0,0,-1,0,0,-1,0,
      1,0,0, 1,0,0, 1,0,0, 1,0,0,
      -1,0,0,-1,0,0,-1,0,0,-1,0,0,
    ];
    const indices = [
      0,1,2, 0,2,3,   4,5,6, 4,6,7,
      8,9,10, 8,10,11, 12,13,14, 12,14,15,
      16,17,18, 16,18,19, 20,21,22, 20,22,23
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

    for (let x = 0; x < x_resolution; x++) {
        for (let z = 0; z < z_resolution; z++) {
            const posX = -width / 2 + x * dx;
            const posY = -depth / 2 + z * dz;
            positions.push(posX, 0, posY);
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
    for (let x = 0; x < x_resolution - 1; x++) {
        for (let z = 0; z < z_resolution - 1; z++) {
            const top_left = z * x_resolution + x
            const top_right = z * x_resolution + x + 1
            const bottom_left = (z+1) * x_resolution + x
            const bottom_right = (z+1) * x_resolution + x + 1
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

