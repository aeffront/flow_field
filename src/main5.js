import * as Tone from 'tone';
import * as dat from 'dat.gui';

class Cell{
  constructor(x, y, vx,vy){
    this.x = x;
    this.y = y;
    this.vx = vx ;
    this.vy = vy;
  }

  draw(ctx){

    let h ;

    switch (this.vx) {
      case 1:
        h = 120;
        break;
      case -1:
        h = 0;
        break;
      default:
        h = 60;
    }

    let s = 0;

    switch (this.vy) {
      case 1:
        s = 100;
        break;
      case -1:
        s = 0;
        break;
      default:
        s = 50;
    }

    
    // Draw square outline
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.strokeRect(this.x, this.y, definition, definition);
    ctx.closePath();

    // Draw vector
    ctx.beginPath();
    ctx.moveTo(this.x + definition / 2, this.y + definition / 2);
    ctx.lineTo(this.x + definition / 2 + this.vx * 10, this.y + definition / 2 + this.vy * 10);
    ctx.strokeStyle = `black`;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.closePath();
  }
}

class Agent {
  constructor(u, v, cells, instrument) {
    this.instrument = instrument;
    this.note;
    this.cells = cells; // Store reference to cells
    this.u = this.wrapPosition(u, cells.length);
    this.v = this.wrapPosition(v, cells[0].length);
    this.currentCell = cells[Math.floor(this.u)][Math.floor(this.v)];
    this.vx = this.currentCell.vx;
    this.vy = this.currentCell.vy;
    this.nu = this.wrapPosition(this.u + this.vx, cells.length);
    this.nv = this.wrapPosition(this.v + this.vy, cells[0].length);
    this.nextCell = cells[Math.floor(this.nu)][Math.floor(this.nv)];
  }

  wrapPosition(value, max) {
    // Ensure the position wraps around within the bounds of the grid
    return (value + max) % max;
  }

  update() {
    this.u = this.nu;
    this.v = this.nv;
    this.currentCell = this.nextCell;
    this.vx = this.currentCell.vx;
    this.vy = this.currentCell.vy;
    this.nu = this.wrapPosition(this.u + this.vx, this.cells.length);
    this.nv = this.wrapPosition(this.v + this.vy, this.cells[0].length);
    this.nextCell = this.cells[Math.floor(this.nu)][Math.floor(this.nv)];
    this.getNote();
    this.instrument.play(this.note);
  }

  getNote() {
    let noteIndex = (Math.floor(this.u) + Math.floor(this.v)) % notes.length;
    this.note = notes[noteIndex];
  }

