

import {Cell,Agent, Instrument,borderCanvas} from './classes.js';

let pixelDensity = 2;
let debug = false;
let numInstrumentTypes = 3;
let type = Math.floor(Math.random() * numInstrumentTypes);
let percussionsIsMute = true;

const drumBuss = new Tone.Gain(0.4).toDestination();

const kickPlayer = new Tone.Player('./public/lofi_samples/kick.wav').connect(drumBuss);
const snarePlayer = new Tone.Player('./public/lofi_samples/snare.wav').connect(drumBuss);
const hihatPlayer = new Tone.Player('./public/lofi_samples/hh.wav').connect(drumBuss);

kickPlayer.mute = percussionsIsMute;
snarePlayer.mute = percussionsIsMute;
hihatPlayer.mute = percussionsIsMute;

const definition = 20*pixelDensity;
const notes = [
  ['C0', 'D0', 'Eb0', 'F0', 'G0', 'Ab0', 'Bb0'],
  ['C1', 'D1', 'Eb1', 'F1', 'G1', 'Ab1', 'Bb1'],
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
canvas.setAttribute('id','mainCanvas')
const ctx = canvas.getContext('2d');
document.body.appendChild(canvas);
borderCanvas.width = canvas.width = window.innerWidth*pixelDensity;
borderCanvas.height = canvas.height = window.innerHeight*pixelDensity;
const width = canvas.width;
const height = canvas.height;

let numCols = Math.floor(width / definition);
let numRows = Math.floor(height / definition);

let restWidth = width % definition;
let restHeight = height % definition;



let cells = [];

function buildRandomField(){
  let cells = [];
  for (let i = 0; i < numCols; i++) {
    let row = [];
    for (let j = 0; j < numRows; j++) {
      let val  = Math.round(Math.random() * 2);
      

      row.push(new Cell(i, j, i * definition, j * definition, 1, 1, restWidth, restHeight, definition, colors));
    }
    cells.push(row);
  }
  return cells;
}

cells = buildRandomField();




 cells.forEach(row => row.forEach(cell => cell.draw(ctx,false,definition,colors)));



function startApp(){


 

const landingText = document.getElementById("landing_text")
        window.addEventListener('click', function() {
           borderCanvas.getContext('2d').clearRect(0, 0, width, height);

          this.document.getElementById('landing_text').classList.add("hide");

          
          
          Array.from(landingText.childNodes).forEach(child => {
            document.getElementById('landing_text').classList.add("hidden");
            


            if (child.nodeType === Node.ELEMENT_NODE) {
              child.classList.add("hide");
            }
          });
        });






// ---------------------------- Init Field ----------------------------
function buildField(x,y) {
  let cells = [];
  for (let i = 0; i < numCols; i++) {
    let row = [];
    for (let j = 0; j < numRows; j++) {
      row.push(new Cell(i,j,i * definition, j * definition, 0, 0,restWidth, restHeight, definition, colors));
      
    }
    cells.push(row);
  }
  return cells;
}



 cells = buildField();

function createAgent(){

  if( agents.length >= 3){
    agents[0].instrument.wavetable.stop();
    removeAgent(agents[0]);
  }
  let instrument =  new Instrument();

  let agent = new Agent(cells, instrument, definition, numCols, numRows);
  instrument.wavetable.agentEl = agent.el;
  instrument.agent = agent;
  agent.x = globalMousePos.x;
  agent.y = globalMousePos.y;
  agents.push(agent);

  return agent;

}

let agents = [];

// ---------------------------- Interaction ----------------------------
let mousePosA, mousePosB;
let globalMousePos = { x: 0, y: 0 };

function getMouseDirection() {
  const vx = (mousePosA.x - mousePosB.x) * 0.01;
  const vy = (mousePosA.y - mousePosB.y) * 0.01;

  const magnitude = Math.sqrt(vx * vx + vy * vy);

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

  let penSize = 4;
  for (let i = -penSize; i <= penSize; i++) {
    for (let j = -penSize; j <= penSize; j++) {
      if (cells[x + i] && cells[x + i][y + j]) {

        let signX = Math.sign(vx);
        let signY = Math.sign(vy);

        let valX = Math.round(vx);
        let valY = Math.round(vy);

        valX = valX === 0 ? valX : signX;
        valY = valY === 0 ? valY : signY;


        cells[x + i][y + j].vx = valX;
        cells[x + i][y + j].vy = valY;

       
      }
      if(i == -penSize){
        cells[x + i][y + j].borderLeft = true;

        if(j == -penSize){
          cells[x + i][y + j].borderTop = true;
        }
        if(j == penSize-1){
          cells[x + i][y + j].borderBottom = true;
        }
      }
      else if(i == penSize-1){
        cells[x + i][y + j].borderRight = true;

        if(j == -penSize){
          cells[x + i][y + j].borderTop = true;
        }
        if(j == penSize-1){
          cells[x + i][y + j].borderBottom = true;
        }
      }
      else if(j == -penSize){
        cells[x + i][y + j].borderTop = true;
        if(i == -penSize){
          cells[x + i][y + j].borderLeft = true;
        }
        if(i == penSize-1){
          cells[x + i][y + j].borderRight = true;
        }
      }
      else if(j == penSize-1){
        cells[x + i][y + j].borderBottom = true;
        if(i == -penSize){
          cells[x + i][y + j].borderLeft = true;
        }
        if(i == penSize-1){
          cells[x + i][y + j].borderRight = true;
        }
      }
      else{
        cells[x + i][y + j].borderTop = false;
        cells[x + i][y + j].borderBottom = false;
        cells[x + i][y + j].borderLeft = false;
        cells[x + i][y + j].borderRight = false;
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

canvas.addEventListener('touchstart', (e) => {
  if (e.touches.length > 0) {
    const touch = e.touches[0];
    mousePosA = getMousePos(touch);
    const touchMoveHandler = (moveEvent) => {
      if (moveEvent.touches.length > 0) {
        onMouseMove(moveEvent.touches[0]);
      }
    };
    const touchEndHandler = () => {
      canvas.removeEventListener('touchmove', touchMoveHandler);
      canvas.removeEventListener('touchend', touchEndHandler);
    };
    canvas.addEventListener('touchmove', touchMoveHandler);
    canvas.addEventListener('touchend', touchEndHandler);
  }
}, { passive: false });

window.addEventListener('mousemove', (e) => {
  globalMousePos = getMousePos(e);
});

window.addEventListener('touchmove', (e) => {
  if (e.touches.length > 0) {
    globalMousePos = getMousePos(e.touches[0]);
  }
}, { passive: false });

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
  
  console.log("starting audio");
  Tone.start();
  Tone.Transport.bpm.value = 130;
  Tone.Transport.start();

  agents.forEach(agent => {
  agent.instrument.wavetable.start();
});
   

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
      const agentElement = document.querySelector('.agent');
      if (agentElement) {
        document.body.removeChild(agentElement);
      }
      type = Math.floor(Math.random() * numInstrumentTypes);
      agents.forEach(agent => {
        agent.instrument.wavetable.stop();
        agent.el.remove();
      });
      agents = [];
      cells.forEach(row => row.forEach(cell => {
        cell.vx = 0;
        cell.vy = 0;
      }));

      ctx.clearRect(0, 0, width, height);
      let borderCtx = borderCanvas.getContext('2d');
      borderCtx.clearRect(0, 0, width, height);

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

  if(e.key === 'd'){
    debug = !debug;
   
  }

});

function removeAgent(agent){
  agent.delete = true;
  agent.el.remove();
  agents.splice(agents.indexOf(agent), 1);
}


window.addEventListener('keydown', (e) => {
  if (e.key === '&') {
    document.getElementById('instrument_selector').value = "FX";
   if (Tone.Transport.state === 'started') {
      stopAudio();
    } 
    let agent = createAgent();
    agent.instrument.wavetable.octave = 0;
    startAudio();
  }
  else if (e.key === 'é') {
    document.getElementById('instrument_selector').value = "Pluck";
    if (Tone.Transport.state === 'started') {
      stopAudio();
    } 
    let agent = createAgent();
    agent.instrument.wavetable.octave = 1;
    startAudio();
  }
  else if (e.key === '"') {
    document.getElementById('instrument_selector').value = "Pad";
   if (Tone.Transport.state === 'started') {
      stopAudio();
    } 
    let agent = createAgent();
    agent.instrument.wavetable.octave = 2;
    startAudio();
  }
  else if (e.key === "'") {
    document.getElementById('instrument_selector').value = "Bass";
   if (Tone.Transport.state === 'started') {
      stopAudio();
    } 
    let agent = createAgent();
    agent.instrument.wavetable.octave = 3;
    startAudio();
  }
  else if (e.key === '(') {
    document.getElementById('instrument_selector').value = "Vox";
   if (Tone.Transport.state === 'started') {
      stopAudio();
    } 
    let agent = createAgent();
    agent.instrument.wavetable.octave = 4;
    startAudio();
  }
});

window.addEventListener('buttonPressed', (event) => {

  const button = event.detail;
  console.log(`Button pressed: ${button}`);
  if (button === 'button1') {
    document.getElementById('instrument_selector').value = "FX";
    if (Tone.Transport.state === 'started') {
      stopAudio();
    } 
    createAgent();
    startAudio();
  } else if (button === 'button2') {
    document.getElementById('instrument_selector').value = "Pluck";
    if (Tone.Transport.state === 'started') {
      stopAudio();
    }
    createAgent();
    startAudio();
  }
  else if (button === 'button3') {
    document.getElementById('instrument_selector').value = "Pad";
    if (Tone.Transport.state === 'started') {
      stopAudio();
    } 
    createAgent();
    startAudio();
  } else if (button === 'button4') {
    document.getElementById('instrument_selector').value = "Bass";
    if (Tone.Transport.state === 'started') {
      stopAudio();
    }
    createAgent();  
    startAudio();
  }
  else if (button === 'button5') {
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
      let borderCtx = borderCanvas.getContext('2d');
      borderCtx.clearRect(0, 0, width, height);

      type = Math.floor(Math.random() * numInstrumentTypes);
      colors = palets[Math.floor(Math.random() * palets.length)];
      
  }
}
);

}


export {startApp}