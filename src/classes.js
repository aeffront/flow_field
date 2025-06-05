// import { Tone } from "tone/build/esm/core/Tone";


let wavetable = [];

fetch('./src/wavebank.json')
  .then(response => response.json())
  .then(data => {
    data.forEach((waveform) => {
       const wave = Tone.context.createPeriodicWave(waveform.real, waveform.imag, { disableNormalization: false });
        wavetable.push(wave);
    });
    console.log('readyWavetable loaded', wavetable);
  })
  .catch(err => {
    console.error('Failed to load wavetable.json', err);
  });
  
 

const borderCanvas = document.createElement('canvas');
borderCanvas.width = window.innerWidth*2;
borderCanvas.height = window.innerHeight*2;
const borderCtx = borderCanvas.getContext('2d');
borderCanvas.setAttribute('id', 'borderCanvas');
document.body.appendChild(borderCanvas);





let colorRight = 'rgb(0, 255, 149)';
let colorLeft = 'rgb(221, 0, 255)';
let colorTop = 'rgb(255, 255, 255)';
let colorBottom = 'rgb(133, 134, 122)';




class Cell {
  constructor(u,v,x, y, vx = 0, vy = 0, restWidth, restHeight ) {
    this.u = u;
    this.v = v;
    this.x = x+restWidth / 2;
    this.y = y+restHeight / 2;
    this.vx = vx;
    this.vy = vy;
    this.sizeFactor = 1;
    this.speed = 0.01;
    this.borderTop = false;
    this.borderBottom = false;
    this.borderLeft = false;
    this.borderRight = false;

    this.img = new Image();
    this.img.src = './public/cursor.png';
  }

