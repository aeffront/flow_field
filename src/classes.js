import * as Tone from 'tone';
import bodymovin from 'lottie-web';

class Cell {
  constructor(x, y, vx = 0, vy = 0, restWidth, restHeight ) {
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

      
      let colorIndex = this.vx === 1 ? 0 : this.vx === -1 ? 1 : 2;
      ctx.fillStyle = colors[colorIndex];
      if(this.vx == 0 && this.vy == 0){
        ctx.fillStyle = 'white';
      }
      ctx.beginPath();
      ctx.roundRect(this.x, this.y, definition, definition, 0
      );
      ctx.fill();

      ctx.save();
      ctx.translate(this.x + definition / 2, this.y + definition / 2);
      if (this.vx !== 0 || this.vy !== 0) {
        ctx.rotate(Math.atan2(this.vy, this.vx)+Math.PI);
      }
      //ctx.drawImage(this.img, -definition / 2, -definition / 2, definition, definition);
      ctx.restore();

      
    }
  }
  
}

// class Agent {
//   constructor(cells, instrument) {
//     this.x = Math.random() * definition * numCols;
//     this.y = Math.random() * definition * numRows;
//     this.vx = 0;
//     this.vy = 0;
//     this.cells = cells;
//     this.instrument = instrument;
//   }

//   getClosestCell() {
//     let closestCell = null;
//     let minDistance = Infinity;
//     for (let row of this.cells) {
//       for (let cell of row) {
//         const dx = this.x - (cell.x + definition / 2);
//         const dy = this.y - (cell.y + definition / 2);
//         const dist = Math.sqrt(dx * dx + dy * dy);
//         if (dist < minDistance) {
//           minDistance = dist;
//           closestCell = cell;
//         }
//       }
//     }
//     return closestCell;
//   }

//   update() {
//     let cell = this.getClosestCell();
//     if (!cell) return;
//     this.vx *= 0.99;
//     this.vy *= 0.99;
//     this.vx += cell.vx*0.05;
//     this.vy += cell.vy*0.05;
//     this.x = (this.x + this.vx + width) % width;
//     this.y = (this.y + this.vy + height) % height;
    

    
//   }

//   draw(ctx) {
//     ctx.fillStyle = 'black';
//     ctx.beginPath();
//     ctx.arc(this.x, this.y, definition / 2, 0, Math.PI * 2);
//     ctx.fill();
//     ctx.closePath();
//   }

//   play(){
//     const noteIndex = Math.floor((this.x / definition + this.y / definition)) % notes.length;
//     this.instrument.play(notes[noteIndex]);

//   }
// }

class Agent {
  constructor(cells, instrument,definition, numCols, numRows) {
    this.x = Math.random() * definition * numCols;
    this.y = Math.random() * definition * numRows;
    this.vx = 0;
    this.vy = 0;
    this.cells = cells;
    this.instrument = instrument;
    this.definition = definition;

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
    if (!cell) return;

    this.vx *= 0.99;
    this.vy *= 0.99;
    this.vx += cell.vx * 0.5;
    this.vy += cell.vy * 0.5;

    this.x = (this.x + this.vx + window.innerWidth*2) %  (window.innerWidth*2);
    this.y = (this.y + this.vy + window.innerHeight*2) % (window.innerHeight*2);

    const rotation = Math.atan2(this.vy, this.vx)+Math.PI/2; // radians

    // Positionne et oriente la div
    this.el.style.transform = `translate(${this.x/2}px, ${this.y/2}px) rotate(${rotation}rad)`;
  }

  draw(ctx) {
    // plus rien ici
  }

  play(notes) {
    this.animation.goToAndPlay(0, true);
    const noteIndex = Math.floor((this.x / this.definition + this.y / this.definition)) % notes.length;
   
    this.instrument.play(notes[noteIndex]);
  }
}



class Instrument {
  constructor(type = 0, noteLength = '64n', octave = 3) {
    this.type = type;
    this.noteLength = noteLength;
    this.octave = octave;

    this.reverb = new Tone.Reverb({ 
      decay: 10,
      preDelay: 0.01,
      wet: 0.3
    }).toDestination();

    

    this.sampler = new Tone.Sampler({
      urls: {
        'C1': '036_c1.wav',
        'C2': '048_c2.wav',
        'C3': '060_c3.wav',
        'C4': '072_c4.wav',
        'C5': '084_c5.wav',
        'C6': '096_c6.wav',
      },
      baseUrl: this.type ==0 ? './public/piano_samples/' : './public/synth_samples/',
      onload: () => {
        console.log('Sampler loaded');
      }
    }).connect(this.reverb);

    this.sampler.volume.value = -10;
    



    
  }

  play(note) {
    
    if(this.sampler.loaded){
    this.sampler.triggerAttackRelease(note, this.noteLength);
    }
  }
}


export {Cell, Agent, Instrument};