 import customWaveforms from "./wavetable.js";
 
 function createWaveform(type, size = 2048) {
      const wave = new Float32Array(size);
      for (let i = 0; i < size; i++) {
        const t = i / size;
        switch (type) {
          case 'sine':
            wave[i] = Math.sin(2 * Math.PI * t);
            break;
          case 'square':
            wave[i] = t < 0.5 ? 1 : -1;
            break;
          case 'sawtooth':
            wave[i] = 2 * (t - Math.floor(t + 0.5));
            break;
          case 'triangle':
            wave[i] = 1 - 4 * Math.abs(Math.round(t - 0.25) - (t - 0.25));
            break;
          default:
            wave[i] = 0;
        }
      }
      return wave;
    }

    function computeDFT(samples) {
      const N = samples.length;
      const real = new Float32Array(N);
      const imag = new Float32Array(N);

      for (let k = 0; k < N; k++) {
        let sumReal = 0;
        let sumImag = 0;
        for (let n = 0; n < N; n++) {
          const angle = (2 * Math.PI * k * n) / N;
          sumReal += samples[n] * Math.cos(angle);
          sumImag -= samples[n] * Math.sin(angle);
        }
        real[k] = sumReal / N;
        imag[k] = sumImag / N;
      }

      return { real, imag };
    }

    class Wavetable {
      constructor(waveforms, sampleRate = 2048) {
        this.waveforms = waveforms;
        this.sampleRate = sampleRate;
        this.pos = 0;
        this.context = Tone.getContext().rawContext;
        this.osc = null;
        this.gain = null;
      }

      _interpolateWaves(pos) {
        const n = this.waveforms.length;
        const scaled = pos * (n - 1);
        const index = Math.floor(scaled);
        const alpha = scaled - index;

        const waveA = this.waveforms[index];
        const waveB = this.waveforms[Math.min(index + 1, n - 1)];

        const interpolated = new Float32Array(this.sampleRate);
        for (let i = 0; i < this.sampleRate; i++) {
          interpolated[i] = waveA[i] * (1 - alpha) + waveB[i] * alpha;
        }
        return interpolated;
      }

      start(freq = 220) {
        const waveform = this._interpolateWaves(this.pos);
        const { real, imag } = computeDFT(waveform);
        const periodicWave = this.context.createPeriodicWave(real, imag, { disableNormalization: true });

        this.osc = this.context.createOscillator();
        this.gain = this.context.createGain();
        this.gain.gain.setValueAtTime(0.2, this.context.currentTime);

        this.osc.setPeriodicWave(periodicWave);
        this.osc.frequency.setValueAtTime(freq, this.context.currentTime);
        this.osc.connect(this.gain).connect(this.context.destination);
        this.osc.start();
      }

      updateWaveform(pos) {
        this.pos = Math.min(Math.max(pos, 0), 1);
        const waveform = this._interpolateWaves(this.pos);
        const { real, imag } = computeDFT(waveform);
        const wave = this.context.createPeriodicWave(real, imag, { disableNormalization: true });

        this.osc.setPeriodicWave(wave);
      }

      stop() {
        if (this.osc) {
          this.osc.stop();
          this.osc.disconnect();
          this.gain.disconnect();
          this.osc = null;
          this.gain = null;
        }
      }
    }


    let wavetable;

    document.getElementById("startBtn").addEventListener("click", async () => {
      await Tone.start(); // Important: démarre l'audio
      console.log("Audio started");

      wavetable = new Wavetable(customWaveforms);
      wavetable.start(50);

      requestAnimationFrame(loop);
    });




    export {Wavetable}