  draw(ctx,debug = false,definition,colors) {
    

    if(debug){
      borderCanvas.style.display = 'none';

    ctx.beginPath();
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(47, 9, 9, 0.3)';
    ctx.strokeRect(this.x, this.y, definition, definition);
    ctx.closePath();

    ctx.beginPath();
    ctx.moveTo(this.x + definition / 2, this.y + definition / 2);
    ctx.lineTo(this.x + definition / 2 + this.vx * definition / 2, this.y + definition / 2 + this.vy * definition / 2);
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.closePath();
    }
    else{
      borderCanvas.style.display = 'block';
      if(this.vx != 0 || this.vy != 0){
        borderCtx.fillStyle = "black"
        let extra= 10;
        borderCtx.fillRect(this.x-extra, this.y-extra, definition+(extra*2), definition+(extra*2));
      }

      if(this.vx == 0 && this.vy == 0){
        // ctx.fillStyle = 'white';
        // ctx.fillRect(this.x, this.y, definition, definition);
      }
      if(this.vx==1){
        ctx.fillStyle = colorRight;
        ctx.fillRect(this.x, this.y, definition, definition);

        if(this.vy == 1){
          this.sizeFactor = (Math.sin((Date.now()* this.speed)-this.u*0.7)*0.5+1)*0.5*(Math.sin((Date.now()* this.speed)-this.v*0.7)*0.5+1);
        ctx.fillStyle = colorTop
        const scaledSize = (definition / 2) * this.sizeFactor;
        const offset = (definition / 2 - scaledSize) / 2;

        ctx.fillRect(this.x + offset, this.y + offset, scaledSize, scaledSize);
        ctx.fillRect(this.x + definition / 2 + offset, this.y + definition / 2 + offset, scaledSize, scaledSize);
        

        }else if(this.vy == -1){
          this.sizeFactor = (Math.sin((Date.now()* this.speed)-this.u*0.7)*0.5+1)*0.5*(Math.sin((Date.now()* this.speed)+this.v*0.7)*0.5+1);
          ctx.fillStyle = colorBottom;
          const scaledSize = (definition / 2) * this.sizeFactor;
          const offset = (definition / 2 - scaledSize) / 2;

          ctx.fillRect(this.x + offset, this.y + offset, scaledSize, scaledSize);
          ctx.fillRect(this.x + definition / 2 + offset, this.y + definition / 2 + offset, scaledSize, scaledSize);

        }else if(this.vy == 0){
          ctx.clearRect(this.x, this.y, definition, definition);
          ctx.fillStyle = colorRight;
           this.sizeFactor = (Math.sin((Date.now()* this.speed)-this.u*0.7)*0.5+1)*0.5;
          const scaledSize = (definition / 2) * this.sizeFactor;
          const offset = (definition / 2 - scaledSize) / 2;
          ctx.fillRect(this.x + offset, this.y + offset, scaledSize, scaledSize);
          ctx.fillRect(this.x + definition / 2 + offset, this.y + definition / 2 + offset, scaledSize, scaledSize);
        }
       
      }
      else if(this.vx==-1){
        ctx.fillStyle = colorLeft;
        ctx.fillRect(this.x, this.y, definition, definition);
        if(this.vy == 1){

            this.sizeFactor = (Math.sin((Date.now()* this.speed)+this.u*0.7)*0.5+1)*0.5*(Math.sin((Date.now()* this.speed)-this.v*0.7)*0.5+1);
            ctx.fillStyle = colorTop;
            const scaledSize = (definition / 2) * this.sizeFactor;
            const offset = (definition / 2 - scaledSize) / 2;

            ctx.fillRect(this.x + offset, this.y + offset, scaledSize, scaledSize);
            ctx.fillRect(this.x + definition / 2 + offset, this.y + definition / 2 + offset, scaledSize, scaledSize);

        }else if(this.vy == -1){
          this.sizeFactor = (Math.sin((Date.now()* this.speed)+this.u*0.7)*0.5+1)*0.5*(Math.sin((Date.now()* this.speed)+this.v*0.7)*0.5+1);
            ctx.fillStyle = colorBottom
            const scaledSize = (definition / 2) * this.sizeFactor;
            const offset = (definition / 2 - scaledSize) / 2;

            ctx.fillRect(this.x + offset, this.y + offset, scaledSize, scaledSize);
            ctx.fillRect(this.x + definition / 2 + offset, this.y + definition / 2 + offset, scaledSize, scaledSize);

        }else if(this.vy == 0){
          ctx.clearRect(this.x, this.y, definition, definition);
          ctx.fillStyle = colorLeft;
         this.sizeFactor = (Math.sin((Date.now()* this.speed)+this.u*0.7)*0.5+1)*0.5;
          const scaledSize = (definition / 2) * this.sizeFactor;
          const offset = (definition / 2 - scaledSize) / 2;
          ctx.fillRect(this.x + offset, this.y + offset, scaledSize, scaledSize);
          ctx.fillRect(this.x + definition / 2 + offset, this.y + definition / 2 + offset, scaledSize, scaledSize);
        }
       
      }
      else if(this.vx == 0 && this.vy != 0){
        if(this.vy == 1){

            this.sizeFactor = (Math.sin((Date.now()* this.speed)-this.v*0.7)*0.5+1);
            ctx.fillStyle = colorTop
            const scaledSize = (definition / 2) * this.sizeFactor;
            const offset = (definition / 2 - scaledSize) / 2;

            ctx.fillRect(this.x + offset, this.y + offset, scaledSize, scaledSize);
            ctx.fillRect(this.x + definition / 2 + offset, this.y + definition / 2 + offset, scaledSize, scaledSize);
        }
        else if(this.vy == -1){


            this.sizeFactor = (Math.sin((Date.now()* this.speed)+this.v*0.7)*0.5+1);
            ctx.fillStyle = colorBottom
            const scaledSize = (definition / 2) * this.sizeFactor;
            const offset = (definition / 2 - scaledSize) / 2;

            ctx.fillRect(this.x + offset, this.y + offset, scaledSize, scaledSize);
            ctx.fillRect(this.x + definition / 2 + offset, this.y + definition / 2 + offset, scaledSize, scaledSize);
        }

      

       
      }
      
    }
  }
  
}

class Agent {
  constructor(cells, instrument,definition, numCols, numRows) {
    this.x = Math.random() * definition * numCols;
    this.y = Math.random() * definition * numRows;
    this.vx = 0;
    this.vy = 0;
    this.cells = cells;
    this.instrument = instrument;
    this.definition = definition;
    this.closestCell;
    this.numRows = numRows;
    this.numCols = numCols;
    this.delete = false;


    this.sequencer;

    console.log(this.instrument)

    // Crée une div HTML pour l'agent
    this.el = document.createElement('div');
    this.el.classList.add('agent');
    Object.assign(this.el.style, {
      position: 'absolute',
      width: `${definition}px`,
      height: `${definition}px`,
      pointerEvents: 'none',
      zIndex: 10,
      transformOrigin: 'center center',
      transform: `scale(100)`,
    });

    this.el.classList.add("agent")

    

    document.body.appendChild(this.el);
  }

