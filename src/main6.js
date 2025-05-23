// Refactored version of your code
import * as Tone from 'tone';

import {Cell,Agent, Instrument,lofiOutput} from './classes.js';

const rythms = [
  {
    kickPattern : [true, false, false, false, true, false, false, false,true, false, true, false, true, false, false, false],
  snarePattern : [false, false, false, false, true, false, false, false,false, false, false, false, true, false, false, true],
  hihatPattern : [true, true, true, true, true, true, true, true,true, true, true, true, true, true, true, true],
  },
  {
    kickPattern : [true, false, true, false, true, false, false, false,true, false, true, false, true, false, true, true],
  snarePattern : [false, true, false, false, false, true, false, false,false, false, false, false, true, false, false, true],
  hihatPattern : [true, true, true, true, true, true, true, true,true, true, true, true, true, true, true, true],
  }
]

function getRandomRythm(){
  return rythms[Math.floor(Math.random() * rythms.length)];
  //return rythms[1];
}

let pixelDensity = 2;
let debug = false;
let numInstrumentTypes = 3;
let type = Math.floor(Math.random() * numInstrumentTypes);
let percussionsIsMute = true;

const kickPlayer = new Tone.Player('./public/lofi_samples/kick.wav').connect(lofiOutput.input);
const snarePlayer = new Tone.Player('./public/lofi_samples/snare.wav').connect(lofiOutput.input);
const hihatPlayer = new Tone.Player('./public/lofi_samples/hh.wav').connect(lofiOutput.input);

kickPlayer.mute = percussionsIsMute;
snarePlayer.mute = percussionsIsMute;
hihatPlayer.mute = percussionsIsMute;

const definition = 50*pixelDensity;
const notes = [
  ['C2','Db2', 'Eb2', 'F2', 'Gb2', 'Ab2', 'Bb2'],
  ['C3','Db3', 'Eb3', 'F3', 'Gb3', 'Ab3', 'Bb3'],
  ['C4','Db4', 'Eb4', 'F4', 'Gb4', 'Ab4', 'Bb4'],
  ['C5','Db5', 'Eb5', 'F5', 'Gb5', 'Ab5', 'Bb5'],
  ['C6','Db6', 'Eb6', 'F6', 'Gb6', 'Ab6', 'Bb6']
];
const isConstant = false;
const penIsActive = true;
const dampening = { factor: 0 };

let palets = [
  ['#053225','#E34A6F','#F7B2BD','#B2A198'],
  ['#336699','#86BBD8','#2F4858','#9EE493'],
  ['#EE6C4D','#F38D68','#662C91','#17A398'],
  ['#6E44FF','#B892FF','#FFC2E2','#FF90B3'],
]

let colors = palets[Math.floor(Math.random() * palets.length)];



const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
document.body.appendChild(canvas);
canvas.width = window.innerWidth*pixelDensity;
canvas.height = window.innerHeight*pixelDensity;
const width = canvas.width;
const height = canvas.height;

let numCols = Math.floor(width / definition);
let numRows = Math.floor(height / definition);

function getNote(notes,u,v){
  let posY = Math.floor(v/numRows);
  let posX = Math.floor(u/numCols);

  let octDepth = numRows/notes.length;
  let noteDepth = numCols/notes[0].length;

  let oct = posY*octDepth;
  let noteIndex = posX*noteDepth;

  let note = notes[oct][noteIndex]

  return note;

}

let restWidth = width % definition;
let restHeight = height % definition;



// ---------------------------- Init Field ----------------------------
function buildField() {
  let cells = [];
  for (let i = 0; i < numCols; i++) {
    let row = [];
    for (let j = 0; j < numRows; j++) {
      row.push(new Cell(i,j,i * definition, j * definition, isConstant ? 1 : 0, 0,restWidth, restHeight, definition, colors));
    }
    cells.push(row);
  }
  return cells;
}

let cells = buildField();

function createAgent(){
  let timeSignatures = ['2n', '4n', '8n'];
  let randomTimeSignature = timeSignatures[Math.floor(Math.random() * timeSignatures.length)];
  let randomOctave = Math.floor(Math.random() * 2) - 4;
  let randomType = type;

  let agent = new Agent(cells, null, definition, numCols, numRows);
  agent.x = globalMousePos.x;
  agent.y = globalMousePos.y;
  agent.instrument = new Instrument(randomType, randomTimeSignature, randomOctave,agent);
  agents.push(agent);

}

let agents = [];

// ---------------------------- Interaction ----------------------------
let mousePosA, mousePosB;
let globalMousePos = { x: 0, y: 0 };

function getMouseDirection() {
  const vx = (mousePosA.x - mousePosB.x) * 0.01;
  const vy = (mousePosA.y - mousePosB.y) * 0.01;

  const magnitude = Math.sqrt(vx * vx + vy * vy);

  console.log(vx, vy, magnitude);
  return {
    vx: magnitude > 0 ? vx / magnitude : 0,
    vy: magnitude > 0 ? vy / magnitude : 0
  };
}

function getMousePos(e) {
  return { x: e.clientX*pixelDensity, y: e.clientY*pixelDensity };
}

