const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
document.body.appendChild(canvas);

const width = canvas.width = window.innerWidth;
const height = canvas.height =window.innerHeight;

const definition = 10;

const cells = [];

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
  constructor(){
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.vx = 0;
    this.vy = 0;

    this.life = Math.floor(Math.random() * 1000);

  }

  update(){
    let x = Math.floor(this.x / definition);
    let y = Math.floor(this.y / definition);
    let avgVx = 0;
    let avgVy = 0;
    let count = 0;
    this.life--;
   

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
      
      this.vx = 0;
      this.vy = 0;
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.life = Math.floor(Math.random() * 100);
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
    ctx.font = 'bold 12px Arial';
    if(Math.abs(this.vx) + Math.abs(this.vy) > 1) ctx.fillText('.', this.x, this.y);
    
   
  }
}

let particles = [];

for (let i = 0; i < 10000; i++) {
  particles.push(new particle());
}

function damp(){
  cells.forEach(row => {
    row.forEach(cell => {
      cell.vx *= 0.99;
      cell.vy *= 0.99;
    });
  });
}


for (let i = 0; i < numCols; i++) {
  let row = [];
  for (let j = 0; j < numRows; j++) {
    row.push(new Cell(i * definition, j * definition, 0,0));
  }
  cells.push(row);

}

console.log(cells);

let gridIsVisible = false;

function draw(){
 ctx.fillStyle = 'rgba(255, 255, 255, 1)';
 ctx.fillRect(0,0,width,height);
  cells.forEach(row => {
    row.forEach(cell => {
      let symbol 
      switch (`${cell.vx},${cell.vy}`) {
        case '1,0':
        symbol = '→';
          break;
        case '-1,0':
        symbol = '←';
          break;
        case '0,1':
        symbol = '↓';
          break;
        case '0,-1':
        symbol = '↑';
          break;
        case '1,1':
        symbol = '↘';
          break;
        case '-1,1':
        symbol = '↙';
          break;
        case '1,-1':
        symbol = '↗';
          break;
        case '-1,-1':
        symbol = '↖';
          break;
        default:
        symbol = '•';
          break;
      }
      
      
        
        ctx.font = 'bold 12px Arial';
        if (symbol == '•')  ctx.font = '5px Arial';
        ctx.fillStyle = 'black';
        if(gridIsVisible)ctx.fillText(symbol, cell.x, cell.y);
      

      
    });
  }
  );
  
  particles.forEach(p => {
    p.update();
    p.draw();
  });

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

canvas.addEventListener('mousedown', (e) => {
  mousePosA = getMousePos(e);
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

document.addEventListener('keydown', (e) => {
  if (e.key === 'g') {
    gridIsVisible = !gridIsVisible;
  }
});