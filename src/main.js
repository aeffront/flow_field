import * as Tone from 'tone';
import * as dat from 'dat.gui';


const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
document.body.appendChild(canvas);

const width = canvas.width = window.innerWidth;
const height = canvas.height =window.innerHeight;

const gui = new dat.GUI();
const settings = {
  gridVisible: false,
  particlesVisible: true,
  dampeningFactor: 0.99,
  definition: 10,
  isConstant: false,
  penIsActive: false,
};

const guiELement = gui.domElement
guiELement.classList.add('gui');

let gridIsVisible = false;
let particlesVisible = true;
let definition = 10;
let isConstant = false;
let penIsActive = false;
let penSize = 5;

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









let cells = [];

let numCols = Math.floor(width / definition);
let numRows = Math.floor(height / definition);

class Cell{
  constructor(x, y, vx,vy){
    this.x = x;
    this.y = y;
    this.vx = vx ;
    this.vy = vy;
  }
}

class particle{
  constructor(value){
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.vx = 0;
    this.vy = 0;



  }

  update(){
    let x = Math.floor(this.x / definition);
    let y = Math.floor(this.y / definition);
    let avgVx = 0;
    let avgVy = 0;
    let count = 0;
    this.life -=1;
   

    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
      if (x + i >= 0 && x + i < numCols && y + j >= 0 && y + j < numRows) {
        avgVx += cells[x + i][y + j].vx;
        avgVy += cells[x + i][y + j].vy;
        count++;
      }
      }
    }

    if (count > 0) {
      avgVx /= count;
      avgVy /= count;
    }

    this.vx += avgVx;
    this.vy += avgVy;

    this.vx *= 0.6;
    this.vy *= 0.6;

    this.x += this.vx;
    this.y += this.vy;

    if (this.life <= 0) {
      
    particles = particles.filter(p => p !== this);

      
    }

    
  }

  getColor(){
    let r = Math.min(255, Math.max(0, 100 + this.vx * 10));
    let g = Math.min(255, Math.max(0, 50 + Math.abs(this.vy) * 100));
    let b = 70;
    let a = Math.min(1, Math.max(0, this.life / 1000));
    return `rgba(${0}, ${0}, ${0}, ${a})`;
  }

  draw(){
    ctx.beginPath();
    ctx.fillStyle = 'black'; 
    const size = 1;
    ctx.font = 'bold 12px Arial';
    ctx.beginPath();
   
    ctx.arc(this.x, this.y, size, 0, Math.PI * 2);
    ctx.fill()
    ctx.closePath();
    
   
  }
}

const notes = ['A3', 'C4', 'E4', 'G4', 'B4'];

let particles = [];
let playerParticles = [];

for (let i = 0; i < 1; i++) {
  if(i<5) {
    let p = new particle(1);
    particles.push(p);
    playerParticles.push(p);
    }
  else particles.push(new particle());
  
}

function damp(){
  cells.forEach(row => {
    row.forEach(cell => {
      cell.vx *= 1-(dampening.factor*0.1);
      cell.vy *= 1-(dampening.factor*0.1);
    });
  });
}

function fractal(i,j,size){
  let scale = size;
  let noise = Math.sin(i * scale) * Math.cos(j * scale);
  let angle = noise * Math.PI * 2; // Map noise to an angle
  let vx = Math.cos(angle) * (0.5 + Math.abs(noise)); // Add variation to velocity
  let vy = Math.sin(angle) * (0.5 + Math.abs(noise));


  return {x:vx, y:vy}
}


function buidField(){

cells=[];
for (let i = 0; i < numCols; i++) {
  let row = [];
  for (let j = 0; j < numRows; j++) {
    const cell = new Cell(i * definition, j * definition, 0,0);
    const {x, y} = fractal(i, j,0.05);
    cell.vx = isConstant ? 1 : 0;
    cell.vy = 0;
    row.push(cell);
  }
  cells.push(row);

}

}

buidField();



function draw(){
 ctx.fillStyle = 'rgba(255, 255, 255, 1)';
 ctx.fillRect(0,0,width,height);
  cells.forEach(row => {
    row.forEach(cell => {
    if (gridIsVisible) {

      if(Math.abs(cell.vx)+Math.abs(cell.vy)>0){
      const magnitude = Math.sqrt(cell.vx * cell.vx + cell.vy * cell.vy);
      const normVx = (cell.vx / magnitude) * 10;
      const normVy = (cell.vy / magnitude) * 10;

      ctx.beginPath();
      ctx.moveTo(cell.x, cell.y);
      ctx.lineTo(cell.x + normVx, cell.y + normVy);
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.lineWidth = 0.5;
      ctx.stroke();
      ctx.closePath();
      }
      else{
        ctx.beginPath();
        ctx.arc(cell.x, cell.y, 0.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fill();
        ctx.closePath();
      }
    }
      

      
    });
  }
  );
  
  if(particlesVisible){
    particles.forEach(p => {
      p.update();
      p.draw();
    });
  }


}


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

  let pensize = 5;

  for(let i = -pensize; i <= pensize; i++){
    for(let j = -pensize; j <= pensize; j++){
      if (cells[x + i] && cells[x + i][y + j]){
        cells[x + i][y + j].vx = mouseDir.vx;
        cells[x + i][y + j].vy = mouseDir.vy;
      }
    }
  }
  }
  else{
    for(let i = 0; i < 10; i++){
      let p = new particle();
      p.x = mousePosA.x;
      p.y = mousePosA.y;

      particles.push(p);
      
    }
  }
  
}

canvas.addEventListener('mousedown', (e) => {
  mousePosA = getMousePos(e)
  if(penIsActive){
  playerParticles[0].x = mousePosA.x;
  playerParticles[0].y = mousePosA.y;
  }
  else{
    for(let i = 0; i < 10; i++){
      let p = new particle();
      p.x = mousePosA.x;
      p.y = mousePosA.y;

      particles.push(p);
    }
    
  }
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

function main(){
  draw();
  damp()
  requestAnimationFrame(main);
}

main();

function createAudioContext(){
  const audioContext = new AudioContext();
  console.log(audioContext);
  Tone.setContext(audioContext);
  Tone.start();
  document.removeEventListener('keydown', createAudioContext);
  console.log('Audio context created');
  playerParticles.forEach(p => {
    p.oscillator.start();
  });

  window.addEventListener('keydown', (e) => {
    playerParticles.forEach(p => {
      p.x = Math.random() * width;
      p.y = Math.random() * height;
    }
    );
  });

}

document.addEventListener('keydown', createAudioContext);