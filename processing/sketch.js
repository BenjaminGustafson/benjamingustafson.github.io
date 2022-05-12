function setup(){
    createCanvas(400,400);
    background(0);
    sound();
}

function draw(){
    circle(100);
}

function sound(){
    sample_rate = 100000;//Hz
    notes = [65,67,69,71,72,74,76];//MIDI numbers F4 - E5
    freqs = [];
    for (i = 0; i < notes.length; i++){
      freqs[i] = pow(pow(2,1.0/12), notes[i]-69) * 440;
    }
    tempo = 400;//bpm
    num_beats = 16*7;
    num_samples = int(sample_rate * num_beats * 60 / tempo);
    samples = [];
    for (i = 0; i < num_samples; i++) {
      beat_fl = float(i) / sample_rate * tempo / 60.0;
      beat = int(beat_fl);
      freq1 = freqs[(beat%4*2 + 3*(int(beat/16)))%7];
      freq2 = freqs[(3*(int(beat/16)))%7];
      freq3 = freqs[6-(beat+16)/32];
      samples[i] = sin(TWO_PI*i*freq1/2/sample_rate) * (1-pow(2*(beat_fl%1)-1,4));
      samples[i] += sin(TWO_PI*i*freq2/4/sample_rate) * (1-pow(2*(beat_fl/16%1)-1,64));
      samples[i] += sin(TWO_PI*i*freq3/sample_rate + sin(float(i)/2000)) * (1-pow(2*(beat_fl/16%1)-1,64));
    }
  
    sample = new AudioSample(this, samples, sample_rate);
  
    sample.amp(0.2);
    sample.loop();
  }