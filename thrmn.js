const FREQ_LOW = 32.7031956625748294; // C1 in Hz
const FREQ_HIGH = 1046.502261202394538; // C6 in Hz
const DPR = window.devicePixelRatio || 1;

function scaleBetween(value, newMin, newMax, oldMin, oldMax) {
    return (newMax - newMin) * (value - oldMin) / (oldMax - oldMin) + newMin;
}

class Theremin {
    constructor(root) {
        this.root = root;

        this.x = window.innerWidth / 2 * DPR;
        this.y = window.innerWidth / 1.8 * DPR;
        this.w = window.innerWidth;
        this.h = window.innerHeight;

        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.audioCtx = new AudioCtx();

        this.setCanvasSize();
        this.setupMasterGain();
      
      this.state = {
        isPlaying: false
    }
    }

    

    setState(nextState) {
        this.state = Object.assign({}, this.state, nextState);
        this.updateDom();
    }

    setupMasterGain() {
        console.log('master gain setup')
        this.masterGainNode = this.audioCtx.createGain();
        this.masterGainNode.connect(this.audioCtx.destination);
        this.masterGainNode.gain.value = 0;
    }
    
    setGain(value) {
        // cancel any future value
        const currentTime = this.audioCtx.currentTime;
        this.masterGainNode.gain.cancelScheduledValues(currentTime);
        this.masterGainNode.gain.value = value;
    }

    updateGain(nextGain, cb) {
        if (typeof nextGain === "undefined") {
            nextGain = scaleBetween(this.y, 0, 1, 0, this.h);
        }
        
        const rampTime = 0.1;
        const prevGain = this.masterGainNode.gain.value;
        const currentTime = this.audioCtx.currentTime;
        const endTime = currentTime + rampTime;
        this.masterGainNode.gain.cancelScheduledValues(currentTime);
        this.masterGainNode.gain.setValueAtTime(prevGain, currentTime);
        this.masterGainNode.gain.linearRampToValueAtTime(nextGain, endTime);
        
        // probably a nicer way to do this without callback nonsense...
        if (typeof cb === 'function') {
            if (this.gainTimeout) {
                clearTimeout(this.gainTimeout);
            }
            this.gainTimeout = setTimeout(() => {
                this.gainTimeout = null;
                cb()
            }, rampTime * 1000);
        }
    }

    setFreq() {
        const frequency = scaleBetween(this.x, FREQ_LOW, FREQ_HIGH, 0, this.w);
        this.osc.frequency.value = frequency;
    }

    setCanvasSize() {
        this.w = window.innerWidth * DPR;
        this.h = window.innerHeight * DPR;
    }

    // Interaction and Event Handlers

    handlerResize(){
        this.setCanvasSize();
    };

    handleInteractStart(e){
        e.stopPropagation();

        if (!this.state.userInteracting) {
            this.setState({
                userInteracting: true,
            });
        }
        
        if (this.state.isPlaying) {
            this.stop();
        } else {
            this.play();
        }
    };

    handleInteractEnd(){
        this.stop();
    };

    handlePlayButton(e){
        e.stopPropagation();
        this.state.isPlaying ? this.stop() : this.play();
    };
    handleNewCoords(x,y){this.x=x;this.y=y;this.updateOsc()}
    handleInteractMove(event, touch){
        if (!this.state.userInteracting) {
            this.setState({
                userInteracting: !this.state.userInteracting,
            });
        }

        if (event.targetTouches) {
            event.preventDefault();
            this.x = event.targetTouches[0].clientX * DPR;
            this.y = event.targetTouches[0].clientY * DPR;
        } else {
            this.x = event.clientX * DPR;
            this.y = event.clientY * DPR;
        }

        this.updateOsc();
    };

    // Audio Playback

    play(){
        if (this.osc) {
            this.osc.stop();
            this.osc = null;
        }
        
        if (this.gainTimeout) return; // wait for any fading gains
        
        this.setState({
            isPlaying: true,
        });
        
        this.updateGain();
        
        // new osc
        this.osc = this.audioCtx.createOscillator();
        this.setFreq();
        this.osc.connect(this.masterGainNode);
        this.osc.start();

        return this.osc;
    };

    stop(){
        this.updateGain(0, () => {            
            this.setState({
                isPlaying: false,
            });
            this.osc.stop();
            this.osc = null;
        });
    };

    updateOsc() {
        if (this.osc && !this.gainTimeout) {
            this.updateGain();
            this.setFreq();
        }
    }

}