function onMouseMove(e) {
  mousePosB = mousePosA;
  mousePosA = getMousePos(e);
  if (!penIsActive) return;
  const { vx, vy } = getMouseDirection();
  let x = Math.floor(mousePosA.x / definition);
  let y = Math.floor(mousePosA.y / definition);
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      if (cells[x + i] && cells[x + i][y + j]) {

        let signX = Math.sign(vx);
        let signY = Math.sign(vy);

        let valX = Math.round(vx);
        let valY = Math.round(vy);

        valX = valX === 0 ? signX : valX;
        valY = valY === 0 ? signY : valY;


        cells[x + i][y + j].vx = valX;
        cells[x + i][y + j].vy = valY;
      }
    }
  }
}

canvas.addEventListener('mousedown', (e) => {
  mousePosA = getMousePos(e);
  canvas.addEventListener('mousemove', onMouseMove);
  canvas.addEventListener('mouseup', () => {
    canvas.removeEventListener('mousemove', onMouseMove);
  });
});

canvas.addEventListener('dblclick', (e) => {
  mousePosA = getMousePos(e);
  const { vx, vy } = { vx: 0, vy: 0 }; // Reset direction
  let x = Math.floor(mousePosA.x / definition);
  let y = Math.floor(mousePosA.y / definition);
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      if (cells[x + i] && cells[x + i][y + j]) {
        cells[x + i][y + j].vx = vx;
        cells[x + i][y + j].vy = vy;
      }
    }
  }
});

window.addEventListener('keydown', (e) => {
  if (e.key === 'd') {
    debug = !debug;
    if (debug) {
      canvas.style.backgroundColor = 'rgba(0,0,0,0.5)';
    } else {
      canvas.style.backgroundColor = '';
    }
  }
  if (e.key === 'ArrowUp') {
    dampening.factor += 0.1;
  }
  if (e.key === 'ArrowDown') {
    dampening.factor -= 0.1;
  }
});

window.addEventListener('mousemove',(e)=>{
  globalMousePos = getMousePos(e);
})

// ---------------------------- Animation ----------------------------
function damp() {
  cells.forEach(row => row.forEach(cell => {
    cell.vx *= 1 - dampening.factor * 0.1;
    cell.vy *= 1 - dampening.factor * 0.1;
  }));
}

function draw() {
  ctx.clearRect(0, 0, width, height);
  cells.forEach(row => row.forEach(cell => cell.draw(ctx,debug,definition,colors)));
  agents.forEach(agent => {
    agent.update();
    agent.draw(ctx);
  });
}

// ---------------------------- Main Loop ----------------------------

let mainAnim;
function stopMain() {
  cancelAnimationFrame(mainAnim);
}

function main() {
  draw();
  damp();
  mainAnim = requestAnimationFrame(main);
}

// ---------------------------- Audio Start ----------------------------
function startAudio() {
  Tone.start();
  Tone.Transport.start();
  Tone.Transport.cancel();
  agents.forEach(agent => {
    Tone.Transport.scheduleRepeat(() => agent.play(notes), agent.instrument.noteLength);
  });
  Tone.Transport.swing = 0.;
  Tone.Transport.swingSubdivision = '16n';
  main();
  window.removeEventListener('click', startAudio);

  let pattern = getRandomRythm();

  let kickPattern = pattern.kickPattern;
  let snarePattern= pattern.snarePattern;
  let hihatPattern= pattern.hihatPattern;
  let step = 0;

  Tone.Transport.scheduleRepeat(() => {
    if (kickPattern[step]) {
      kickPlayer.start();
    }
    if (snarePattern[step]) {
      snarePlayer.start();
    }
    if (hihatPattern[step]) {
      hihatPlayer.start();
    }
    step = (step + 1) % kickPattern.length;
  }, '8n');
}

function stopAudio() {
  Tone.Transport.stop();
  Tone.Transport.cancel();
  window.addEventListener('click', startAudio);
  stopMain();

}

window.addEventListener('click', startAudio);
window.addEventListener('keydown', (e) => {
  if (e.key === ' ') {
    if (Tone.Transport.state === 'started') {
      stopAudio();
    } 
  }
  if (e.key === 'n') {
    if (Tone.Transport.state === 'started') {
      stopAudio();
    } 
    createAgent();
    startAudio();
  }
  if (e.key === 'r') {
    
      stopAudio();
      const agentElement = document.querySelector('.agent');
      if (agentElement) {
        document.body.removeChild(agentElement);
      }
      type = Math.floor(Math.random() * numInstrumentTypes);
      agents.forEach(agent => {
        agent.animation.destroy();
      });
      agents = [];
      cells.forEach(row => row.forEach(cell => {
        cell.vx = 0;
        cell.vy = 0;
      }));

      ctx.clearRect(0, 0, width, height);
      type = Math.floor(Math.random() * numInstrumentTypes);
      colors = palets[Math.floor(Math.random() * palets.length)];
      
  }
  if (e.key === 'm') {
    Tone.Destination.mute = !Tone.Destination.mute;
  }
  if (e.key === 'h') {
    if(document.getElementById('keys').style.display=="block")document.getElementById('keys').style.display = 'none';
    else document.getElementById('keys').style.display = 'block';

  }
  if(e.key =='p'){
    console.log("p")
    percussionsIsMute = !percussionsIsMute;

    if(percussionsIsMute){
      kickPlayer.mute = true;
      hihatPlayer.mute = true;
      snarePlayer.mute = true;
    }
    else{
      kickPlayer.mute = false;
      hihatPlayer.mute = false;
      snarePlayer.mute = false;

    }
  }

});