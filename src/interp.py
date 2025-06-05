import numpy as np
from scipy.io import wavfile

def extract_wavetable_frames(filepath, frame_size=2048):
    sample_rate, data = wavfile.read(filepath)

    # Si stéréo, prendre un seul canal
    if len(data.shape) > 1:
        data = data[:, 0]

    # Normaliser selon le type
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

def interpolate_wavetable(frames, num_steps=256):
    """Interpole entre les frames pour créer un wavetable fluide."""
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

def save_as_js_array(frames, output_path="interpolatedWavetable.js", var_name="interpolatedWavetable"):
    with open(output_path, "w") as f:
        f.write(f"const {var_name} = [\n")
        for frame in frames:
            f.write("  new Float32Array([\n")
            f.write(",\n".join(f"    {v:.6f}" for v in frame))
            f.write("\n  ]),\n")
        f.write("];\n")
        f.write(f"export default {var_name};\n")

# --- Utilisation ---
input_wav = "wavetable.wav"  # Remplace par ton propre fichier
frames = extract_wavetable_frames(input_wav)
interpolated_frames = interpolate_wavetable(frames, num_steps=256)
save_as_js_array(interpolated_frames)
