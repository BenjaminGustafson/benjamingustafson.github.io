export class AudioManager {
    constructor() {
        this.context = new (window.AudioContext || window.webkitAudioContext)();
        this.buffers = new Map();

        this.lastTimePlayed = {}
    }

    async load(name, url) {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await this.context.decodeAudioData(arrayBuffer);
        this.buffers.set(name, audioBuffer);
    }

    /**
     * 
     * @param {*} name 
     * @param {*} pitch - number of semitones to pitch shift up
     * @param {*} volume 
     * @param {*} force 
     * @returns 
     */
    play(name, pitch = 0 , volume = 1.0, force = false) {
        if (! force && (this.lastTimePlayed[name] != null && Date.now() - this.lastTimePlayed[name] < 35)) {
            return;
        }
        this.lastTimePlayed[name] = Date.now();
    
        const buffer = this.buffers.get(name);
        if (!buffer) return;
    
        const source = this.context.createBufferSource();
        source.buffer = buffer;
        source.playbackRate.value = Math.pow(2, pitch / 12);
    
        const gainNode = this.context.createGain();
        gainNode.gain.value = volume;
    
        source.connect(gainNode);
        gainNode.connect(this.context.destination);
    
        source.start(0);
    }

    playSine(frequency = 440, duration = 1, volume = 1.0) {
        const osc = this.context.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = frequency;
    
        const gainNode = this.context.createGain();
        gainNode.gain.value = volume;
    
        osc.connect(gainNode);
        gainNode.connect(this.context.destination);
    
        osc.start();
        osc.stop(this.context.currentTime + duration);
    }
    
    

    unlock() {
        if (this.context.state === 'suspended') {
            this.context.resume();
        }
    }
}
