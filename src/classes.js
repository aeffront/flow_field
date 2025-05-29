// import * as Tone from 'tone';
// import bodymovin from 'lottie-web';

const borderCanvas = document.createElement('canvas');
borderCanvas.width = window.innerWidth*2;
borderCanvas.height = window.innerHeight*2;
const borderCtx = borderCanvas.getContext('2d');
borderCanvas.setAttribute('id', 'borderCanvas');
document.body.appendChild(borderCanvas);






const master = new Tone.Gain(1).toDestination();



class LoFiVinyl {
  constructor() {
    this.input = new Tone.Gain();
    this.output = new Tone.Gain();

    // Filtres lo-fi
    const lowpass = new Tone.Filter(8000, "lowpass");
    const highpass = new Tone.Filter(400, "highpass");

    // PitchShift avec delayTime modulable
    this.pitchShift = new Tone.PitchShift({
      pitch: 0,
      windowSize: 0.1,
      delayTime: 0.05, // valeur de base
    });

    // LFO pour simuler wow/flutter en modulant delayTime
    this.wow = new Tone.LFO({
      frequency: 0.2,   // très lent
      min: 0.0,
      max: 0.01,
    }).start();

    // setInterval(() => {
    //   this.glitch();
    // }
    // , 1000);

    // Modulation directe du delayTime
    this.wow.connect(this.pitchShift.delayTime); // ✅ autorisé

    this.reverb = new Tone.Reverb({
      decay: 1,
      preDelay: 0.01,
      wet: 0.3,
      highCut: 20000,
      lowCut: 20,
    })

    // Routing audio
    this.input.chain(lowpass, highpass, this.pitchShift,this.reverb, this.output);
    this.output.connect(master);
  }

  connect(destination) {
    this.output.connect(destination);
  }

  disconnect() {
    this.output.disconnect();
  }

  glitch(){
    setTimeout(() => {
      this.input.gain.value = Math.random();
      setTimeout(() => {
        this.input.gain.value = 1;
      }
      , Math.random()*100);
    }
    , Math.random()*400);
  }
}

let colorRight = 'rgb(255, 0, 234)';
let colorLeft = 'rgb(0, 229, 255)';
let colorTop = 'rgb(255, 255, 255)';
let colorBottom = 'rgb(229, 255, 0)';


let repeatLimit = 8;

const lofiOutput = new LoFiVinyl();


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
    ctx.strokeStyle = 'rgba(47, 9, 9, 0.3)';
    ctx.strokeRect(this.x, this.y, definition, definition);
    ctx.closePath();

    ctx.beginPath();
    ctx.moveTo(this.x + definition / 2, this.y + definition / 2);
    ctx.lineTo(this.x + definition / 2 + this.vx * 10, this.y + definition / 2 + this.vy * 10);
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
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

    // Charge l'animation Lottie
    this.animation = bodymovin.loadAnimation({
      container: this.el,
      path: './public/data.json',
      renderer: 'svg', // <-- IMPORTANT: utiliser seulement 'svg' ou 'canvas' ou 'html'
      loop: false,
      autoplay: false,
      name: "agentAnim"
    });

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
    let playedNotes = [...this.instrument.playedNotes];

    if(playedNotes.length>repeatLimit){
      this.instrument.playedNotes = playedNotes.slice(playedNotes.length-repeatLimit,playedNotes.length);
    }

    if(playedNotes.every((note) => note === playedNotes[0]) && playedNotes.length >= repeatLimit){
      this.delete = true;
    }

    let cell = this.getClosestCell();
    this.closestCell = cell;
    if (!cell) return;

    this.vx *= 0.95;
    this.vy *= 0.95;
    this.vx += cell.vx * 0.6;
    this.vy += cell.vy * 0.6;

    this.x = (this.x + this.vx + window.innerWidth*2) %  (window.innerWidth*2);
    this.y = (this.y + this.vy + window.innerHeight*2) % (window.innerHeight*2);

    const rotation = Math.atan2(this.vy, this.vx)+Math.PI/2; // radians

    // Positionne et oriente la div
    this.el.style.transform = `translate(${this.x/2}px, ${this.y/2}px) rotate(${rotation}rad) scale(3)`;
    // Add a white stroke around the agent using Webkit-specific CSS
  }

  draw(ctx) {
    // plus rien ici
  }

  getNote(notes, u, v) {
    const numOctaves = notes.length;
    const notesPerOctave = notes[0].length;
  
    // Normalize u and v to [0,1)
    const uNorm = Math.max(0, Math.min(0.999999, u / this.numCols));
    const vNorm = Math.max(0, Math.min(0.999999, v / this.numRows));
  
    // Each note/octave block in normalized space
    const noteBlockWidth = 1 / notesPerOctave;
    const octaveBlockHeight = 1 / numOctaves;
  
    // Map normalized coordinates to note & octave
    const noteIndex = Math.floor(uNorm / noteBlockWidth);
    const octaveIndex = Math.floor(vNorm / octaveBlockHeight);
  
    // Clamp to valid ranges
    const clampedNote = Math.max(0, Math.min(notesPerOctave - 1, noteIndex));
    const clampedOctave = Math.max(0, Math.min(numOctaves - 1, octaveIndex));
  
  
  
    return notes[clampedOctave][clampedNote];
  }
  
  play(notes) {

    let cell = this.getClosestCell();
    this.closestCell = cell;
    this.animation.goToAndPlay(0, true);
    const noteIndex = Math.floor((this.x / this.definition + this.y / this.definition)) % notes.length;

    const note = this.getNote(notes,this.closestCell.u,this.closestCell.v)
   
    this.instrument.play(note);
  }
}

class Instrument {
  constructor(type = 0, noteLength = '64n', octave = 3,agent) {
    this.agent = agent;
    this.agentColor;
    this.type = document.getElementById('instrument_selector').value;
    this.noteLength = noteLength;
    this.octave = octave-2;
    this.playedNotes = [];

    switch(document.getElementById('instrument_selector').value){
      case "FX":
        this.noteLength = '2n';
        break;
      case "Pluck":
        this.noteLength = '8n';
        break;
      case "Pad":
        this.noteLength = '2n';
        break;
      case "Bass":
        this.noteLength = '1n';
        break;
    }

    this.reverb = new Tone.Reverb({ 
      decay: 10,
      preDelay: 0.01,
      wet: document.getElementById('instrument_selector').value == "Bass" ? 0.8 : 0.5,
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
    }).connect(this.reverb);

    // Allow overlapping notes by enabling polyphony
    this.sampler.maxPolyphony = 0; // Set the maximum number of simultaneous notes
    

    this.sampler.volume.value = -10;
    



    
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






export {Cell, Agent, Instrument, lofiOutput,borderCanvas};