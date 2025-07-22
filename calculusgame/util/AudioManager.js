class AudioManager {
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

    play(name) {
        if (this.lastTimePlayed[name] != null && Date.now() - this.lastTimePlayed[name] < 35){
            return
        }
        this.lastTimePlayed[name] = Date.now()
        
        const buffer = this.buffers.get(name);
        if (!buffer) return;
        const source = this.context.createBufferSource();
        source.buffer = buffer;
        source.connect(this.context.destination);
        source.start(0);
    }

    playWithPitch(name, semitones) {
        if (this.lastTimePlayed[name] != null && Date.now() - this.lastTimePlayed[name] < 35){
            return
        }
        this.lastTimePlayed[name] = Date.now()

        const buffer = this.buffers.get(name);
        if (!buffer) return;
        const source = this.context.createBufferSource();
        source.buffer = buffer;

        // pitch shift in semitones: 2^(semitones / 12)
        source.playbackRate.value = Math.pow(2, semitones / 12);

        source.connect(this.context.destination);
        source.start(0);

        
    }

    unlock() {
        if (this.context.state === 'suspended') {
            this.context.resume();
        }
    }
}