  draw(ctx) {
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(
      this.u * definition + definition * 0.5,
      this.v * definition + definition * 0.5,
      definition / 2,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.closePath();
  }
}

class Instrument{
  constructor(type,noteLength,octave){
    this.type = type;
    this.noteLength = noteLength;
    this.octave = octave;

    this.attack;

    this.envelope ;

    this.oscillator ;

    

    switch (this.type){
      case 0 : 
      this.envelope = new Tone.AmplitudeEnvelope({
        attack: 0.001,
        decay: 0.2,
        sustain: 0.3,
        release: 0.,
      }).toDestination();

     

      this.filter = new Tone.Filter({
        type: 'highpass',
        frequency: 1000,
        Q: 1,
      }).connect(this.envelope);

      this.filterEvelope = new Tone.FrequencyEnvelope({
        attack: 0.001,
        baseFrequency: "C2",
        octaves: 4
    }).connect(this.filter.frequency);

     

      this.oscillator =new Tone.Oscillator({
        type: 'sawtooth',
        frequency: 500,
      }).connect(this.filter).start();

      break;

      case 1:
      this.envelope = new Tone.AmplitudeEnvelope({
        attack: 0.01,
        decay: 0.1,
        sustain: 0.2,
        release: 0.,
      }).toDestination();

      this.bitBreaker = new Tone.BitCrusher({
        bits: 2,
      }).connect(this.envelope);

      this.filter = new Tone.Filter({
        type: 'lowpass',
        frequency: 50,
        rolloff: -24,
        Q: 1,
      }).connect(this.bitBreaker);

      this.filterEvelope = new Tone.FrequencyEnvelope({
        attack: 0.001,
        baseFrequency: "C2",
        octaves: 4
    }).connect(this.filter.frequency);

      this.oscillator = new Tone.Oscillator({
        type: 'sawtooth',
        frequency: 50,
      }).connect(this.filter).start();
        break;
      
      case 2:
      this.envelope = new Tone.AmplitudeEnvelope({
        attack: 0.01,
        decay: 0.1,
        sustain: 0.2,
        release: 0.,
      }).toDestination();
      this.bitBreaker = new Tone.BitCrusher({
        bits: 2,
      }).connect(this.envelope);
      this.filter = new Tone.Filter({
        type: 'lowpass',
        frequency: 50,
        rolloff: -24,
        Q: 1, 

      }).connect(this.bitBreaker);
      this.filterEvelope = new Tone.FrequencyEnvelope({
        attack: 0.001,
        baseFrequency: "C2",
        octaves: 4
    }).connect(this.filter.frequency);
      this.oscillator = new Tone.Oscillator({
        type: 'sawtooth',
        frequency: 50,
      }).connect(this.filter).start();
        break;
      }
    
    
  }
  play(note){
    if(this.type==0)this.oscillator.frequency.setValueAtTime(Tone.Frequency(note).transpose(this.octave).toFrequency(), Tone.now());
    this.envelope.triggerAttackRelease( this.noteLength);
    this.filterEvelope.triggerAttackRelease(this.noteLength);
  }
}


const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
document.body.appendChild(canvas);

const width = canvas.width = window.innerWidth;
const height = canvas.height =window.innerHeight;

const gui = new dat.GUI();
const settings = {
  gridVisible: true,
  particlesVisible: true,
  dampeningFactor: 0.99,
  definition: 10,
  isConstant: false,
  penIsActive: true,
};

const guiELement = gui.domElement
guiELement.classList.add('gui');

let gridIsVisible = false;
let particlesVisible = true;
let definition = 40;
let isConstant = false;
let penIsActive = false;
let penSize = definition*0.01;

gui.add(settings, 'penIsActive').onChange(value => {
  penIsActive = value;
});

gui.add(settings, 'gridVisible').onChange(value => {
  gridIsVisible = value;
});

gui.add(settings, 'particlesVisible').onChange(value => {
  particlesVisible = value;
});

const dampening = { factor: 0 };


var folder1 = gui.addFolder('Flow Field');
folder1.add(dampening, 'factor', 0, 1).step(0.01).name('Dampening Factor');
folder1.add({ buildField: buidField }, 'buildField')
folder1.add(settings, 'definition', 1, 100).step(1).name('Definition').onChange(value => {
  definition = value;
  numCols = Math.floor(width / definition);
  numRows = Math.floor(height / definition);
  buidField();
}
);

folder1.add(settings, 'isConstant').onChange(value => {
  isConstant = value;
  buidField();
});






let numCols = Math.floor(width / definition);
let numRows = Math.floor(height / definition);


function damp(){
  cells.forEach(row => {
    row.forEach(cell => {
      cell.vx *= 1-(dampening.factor*0.1);
      cell.vy *= 1-(dampening.factor*0.1);
    });
  });
}




function buidField(){

let cells=[];
for (let i = 0; i < numCols; i++) {
  let row = [];
  for (let j = 0; j < numRows; j++) {
    const cell = new Cell(i * definition, j * definition, 0,0);
    cell.vx = isConstant ? 1 : 0;
    cell.vy = 0;
    row.push(cell);
  }
  cells.push(row);

}
return cells;

}

let notes = ['C4', 'E4', 'G4', 'B4', 'D5', 'F5', 'A5'];

// Function to find compatible note pairs
function findCompatiblePairs(notes) {
  const compatiblePairs = [];
  for (let i = 0; i < notes.length; i++) {
    for (let j = i + 1; j < notes.length; j++) {
      // Check if the interval between notes is consonant
      const interval = Math.abs(Tone.Frequency(notes[i]).toMidi() - Tone.Frequency(notes[j]).toMidi());
      if ([0, 3, 4, 5, 7, 8, 9].includes(interval % 12)) {
        compatiblePairs.push([notes[i], notes[j]]);
      }
    }
  }
  return compatiblePairs;
}

const compatibleNotePairs = findCompatiblePairs(notes);
console.log('Compatible Note Pairs:', compatibleNotePairs);

let cells = buidField();

let agents = [];
let agentA = new Agent(10, 10, cells,new Instrument(0, '64n',3));
agents.push(agentA);
let agentB = new Agent(20, 20, cells,new Instrument(1, '8n',-8));
agents.push(agentB);
let agentC = new Agent(30, 30, cells,new Instrument(2, '16n',-3));
agents.push(agentC);
console.log(cells);


let mousePosA
let mousePosB

let mouseDir

function getMouseDirection(){
  let vx = (mousePosA.x - mousePosB.x)*0.1;
  let vy = (mousePosA.y - mousePosB.y)*0.1;
  return {vx, vy}
}

function getMousePos(e){
  return {x: e.clientX, y: e.clientY}
}

function onMouseMove(e){
  mousePosB = mousePosA;
  mousePosA = getMousePos(e);
  if(penIsActive){
    
  
  mouseDir = getMouseDirection();

  let x = Math.floor(mousePosA.x / definition);
  let y = Math.floor(mousePosA.y / definition);

  let pensize = 1;

  for(let i = -pensize; i <= pensize; i++){
    for(let j = -pensize; j <= pensize; j++){
      if (cells[x + i] && cells[x + i][y + j]){
        const roundedVx = Math.sign(mouseDir.vx);
        const roundedVy = Math.sign(mouseDir.vy);
        cells[x + i][y + j].vx = roundedVx;
        cells[x + i][y + j].vy = roundedVy;
      }
    }
  }
  }
  else{
    
  }
  
}

canvas.addEventListener('mousedown', (e) => {
  mousePosA = getMousePos(e)
  canvas.addEventListener('mousemove', onMouseMove);
  canvas.addEventListener('mouseup', () => {
    canvas.removeEventListener('mousemove', onMouseMove);
  });
});

canvas.addEventListener('touchstart', (e) => {
  mousePosA = getMousePos(e.touches[0]);
  canvas.addEventListener('touchmove', onTouchMove);
  canvas.addEventListener('touchend', () => {
    canvas.removeEventListener('touchmove', onTouchMove);
  });
});

function onTouchMove(e) {
  onMouseMove(e.touches[0]);
}

function draw(ctx){
  ctx.clearRect(0, 0, width, height);
  cells.forEach(row => {
    row.forEach(cell => {
      cell.draw(ctx);
    });
  });
  agents.forEach(agent => {
    agent.draw(ctx);
  });

}

function main(){
  

  draw(ctx);
  damp()
  requestAnimationFrame(main);
}

let Transport;

function startAudio(){
  Tone.start();
  Tone.Transport.start();
  console.log('Audio started');
  main();
  window.removeEventListener('click', startAudio);
  Tone.Transport.scheduleRepeat(() => {
    agentA.update();
    agentA.draw(ctx);
    
  }, '16n');
  Tone.Transport.scheduleRepeat(() => {
    agentB.update();
    agentB.draw(ctx);
  }, '4n');
  Tone.Transport.scheduleRepeat(() => {
    agentC.update();
    agentC.draw(ctx);
  }, '8n');

  // Add swing to the Transport
  Tone.Transport.swing = 0.5; // Adjust swing intensity (0 to 1)
  Tone.Transport.swingSubdivision = '8n'; // Apply swing to 8th notes

}

window.addEventListener('click', startAudio);

