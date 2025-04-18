// Refactored version of your code
import * as Tone from 'tone';

import {Cell,Agent, Instrument} from './classes.js';

let pixelDensity = 2;
let debug = false;
let numInstrumentTypes = 2;
let type = Math.floor(Math.random() * numInstrumentTypes);

const definition = 50*pixelDensity;
const notes = [
  'Db3', 'Eb3', 'F3', 'Gb3', 'Ab3', 'Bb3', 'C4',
  'Db4', 'Eb4', 'F4', 'Gb4', 'Ab4', 'Bb4', 'C5',
  'Db5', 'Eb5', 'F5', 'Gb5', 'Ab5', 'Bb5', 'C6'
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

document.getElementById('keys').style.color = colors[0];
  document.getElementById('keys').style.backgroundColor = colors[1];
  document.getElementById('keys_table').style.color = colors[0];

const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
document.body.appendChild(canvas);
canvas.width = window.innerWidth*pixelDensity;
canvas.height = window.innerHeight*pixelDensity;
const width = canvas.width;
const height = canvas.height;

let numCols = Math.floor(width / definition);
let numRows = Math.floor(height / definition);

let restWidth = width % definition;
let restHeight = height % definition;



// ---------------------------- Init Field ----------------------------
function buildField() {
  let cells = [];
  for (let i = 0; i < numCols; i++) {
    let row = [];
    for (let j = 0; j < numRows; j++) {
      row.push(new Cell(i * definition, j * definition, isConstant ? 1 : 0, 0,restWidth, restHeight, definition, colors));
    }
    cells.push(row);
  }
  return cells;
}

let cells = buildField();

function createAgent(){
  let timeSignatures = ['2n', '4n', '8n'];
  let randomTimeSignature = timeSignatures[Math.floor(Math.random() * timeSignatures.length)];
  let randomOctave = Math.floor(Math.random() * 6) - 2;
  let randomType = type;

  let agent = new Agent(cells, new Instrument(randomType, randomTimeSignature, randomOctave), definition, numCols, numRows);
  agents.push(agent);

}

let agents = [];

// ---------------------------- Interaction ----------------------------
let mousePosA, mousePosB;

function getMouseDirection() {
  return {
    vx: (mousePosA.x - mousePosB.x) * 0.1,
    vy: (mousePosA.y - mousePosB.y) * 0.1
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
        cells[x + i][y + j].vx = Math.sign(vx);
        cells[x + i][y + j].vy = Math.sign(vy);
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
  agents.forEach(agent => {
    Tone.Transport.scheduleRepeat(() => agent.play(notes), agent.instrument.noteLength);
  });
  Tone.Transport.swing = 0.5;
  Tone.Transport.swingSubdivision = '16n';
  main();
  window.removeEventListener('click', startAudio);
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
      document.body.removeChild(document.querySelector('.agent'));
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
      
  }
  if (e.key === 'm') {
    Tone.Destination.mute = !Tone.Destination.mute;
  }
  if (e.key === 'h') {
    if(document.getElementById('keys').style.display=="block")document.getElementById('keys').style.display = 'none';
    else document.getElementById('keys').style.display = 'block';

  }

});