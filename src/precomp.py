import numpy as np
import json
from scipy.io import wavfile

def extract_wavetable_frames(filepath, frame_size=2048):
    sample_rate, data = wavfile.read(filepath)

    if len(data.shape) > 1:
        data = data[:, 0]

    if data.dtype == np.int16:
        data = data.astype(np.float32) / 32768.0
    elif data.dtype == np.int32:
        data = data.astype(np.float32) / 2147483648.0
    elif data.dtype == np.uint8:
        data = (data.astype(np.float32) - 128) / 128.0
    else:
        data = data.astype(np.float32)

    total_frames = len(data) // frame_size
    frames = []

    for i in range(total_frames):
        start = i * frame_size
        end = start + frame_size
        frame = data[start:end]
        if len(frame) == frame_size:
            frames.append(frame)

    return frames

def interpolate_wavetable(frames, num_steps=64):
    result = []
    n = len(frames)
    for i in range(num_steps):
        t = i / (num_steps - 1)
        scaled = t * (n - 1)
        index = int(np.floor(scaled))
        alpha = scaled - index

        waveA = frames[index]
        waveB = frames[min(index + 1, n - 1)]

        interp = (1 - alpha) * waveA + alpha * waveB
        result.append(interp)
    return result

def compute_fft(frame):
    N = len(frame)
    fft = np.fft.fft(frame)
    real = np.real(fft[:N // 2 + 1])
    imag = np.imag(fft[:N // 2 + 1])
    return real.astype(np.float32), imag.astype(np.float32)

def save_as_json_wavebank(interpolated_frames, output_path="wavebank.json"):
    wavebank = []
    for frame in interpolated_frames:
        real, imag = compute_fft(frame)
        wavebank.append({
            "real": real.tolist(),
            "imag": imag.tolist()
        })

    with open(output_path, "w") as f:
        json.dump(wavebank, f, indent=2)

# --- Utilisation ---
input_wav = "wavetable.wav"  # Ton fichier .wav
frames = extract_wavetable_frames(input_wav)
interpolated = interpolate_wavetable(frames, num_steps=256)
save_as_json_wavebank(interpolated)