  getClosestCell() {
    let closestCell = null;
    let minDistance = Infinity;
    for (let row of this.cells) {
      for (let cell of row) {
        const dx = this.x - (cell.x + this.definition / 2);
        const dy = this.y - (cell.y + this.definition / 2);
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < minDistance) {
          minDistance = dist;
          closestCell = cell;
        }
      }
    }
    return closestCell;
    
  }

  update() {


    let cell = this.getClosestCell();
    this.closestCell = cell;
    if (!cell) return;

    this.vx *= 0.98;
    this.vy *= 0.98;
    this.vx += cell.vx * 0.3;
    this.vy += cell.vy * 0.3;

    this.x = (this.x + this.vx + window.innerWidth*2) %  (window.innerWidth*2);
    this.y = (this.y + this.vy + window.innerHeight*2) % (window.innerHeight*2);

    const rotation = Math.atan2(this.vy, this.vx)+Math.PI/2; // radians

    let step = 100;

    // Get frequency data from the analyser and compute average
    let freqData = new Uint8Array(this.instrument.wavetable.analyser.frequencyBinCount);
    this.instrument.wavetable.analyser.getByteFrequencyData(freqData);
    let audioValue = freqData.reduce((sum, value) => sum + value, 0) / freqData.length;

    // Positionne et oriente la div
    if( audioValue > 50){
      this.el.style.transform = `translate(${this.x/2}px, ${this.y/2}px) rotate(${rotation}rad)`;
    
    }
    //this.el.style.transform = `translate(${Math.floor(this.x / step) * step / 2}px, ${Math.floor(this.y / step) * step / 2}px)`;
    // this.el.style.transform = `rotate(${rotation}rad)`;
    // Add a white stroke around the agent using Webkit-specific CSS

    this.instrument.update({x : this.x / (window.innerWidth*2),y: this.y / (window.innerHeight*2)});

    if (cell.vx === 0 && cell.vy === 0) {
      let altCell = null;
      let minDist = Infinity;
      for (let row of this.cells) {
        for (let c of row) {
          if (c.vx !== 0 || c.vy !== 0) {
            const dx = this.x - (c.x + this.definition / 2);
            const dy = this.y - (c.y + this.definition / 2);
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < minDist) {
              minDist = dist;
              altCell = c;
            }
          }
        }
      }
      if (altCell) {
        this.vx += (altCell.x + this.definition / 2 - this.x) * 0.01;
        this.vy += (altCell.y + this.definition / 2 - this.y) * 0.01;
      }
    }
  }

  play() {
    this.instrument.start();
  }
}

class Instrument {
  constructor(){
    this.wavetable = new Wavetable();
    this.frequency = 10;
    this.previousTime = Date.now();
    
  }
  

  start(){
    this.wavetable.start(this.frequency);
  }

  update(pos){

     this.wavetable.updateWaveform(pos);
  }
}



