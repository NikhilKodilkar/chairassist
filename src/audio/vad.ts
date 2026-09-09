export interface VadOptions {
  silenceMs: number;
  minSpeechMs: number;
  threshold: number;
  onUtterance: (samples: Float32Array, sampleRate: number) => void;
  onLevel: (level: number, speaking: boolean) => void;
}

export function attachEnergyVad(stream: MediaStream, options: VadOptions) {
  const audioContext = new AudioContext();
  const source = audioContext.createMediaStreamSource(stream);
  const analyser = audioContext.createAnalyser();
  analyser.fftSize = 2048;
  analyser.smoothingTimeConstant = 0.4;
  source.connect(analyser);

  const timeData = new Uint8Array(analyser.fftSize);
  const chunks: Float32Array[] = [];
  let speaking = false;
  let silenceStarted = 0;
  let speechStarted = 0;

  const timer = window.setInterval(() => {
    analyser.getByteTimeDomainData(timeData);
    let sum = 0;
    const frame = new Float32Array(timeData.length);
    for (let i = 0; i < timeData.length; i += 1) {
      const sample = (timeData[i] - 128) / 128;
      frame[i] = sample;
      sum += sample * sample;
    }
    const rms = Math.sqrt(sum / timeData.length);
    const now = performance.now();
    const isLoud = rms > options.threshold;

    if (isLoud) {
      if (!speaking) {
        speaking = true;
        speechStarted = now;
        chunks.length = 0;
      }
      chunks.push(frame);
      silenceStarted = 0;
    } else if (speaking) {
      chunks.push(frame);
      if (silenceStarted === 0) {
        silenceStarted = now;
      } else if (now - silenceStarted >= options.silenceMs) {
        const duration = now - speechStarted;
        if (duration >= options.minSpeechMs) {
          const samples = mergeChunks(chunks);
          options.onUtterance(samples, audioContext.sampleRate);
        }
        speaking = false;
        chunks.length = 0;
        silenceStarted = 0;
      }
    }

    options.onLevel(rms, speaking);
  }, 80);

  return {
    stop() {
      window.clearInterval(timer);
      source.disconnect();
      void audioContext.close();
    },
  };
}

function mergeChunks(chunks: Float32Array[]): Float32Array {
  let total = 0;
  for (const chunk of chunks) {
    total += chunk.length;
  }
  const merged = new Float32Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    merged.set(chunk, offset);
    offset += chunk.length;
  }
  return merged;
}
