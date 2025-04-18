import * as Tone from 'tone';

const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
document.body.appendChild(canvas);

const width = canvas.width = window.innerWidth*2;
const height = canvas.height = window.innerHeight*2;

canvas.style.width = `${window.innerWidth}px`;
canvas.style.height = `${window.innerHeight}px`;

let timeInterval =250;

const audioContext = Tone.getContext();

let notes = ['e4', 'f#4', 'g#4', 'a4', 'b4', 'c#5', 'd#5', 'e5', 'f#5', 'g#5', 'a5', 'b5', 'c#6', 'd#6', 'e6'];

class champ_vectoriel {
    constructor(def) {
        this.color = Math.floor(Math.random() * 360);
        this.def = def;
        this.num_cols = Math.floor(width / this.def);
        this.num_rows = Math.floor(height / this.def);
        this.cells = [];
        this.build();
    }

    build() {
        let cellWidth = width / this.num_cols;
        let cellHeight = height / this.num_rows;
        for (let i = 0; i < this.num_cols; i++) {
            let col = [];
            for (let j = 0; j < this.num_rows; j++) {
                col.push(new cell(i, j, cellWidth, cellHeight, this.color));
            }
            this.cells.push(col);
        }

       

        this.draw();
    }

    draw() {
        ctx.clearRect(0, 0, width, height);
        this.cells.forEach((col) => {
            col.forEach((cell) => {
                cell.draw();
            });
        });
    }
}

class cell{
    constructor(u,v,width,height,color){
        this.color = color;
        this.u = u;
        this.v = v;
        this.width = width;
        this.height = height;
        this.x = this.u * this.width;
        this.y = this.v * this.height;
        

        this.dirs = [
            [0, -1], // up
            [1, 0], // right
            [0, 1], // down
            [-1, 0], // left
           
            
        ];
        this.randomDir = Math.floor(Math.random() * this.dirs.length);
        this.vx = this.dirs[this.randomDir][0];
        this.vy = this.dirs[this.randomDir][1];
        

        canvas.addEventListener('mousedown', (e) => {

            const scaleX = canvas.width / canvas.style.width.replace('px', '');
            const scaleY = canvas.height / canvas.style.height.replace('px', '');

            const adjustedX = e.clientX * scaleX;
            const adjustedY = e.clientY * scaleY;

            if (adjustedX > this.x && adjustedX < this.x + this.width && adjustedY > this.y && adjustedY < this.y + this.height) {

                const clickX = adjustedX - this.x;
                const clickY = adjustedY - this.y;

                let up_dist = Math.sqrt(Math.pow(clickX - this.width / 2, 2) + Math.pow(clickY - 0, 2));
                let down_dist = Math.sqrt(Math.pow(clickX - this.width / 2, 2) + Math.pow(clickY - this.height , 2));
                let left_dist = Math.sqrt(Math.pow(clickX - 0 , 2) + Math.pow(clickY - this.height / 2, 2));
                let right_dist = Math.sqrt(Math.pow(clickX - this.width, 2) + Math.pow(clickY - this.height / 2, 2));

                const distances = [
                    { dir: 0, dist: up_dist },
                    { dir: 1, dist: right_dist },
                    { dir: 2, dist: down_dist },
                    { dir: 3, dist: left_dist }
                ];

                distances.sort((a, b) => a.dist - b.dist);

                this.randomDir = distances[0].dir;
                this.vx = this.dirs[this.randomDir][0];
                this.vy = this.dirs[this.randomDir][1];
            }

            champ.draw();
        }
        );
        
    }

    draw(){
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'rgb(0, 0, 0)';
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        this.drawVector();
    }

    drawVector(){
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'rgb(0, 0, 0)';
        ctx.beginPath();
        ctx.moveTo(this.x + this.width / 2, this.y + this.height / 2);
        ctx.lineTo(this.x + this.width / 2 + this.vx * this.width*0.4, this.y + this.height / 2 + this.vy * this.height*0.4);
        switch (this.randomDir) {
            case 0:
                ctx.fillStyle = `hsl(${this.color}, 100%, 50%)`;
                break;
            case 1:
                ctx.fillStyle = `hsl(${this.color}, 75%, 50%)`;
                break;
            case 2:
                ctx.fillStyle = `hsl(${this.color+180}, 50%, 50%)`;
                break;
            case 3:
                ctx.fillStyle = `hsl(${this.color+180}, 25%, 50%)`;
                break;
        }
        ctx.fillRect(this.x ,this.y, this.width, this.height);
        ctx.stroke();
    }



}

