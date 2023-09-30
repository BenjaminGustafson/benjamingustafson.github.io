import toxi.geom.Vec3D;
import toxi.geom.ReadonlyVec3D;
float angle = 0f;
PVector axis;
PVector up,right;
PVector cameraPos;
float cameraDist;
Complex [][] sin_points, e_points, inv_points, id_points,
             sqr_points, zer_points, log_points, zeta_points, 
             cub_points, points_4;
Complex[][] points;
float min, max, scale;
int num_seg;

void setup() {
  size(600, 600, P3D);
  angle=0;
  axis = new PVector(1, 0, 0);
  up = new PVector(0,1,0);

  cameraDist = width/2.0;
  cameraPos = new PVector(0, 0, cameraDist);
  camera(cameraPos.x, cameraPos.y, cameraPos.z, 0, 0, 0, up.x, up.y, up.z);
  
  min = -5;
  max = 5;
  num_seg = 100;
  
  sin_points = new Complex[num_seg+1][num_seg+1];
  e_points = new Complex[num_seg+1][num_seg+1];
  inv_points = new Complex[num_seg+1][num_seg+1];
  id_points = new Complex[num_seg+1][num_seg+1];
  sqr_points = new Complex[num_seg+1][num_seg+1];
  zer_points = new Complex[num_seg+1][num_seg+1];
  log_points = new Complex[num_seg+1][num_seg+1];
  zeta_points = new Complex[num_seg+1][num_seg+1];
  cub_points = new Complex[num_seg+1][num_seg+1];
  points_4 = new Complex[num_seg+1][num_seg+1];
  for (int i = 0; i <= num_seg; i++){
    for (int j = 0; j <= num_seg; j++){
      float re = map(j,0,num_seg,min,max);
      float im = map(i,0,num_seg,min,max);
      Complex z = new Complex(re,im);
      sin_points[i][j] = sinC(z);
      e_points[i][j] = eC(z);
      inv_points[i][j] = invC(z);
      id_points[i][j] = z;
      sqr_points[i][j] = z.multC(z);
      zer_points[i][j] = new Complex(0,0);
      log_points[i][j] = logC(z);
      zeta_points[i][j] = zeta(z);
      cub_points[i][j] = z.multC(z).multC(z);
      points_4[i][j] = z.multC(z).multC(z).multC(z);
    }
  }
  
  points = sin_points;
  scale = 20;
  
  pushMatrix();
}

Complex sinC(Complex z){
    Complex e = new Complex(2.71828182845904523536,0);
    Complex i = new Complex(0,1);
    Complex iz = z.multC(i);
    return (e.powC(iz).addC(e.powC(iz.neg()).neg())).divC(new Complex(0,2));
}

Complex eC(Complex z){
    Complex e = new Complex(2.71828182845904523536,0);
    return (e.powC(z));
}

Complex invC(Complex z){
    if (z.re == 0 && z.im ==0) return new Complex(10000,10000);
    float denom = z.re*z.re + z.im*z.im;
    return new Complex((z.re + z.im)/denom, (z.re - z.im)/denom);
}

Complex logC(Complex z){
  if (z.re == 0 && z.im == 0) return new Complex(-10000,-10000);
  return new Complex(log(z.mod()),z.arg());
}

Complex zeta(Complex z){
  Complex sum = new Complex(0,0);
  for (int i = 1; i <= 100; i++){
    Complex ic = new Complex(i,0);
    sum = sum.addC(invC(z.powC(ic)));
  }
  return sum;
}


void graph(){
  //PImage img = loadImage("test.png");
  PImage img = createImage(num_seg+1, num_seg+1, RGB);
  img.loadPixels();
  colorMode(HSB, 1.0);
  for (int i = 0; i < img.pixels.length; i++) {
    int x = i%(num_seg+1);
    int y = i/(num_seg+1);
    img.pixels[i] = color(map(points[y][x].arg(),-PI,PI,0,1), 1, 1); 
  }
  img.updatePixels();
  
  textureMode(NORMAL); 
  
  for (int i = 0; i < num_seg; i++){
    beginShape(QUAD_STRIP);
    texture(img);
    for (int j = 0; j <= num_seg; j++){
      vertex(map(j,0,num_seg,min,max), points[i][j].mod(), map(i,0,num_seg,min,max), float(j)/num_seg,float(i)/num_seg);
      vertex(map(j,0,num_seg,min,max), points[i+1][j].mod(), map(i+1,0,num_seg,min,max), float(j)/num_seg,float(i+1)/num_seg);
    }
    endShape();
  }
  
}

void draw() {
  popMatrix();
  background(0);
  lights();

  Vec3D axis_vec = toVec3D(axis);
  Vec3D up_vec = toVec3D(up);
  Vec3D camera_vec = toVec3D(cameraPos);
  Vec3D camera_rotated = camera_vec.getRotatedAroundAxis(axis_vec,angle);
  Vec3D up_rotated = up_vec.getRotatedAroundAxis(axis_vec,angle);
  up = toPVector(up_rotated).normalize();
  cameraPos = toPVector(camera_rotated).normalize().mult(cameraDist);
  
  PVector gaze = PVector.mult(cameraPos,-1);
  right = gaze.cross(up).normalize();
  
  camera(cameraPos.x, cameraPos.y, cameraPos.z, 0, 0, 0, up.x, up.y, up.z);
  angle = 0;
  
  
  noStroke();
  scale(scale);
  graph();
  pushMatrix();
}

void mouseDragged() {
  if (mouseButton == LEFT) {
    float dx = mouseX - pmouseX;
    float dy = mouseY - pmouseY;
    angle = map(sqrt(dx*dx + dy*dy), 0, width/8.0, 0, TWO_PI);
    axis = PVector.mult(up,-dx).add(PVector.mult(right,dy)).normalize();// perpendicular vector to (dx,dy) in the ru-plane
  } else if (mouseButton == RIGHT) {
    float dx = mouseX - pmouseX;
    angle = map(dx, 0, width/8.0, 0, TWO_PI);
    axis = cameraPos.copy().normalize();
  }
}

void keyPressed(){
  if (key == 's'){
    points = sin_points;
  }else if (key == 'e'){
    points = e_points;
  }else if (key == 'i'){
    points = inv_points;
  }else if(key=='1'){
    points = id_points; 
  }else if(key=='2'){
    points = sqr_points; 
  }else if(key=='0'){
    points = zer_points; 
  }else if(key=='l'){
    points = log_points; 
  }else if(key=='z'){
    points = zeta_points; 
  }else if(key=='3'){
    points = cub_points; 
  }else if(key=='4'){
    points = points_4; 
  }
}

PVector toPVector(Vec3D v){
  return new PVector(v.x, v.y, v.z);
}

Vec3D toVec3D(PVector v){
  return new Vec3D(v.x, v.y, v.z);
}
