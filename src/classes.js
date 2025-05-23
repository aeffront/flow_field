import * as Tone from 'tone';
import bodymovin from 'lottie-web';

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
    this.output.toDestination();
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




const lofiOutput = new LoFiVinyl();


class Cell {
  constructor(u,v,x, y, vx = 0, vy = 0, restWidth, restHeight ) {
    this.u = u;
    this.v = v;
    this.x = x+restWidth / 2;
    this.y = y+restHeight / 2;
    this.vx = vx;
    this.vy = vy;

    this.img = new Image();
    this.img.src = './public/cursor.png';
  }

  draw(ctx,debug = false,definition,colors) {

    if(debug){
    const hue = this.vx === 1 ? 120 : this.vx === -1 ? 0 : 60;
    const sat = this.vy === 1 ? 100 : this.vy === -1 ? 0 : 50;

    

    ctx.beginPath();
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
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

      if(this.vx == 0 && this.vy == 0){
        ctx.fillStyle = 'white';
        ctx.fillRect(this.x, this.y, definition, definition);
      }
      if(this.vx==1){
        ctx.fillStyle = 'rgb(0, 189, 0)';
        ctx.fillRect(this.x, this.y, definition, definition);

        if(this.vy == 1){
        ctx.fillStyle = 'grey';
        ctx.fillRect(this.x, this.y, definition/2, definition/2);
        ctx.fillRect(this.x+definition/2, this.y+definition/2, definition/2, definition/2);
        }else if(this.vy == -1){
          ctx.fillStyle = 'black';
          ctx.fillRect(this.x, this.y, definition/2, definition/2);
          ctx.fillRect(this.x+definition/2, this.y+definition/2, definition/2, definition/2);
        }
       
      }
      else if(this.vx==-1){
        ctx.fillStyle = 'rgb(226, 138, 79)';
        ctx.fillRect(this.x, this.y, definition, definition);
        if(this.vy == 1){
          ctx.fillStyle = 'rgb(125, 125, 125)';
          ctx.fillRect(this.x, this.y, definition/2, definition/2);
          ctx.fillRect(this.x+definition/2, this.y+definition/2, definition/2, definition/2);
        }else if(this.vy == -1){
          ctx.fillStyle = 'rgb(0, 0, 0)';
          ctx.fillRect(this.x, this.y, definition/2, definition/2);
          ctx.fillRect(this.x+definition/2, this.y+definition/2, definition/2, definition/2);
        }
       
      }
      else if(this.vx == 0 && this.vy != 0){
        if(this.vy == 1){
          ctx.fillStyle = 'rgb(135, 135, 135)';
          ctx.fillRect(this.x, this.y, definition, definition);
        }
        else if(this.vy == -1){
          ctx.fillStyle = 'rgb(0, 0, 0)';
          ctx.fillRect(this.x, this.y, definition, definition);
        }
      }


      
      // let colorIndex = this.vx === 1 ? 0 : this.vx === -1 ? 1 : 2;
      // ctx.fillStyle = colors[colorIndex];
      // if(this.vx == 0 && this.vy == 0){
      //   ctx.fillStyle = 'white';
      // }
      // ctx.beginPath();
      // ctx.roundRect(this.x, this.y, definition, definition, 0
      // );
      // ctx.fill();

      // ctx.save();
      // ctx.translate(this.x + definition / 2, this.y + definition / 2);
      // if (this.vx !== 0 || this.vy !== 0) {
      //   ctx.rotate(Math.atan2(this.vy, this.vx)+Math.PI);
      // }
      // //ctx.drawImage(this.img, -definition / 2, -definition / 2, definition, definition);
      // ctx.restore();

      
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
    let cell = this.getClosestCell();
    this.closestCell = cell;
    if (!cell) return;

    this.vx *= 0.95;
    this.vy *= 0.95;
    this.vx += cell.vx * 0.4;
    this.vy += cell.vy * 0.4;

    this.x = (this.x + this.vx + window.innerWidth*2) %  (window.innerWidth*2);
    this.y = (this.y + this.vy + window.innerHeight*2) % (window.innerHeight*2);

    const rotation = Math.atan2(this.vy, this.vx)+Math.PI/2; // radians

    // Positionne et oriente la div
    this.el.style.transform = `translate(${this.x/2}px, ${this.y/2}px) rotate(${rotation}rad)`;
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
  
    // Debug output
    console.log(`DEBUG: Clamped Octave: ${clampedOctave} Clamped Note: ${clampedNote} Octave Index: ${octaveIndex} Note Index: ${noteIndex}`);
  
    return notes[clampedOctave][clampedNote];
  }
  
  
  
  
  
  

  play(notes) {

    let cell = this.getClosestCell();
    this.closestCell = cell;
    console.log(cell);
    this.animation.goToAndPlay(0, true);
    const noteIndex = Math.floor((this.x / this.definition + this.y / this.definition)) % notes.length;

    const note = this.getNote(notes,this.closestCell.u,this.closestCell.v)
    console.log(note);
   
    this.instrument.play(note);
  }
}

class Instrument {
  constructor(type = 0, noteLength = '64n', octave = 3,agent) {
    this.agent = agent;
    this.agentColor;
    this.type = type;
    this.noteLength = noteLength;
    this.octave = octave-10;

    this.reverb = new Tone.Reverb({ 
      decay: 10,
      preDelay: 0.01,
      wet: 0.3
    }).connect(lofiOutput.input);

    this.baseUrl;

    // switch (this.type) {
    //   case 0:
    //     this.baseUrl = './public/piano_samples/';
    //     break;
    //   case 1:
    //     this.baseUrl = './public/synth_samples/';
    //     break;
    //   default:
    //     this.baseUrl = './public/guitare_samples/';
    // }

    console.log(document.getElementById('instrument_selector').value);

    switch (document.getElementById('instrument_selector').value) {
      case "Piano":
        this.baseUrl = './public/piano_samples/';
        this.agentColor = 'red';
        break;
      case "Guitar":
        this.baseUrl = './public/synth_samples/';
        this.agentColor = 'blue';
        break;
      case "Synth":
        this.baseUrl = './public/guitare_samples/';
        this.agentColor = 'green';
      case "Vox":
        this.baseUrl = './public/vox_samples/';
        this.agentColor = 'yellow';
      case "Bass":
        this.baseUrl = './public/bass_samples/';
        this.agentColor = 'purple';
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

    

    console.log('Initial instrument selector value:', document.getElementById('instrument_selector').value, 'Base URL:', this.baseUrl);

    document.getElementById('instrument_selector').addEventListener('change', (event) => {
      console.log(event.target.value);
      switch (event.target.value) {
        case "Piano":
          this.baseUrl = './public/piano_samples/';
          break;
        case "Guitar":
          this.baseUrl = './public/synth_samples/';
          break;
        case "Synth":
          this.baseUrl = './public/guitare_samples/';
        case "Vox":
          this.baseUrl = './public/vox_samples/'
        case "Bass":
          this.baseUrl = './public/bass_samples/';
      }
    });


    

    this.sampler = new Tone.Sampler({
      urls: {
      'C1': '036_c1.wav',
      'C2': '048_c2.wav',
      'C3': '060_c3.wav',
      'C4': '072_c4.wav',
      'C5': '084_c5.wav',
      'C6': '096_c6.wav',
      },
      baseUrl: this.baseUrl,
      onload: () => {
      console.log('Sampler loaded');
      }
    }).connect(this.reverb);

    // Allow overlapping notes by enabling polyphony
    this.sampler.maxPolyphony = 10; // Set the maximum number of simultaneous notes
    

    this.sampler.volume.value = -10;
    



    
  }

  play(note) {

    if (typeof note !== 'string' && typeof note !== 'number') {
      console.error('Invalid note:', note);
      return;
    }

    let n = typeof note === 'number' ? note + this.octave : note + this.octave;

    if (this.sampler.loaded) {
      this.sampler.triggerAttackRelease(n, this.noteLength);
    } else {
      console.warn('Sampler not loaded yet.');
    }
    
  }
}







export {Cell, Agent, Instrument, lofiOutput};