class agent{
    constructor(champ,u,v){
        this.champ = champ;
        this.u = u;
        this.v = v;
        this.cell = this.champ.cells[this.u][this.v];
        console.log(this.champ);
        this.x = this.cell.x + this.cell.width / 2;
        this.y = this.cell.y + this.cell.height / 2;
        this.vect_x = this.cell.vx;
        this.vect_y = this.cell.vy;

        this.filter = new Tone.Filter({
            type: 'lowpass',
            frequency: 1000,
            rolloff: -12,
            Q: 3,
            gain: -40,
        }).toDestination();

        this.highBoostFilter = new Tone.Filter({
            type: 'highshelf',
            frequency: 8000,
            gain: 20, // Boost the high end
        }).connect(this.filter);

        this.filterEnvelope = new Tone.FrequencyEnvelope({
            attack: 0.1,
            decay: 0.5,
            sustain: 0.3,
            release: 0.8,
            baseFrequency: 200,
            octaves: 5,
            exponent: 10,
        }).connect(this.filter.frequency);

        this.delay = new Tone.FeedbackDelay({
            delayTime: 0.5, // Tight delay
            feedback: 0.01,
            wet: 0.5
        }).connect(this.filter);

        this.reverb = new Tone.Reverb({
            decay: 5,
            preDelay: 0.,
            wet: 0.6
        }).connect(this.delay);

        this.envelope = new Tone.AmplitudeEnvelope({
            attack: 0.1,
            decay: 0.5,
            sustain: 0.,
            release: 0.3
        }).connect(this.reverb);

        this.oscillatorA = new Tone.Oscillator({
            frequency: 440,
            type: 'sawtooth',
            volume: -20,
            harmonics: 0,
            detune: 0,
            phase: 0,
        }).connect(this.envelope);
        this.oscillatorA.start();

        this.oscillatorB = new Tone.Oscillator({
            frequency: 440,
            type: 'sine',
            volume: -20,
            harmonics: 0,
            detune: 0,
            phase: 0,
        }).connect(this.envelope);
        this.oscillatorB.start();

        this.oscillatorC = new Tone.Oscillator({
            frequency: 440,
            type: 'sine',
            volume: -20,
            harmonics: 5,
            detune: 16,
            phase: 0,
        }).connect(this.envelope);
        //this.oscillatorC.start();
    }

    update() {
        let noteIndexA = (this.u + this.v) % notes.length;
        let noteIndexB = (this.u + this.v + 2) % notes.length; // Offset for a different note
        let noteIndexC = (this.u + this.v -3) % notes.length; // Offset for a different note
        let noteA = notes[noteIndexA];
        let noteB = notes[noteIndexB];
        let noteC = notes[noteIndexC];
        let frequencyA = Tone.Frequency(noteA).toFrequency()/3;
        let frequencyB = Tone.Frequency(noteB).toFrequency()/1.5;
        let frequencyC = Tone.Frequency(noteC).toFrequency()/1.5;
        this.oscillatorA.frequency.value = frequencyA;
        this.oscillatorB.frequency.value = frequencyB;
        this.oscillatorC.frequency.value = frequencyC;
        this.envelope.triggerAttackRelease(timeInterval*0.0008); // Trigger sound for 0.5 seconds
        this.filterEnvelope.triggerAttackRelease(timeInterval*0.0008); // Trigger filter envelope for 0.5 seconds
        this.vect_x = this.cell.vx;
        this.vect_y = this.cell.vy;
    
        this.u += this.vect_x;
        this.v += this.vect_y;
    
        if (this.u < 0) this.u = this.champ.num_cols - 1;
        if (this.u >= this.champ.num_cols) this.u = 0;
        if (this.v < 0) this.v = this.champ.num_rows - 1;
        if (this.v >= this.champ.num_rows) this.v = 0;
    
        this.cell = this.champ.cells[this.u][this.v];
        this.x = this.cell.x + this.cell.width / 2;
        this.y = this.cell.y + this.cell.height / 2;
        this.draw()
    
       
    }
    

    draw(){
        this.cell.draw()
        ctx.fillStyle = 'rgba(255, 255, 255, 0.63)';
        ctx.globalCompositeOperation = 'xor';
        ctx.fillRect(this.x-this.cell.width/2, this.y-this.cell.height/2, this.cell.width,this.cell.height );
        ctx.globalCompositeOperation = 'source-over';
    }
}

const player = new Tone.Player({
    url: "./public/kick.wav",
    autostart: false,
    volume: -20,
    onload: () => {
        console.log("Audio buffer loaded successfully.");
        window.addEventListener('click', app);
    },
}).toDestination();

function app() {
    removeEventListener('click', app);
    Tone.start();

    const champ = new champ_vectoriel(50);
    const agent1 = new agent(champ, 0, 0);
    const agent2 = new agent(champ, 0, 1);

    let elapsedTime = 0;

    function varyingInterval() {
        const subdivisions = [1, 2];
        const randomSubdivision = subdivisions[Math.floor(Math.random() * subdivisions.length)];
        const currentInterval = timeInterval / randomSubdivision;

        champ.draw();
        agent1.update();
        agent2.update();
        elapsedTime += currentInterval;

        if (elapsedTime >= timeInterval*2) {
            //player.start();
            elapsedTime = 0; // Reset elapsed time
        }

        setTimeout(varyingInterval, currentInterval);

        // Tone.getTransport().scheduleRepeat((time) => {
        //     player.start();
        // });
    }

    varyingInterval();
}



