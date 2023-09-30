class Complex {
    float re;
    float im;

    public Complex(float re, float im) {
        this.re = re;
        this.im = im;
    }
    
    public String toString(){
       return "(" + re + "," + im + ")";
    }

    public Complex addC(Complex b){
        return new Complex(this.re + b.re, this.im + b.im);
    }

    public Complex multC(Complex b) {
        return new Complex(this.re * b.re - this.im * b.im, this.re * b.im + this.im * b.re);
    }
    
    
    public Complex divC(Complex b){
      float denom = b.re*b.re + b.im*b.im;
      float re_part = (re*b.re+im*b.im)/denom;
      float im_part = (im*b.re - re*b.im)/denom;
      return new Complex(re_part, im_part);
    }
    
    public float arg(){//the principle argument, in (-pi , pi]
        return atan2(im, re);
    }
    
    public float mod(){
        return sqrt(im*im + re*re);
    }
    
    // https://mathworld.wolfram.com/ComplexExponentiation.html
    // See equation (2)
    public Complex powC(Complex b){
        float coeff = pow((re*re),b.re/2) * exp(-b.im * arg());
        float theta = b.re * arg() + 0.5 * b.im * log(re*re+im*im);
        float re_part = coeff*cos(theta);
        float im_part = coeff*sin(theta);
        return new Complex(re_part, im_part);
    }
    
    public Complex neg(){
      return new Complex(-re,im);
    }
    
    public Complex conj(){
       return new Complex(re,-im); 
    }
}