class oldInstrument {
  constructor(type = 0, noteLength = '64n', octave = 3,agent) {
    this.agent = agent;
    this.agentColor;
    this.type = document.getElementById('instrument_selector').value;
    this.noteLength = noteLength;
    this.octave = this.type == "Bass" ? octave+4: octave; // Bass starts at C1
    this.playedNotes = [];
    this.revWet = 0;

    switch(document.getElementById('instrument_selector').value){
      case "FX":
        this.noteLength = '1n';
        this.revWet = 0.5;
        break;
      case "Pluck":
        this.noteLength = '2n';
        this.revWet = 0.3;
        break;
      case "Pad":
        this.noteLength = '2n';
        this.revWet = 0.7;
        break;
      case "Bass":
        this.noteLength = '4n';
        this.revWet = 0.1;
        break;
    }



    this.reverb = new Tone.Reverb({ 
      decay: 10,
      preDelay: 0.01,
      wet: this.revWet,
    }).connect(master);

    this.baseUrl;
    this.baseUrl = './public/sample/';

    switch (document.getElementById('instrument_selector').value) {
      case "FX":
        this.agentColor = 'red';
        break;
      case "Pluck":
        this.agentColor = 'blue';
        break;
      case "Pad":
        this.agentColor = 'green';
        break;
      case "Bass":
        this.agentColor = 'purple';

        break;
    }

    // Ensure the element and its children are loaded before modifying styles
    setTimeout(() => {
      Array.from(this.agent.el.children).forEach((child) => {
        const shapes = child.querySelectorAll('path');
        if (shapes.length > 0) {
          shapes.forEach((shape) => {
            shape.style.fill =  this.agentColor ;
            
          });
        } else {
          console.warn('No <path> elements found in child:', child);
        }
      });
    }, 100); // Delay to ensure elements are rendered


    // document.getElementById('instrument_selector').addEventListener('change', (event) => {
    //   switch (event.target.value) {
    //     case "Piano":
    //       this.baseUrl = './public/piano_samples/';
    //       break;
    //     case "Guitar":
    //       this.baseUrl = './public/synth_samples/';
    //       break;
    //     case "Synth":
    //       this.baseUrl = './public/guitare_samples/';
    //       break;
    //     case "Vox":
    //       this.baseUrl = './public/vox_samples/';
    //       break;
    //     case "Bass":
    //       this.baseUrl = './public/bass_samples/';
    //       break;
    //   }
    // });


    

    this.sampler = new Tone.Sampler({
      urls: {
      'C1': document.getElementById('instrument_selector').value+".wav",
      },
      baseUrl: this.baseUrl,
      onload: () => {
      console.log('Sampler loaded');

      }
    })

    // Allow overlapping notes by enabling polyphony
    this.sampler.maxPolyphony = 0; // Set the maximum number of simultaneous notes

    if (this.type == "Bass") {
      let filter = new Tone.Filter(400, "lowpass"); // Increased cutoff for audible bass
      this.sampler.connect(filter);
      filter.connect(this.reverb);
    } else {
      this.sampler.connect(this.reverb);
    }

    if( this.type =="Pluck" ){
      let delay = new Tone.PingPongDelay("8n", 0.1);
      this.sampler.connect(delay);
      delay.connect(this.reverb);
    }
    

    // Set sampler volume based on instrument type
    switch (document.getElementById('instrument_selector').value) {
      case "FX":
      this.sampler.volume.value = -5;
      break;
      case "Pluck":
      this.sampler.volume.value = -20;
      break;
      case "Pad":
      this.sampler.volume.value = -20;
      break;
      case "Bass":
      this.sampler.volume.value = -12;
      break;
      default:
      this.sampler.volume.value = -10;
      break;
    }
    



    
  }

  play(note) {
   
    if (typeof note !== 'string' && typeof note !== 'number') {
      console.error('Invalid note:', note);
      return;
    }

    let n = typeof note === 'number' ? note + this.octave : note + this.octave;

    if (this.sampler.loaded) {
       this.playedNotes.push(note);
        this.sampler.triggerAttackRelease(n, this.noteLength);
      
       
      

     
    } else {
      console.warn('Sampler not loaded yet.');
    }
    
  }
}



