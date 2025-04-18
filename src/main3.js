
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
document.body.appendChild(canvas);

const width = canvas.width = window.innerWidth;
const height = canvas.height =window.innerHeight;










//Définition du champ vectoriel

class champ_vectoriel{
    constructor(){

    }

    //Définition de la fonction de champ vectoriel
    composante_Vx(x){
        return 5;
    }

    composante_Vy(x,y){
        return Math.cos(x*0.01);
    }
}


//Définition de l'agent

class agent{
  constructor(){
    this.x = -(Math.random()*100);
    this.y = height*Math.random();
    this.vx = 0;
    this.vy = 0;
    this.champ = new champ_vectoriel();

    this.life = Math.random() * 200;
    }

  update(){

    //Le vecteur directeur de l'agent est défini par le champ vectoriel
    this.vx = this.champ.composante_Vx(this.x);
    this.vy = this.champ.composante_Vy(this.x,this.y);


    //Le vecteur directeur de l'agent est ajouté à sa position
    this.x += this.vx;
    this.y += this.vy;

    this.life-=1
    if(this.x > width){
      this.x = -(Math.random()*100);
      this.y = height*Math.random();
      
    }
  }
















  draw(){
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.closePath();
   
  }
}


let agents = [];

for(let i = 0; i < 500; i++){
  agents.push(new agent());
}

function loop(){
  ctx.clearRect(0, 0, width, height);
  agents.forEach(agent => {
    agent.update();
    agent.draw();
  });
  requestAnimationFrame(loop);
}

loop();