let bassFrequency = 20;

    class Wavetable {
      constructor( sampleRate = 2048) {
        this.agentEl;
        

        this.sampleRate = sampleRate;
        this.pos = 0;
        this.context = Tone.getContext().rawContext;
        this.osc = null;
        this.gain = null;

        this.lfo = this.context.createOscillator();
        this.lfo.type = 'square'; // LFO type

        // Scale LFO output from [-1, 1] to [0, 1] using Gain and ConstantSource, then sum
        this.lfoGain = this.context.createGain();
        this.lfoGain.gain.value = 0.5; // scale [-1,1] to [-0.5,0.5]
        this.lfoOffset = this.context.createConstantSource();
        this.lfoOffset.offset.value = 0.6; // offset to [0,1]

        // Create a summing node (GainNode with gain=1)
        this.lfoSum = this.context.createGain();
        this.lfoSum.gain.value = 1.0;

        this.lfo.connect(this.lfoGain);
        this.lfoGain.connect(this.lfoSum);
        this.lfoOffset.connect(this.lfoSum);

        // Now use this.lfoSum as the [0,1] LFO signal
        this.lfoFrequency = null;



        this.delay = this.context.createDelay(0.01);
        this.delayFeedback = this.context.createGain();
        this.delayFilter = this.context.createBiquadFilter();
        this.delayFilter.type = 'highpass';
        this.delayFilter.frequency.value = 600; // Lowpass filter for delay
        this.delay.connect(this.delayFilter);
        this.delay.connect(this.delayFeedback);
        this.delayFeedback.connect(this.delay);
        this.delayFeedback.gain.value = 0.7; // Feedback gain for delay

       
       this.waveBank = wavetable;
       this.octave;

       this.frequency = bassFrequency*Math.pow(2, this.octave || 1); // Convert to A4 frequency scale

       this.masterGain;

       this.analyser = this.context.createAnalyser();
      // Configure analyser for volume (amplitude) analysis
      this.analyser.fftSize = 256; // Smaller FFT size for faster amplitude response
      this.analyser.smoothingTimeConstant = 0.1; // Smooth amplitude changes
      this.analyser.minDecibels = -100;
      this.analyser.maxDecibels = 0;

       
      

       

   
      }


      start(freq = 20) {
        if (this.osc) return;
        const index = Math.round(this.pos * (this.waveBank.length - 1));
        const wave = this.waveBank[index];

        this.osc = this.context.createOscillator();
        this.gain = this.context.createGain();
        this.gain.gain.setValueAtTime(0.5, this.context.currentTime);

        this.osc.setPeriodicWave(wave);
        this.osc.frequency.setValueAtTime(freq, this.context.currentTime);
        // Create a big reverb effect
        const reverb = this.context.createConvolver();
        // Generate an impulse response for a big reverb
        const length = this.context.sampleRate * 3; // 3 seconds
        const impulse = this.context.createBuffer(2, length, this.context.sampleRate);
        for (let i = 0; i < 2; i++) {
          const channel = impulse.getChannelData(i);
          for (let j = 0; j < length; j++) {
            // Exponential decay
            channel[j] = (Math.random() * 2 - 1) * Math.pow(1 - j / length, 2.5);
          }
        }
        reverb.buffer = impulse;
        reverb.normalize = true;

        // Dry/Wet mix for reverb
        const dryWet = 0.7; // 0 = dry only, 1 = wet only

        // Create dry and wet gain nodes
        const dryGain = this.context.createGain();
        const wetGain = this.context.createGain();
        dryGain.gain.value = 1 - dryWet;
        wetGain.gain.value = dryWet;

        this.master = this.context.createGain();

        this.lfoSum.connect(this.gain.gain);
        this.lfo.start();

        // Routing: osc -> gain -> [dry, wet] -> destination
        this.osc.connect(this.gain);
        this.gain.connect(this.delay).connect(dryGain);
        this.gain.connect(this.delay).connect(reverb);
        reverb.connect(wetGain);

        // Merge dry and wet
        dryGain.connect(this.master).connect(this.context.destination);
        wetGain.connect(this.master).connect(this.context.destination);

        this.osc.start();
        dryGain.connect(this.analyser)
      }

      updateWaveform(pos) {
        // Get frequency data from the analyser and log it
        const freqData = new Uint8Array(this.analyser.frequencyBinCount);
        this.analyser.getByteFrequencyData(freqData);

        let average = freqData.reduce((sum, value) => sum + value, 0) / freqData.length;
console.log('Analyser frequency data:', average);
        if(average >50 ){
            this.agentEl.style.backgroundColor = colorRight;
            
        }
        else{
            this.agentEl.style.backgroundColor = colorLeft;
        }
      
  this.pos = Math.min(Math.max(pos.x, 0), 1);
  const index = Math.round(this.pos * (this.waveBank.length - 1));
  const wave = this.waveBank[index];
  this.osc.frequency.setValueAtTime((bassFrequency*Math.pow(2, this.octave || 1)) + pos.y * 20, this.context.currentTime); // Adjust frequency based on y position

  this.lfo.frequency.setValueAtTime(pos.y*10 , this.context.currentTime);

  if (this.osc) {
    this.osc.setPeriodicWave(wave);
  }
}


      stop() {
        if (this.osc) {
          this.osc.stop();
          this.osc.disconnect();
          this.gain.disconnect();
          this.osc = null;
          this.gain = null;
        }
      }
    }








export {Cell, Agent, Instrument,borderCanvas};