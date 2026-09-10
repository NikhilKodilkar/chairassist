export interface VadOptions {
  silenceMs: number;
  minSpeechMs: number;
  threshold: number;
  onUtterance: (samples: Float32Array, sampleRate: number) => void;
  onLevel: (level: number, speaking: boolean, detail: string) => void;
}

export function attachEnergyVad(stream: MediaStream, options: VadOptions) {
  const audioContext = new AudioContext();
  const source = audioContext.createMediaStreamSource(stream);
  const processor = audioContext.createScriptProcessor(4096, 1, 1);
  const mute = audioContext.createGain();
  mute.gain.value = 0;
  source.connect(processor);
  processor.connect(mute);
  mute.connect(audioContext.destination);
  void audioContext.resume().then(() => {
    console.log("[vad] audio context", audioContext.state, "sampleRate", audioContext.sampleRate);
  });

  const chunks: Float32Array[] = [];
  let speaking = false;
  let silenceStarted = 0;
  let speechStarted = 0;
  let lastLog = 0;

  processor.onaudioprocess = (event) => {
    try {
      if (audioContext.state === "suspended") {
        void audioContext.resume();
      }
      const input = event.inputBuffer.getChannelData(0);
      const frame = new Float32Array(input.length);
      let sum = 0;
      for (let i = 0; i < input.length; i += 1) {
        const sample = input[i];
        frame[i] = sample;
        sum += sample * sample;
      }
      const rms = Math.sqrt(sum / input.length);
      const now = performance.now();
      const isLoud = rms > options.threshold;
      if (now - lastLog > 1000) {
        lastLog = now;
        console.log("[vad] rms", rms.toFixed(4), "loud", isLoud, "speaking", speaking, "ctx", audioContext.state);
      }

      if (isLoud) {
        if (!speaking) {
          speaking = true;
          speechStarted = now;
          chunks.length = 0;
          console.log("[vad] speech start", { rms });
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
            console.log("[vad] utterance", {
              durationMs: Math.round(duration),
              samples: samples.length,
              sampleRate: audioContext.sampleRate,
            });
            options.onUtterance(samples, audioContext.sampleRate);
          } else {
            console.log("[vad] dropped short burst", { durationMs: Math.round(duration) });
          }
          speaking = false;
          chunks.length = 0;
          silenceStarted = 0;
        }
      }

      const detail = `${audioContext.state} · energy ${(rms * 100).toFixed(1)}% · need ${(options.threshold * 100).toFixed(1)}%`;
      options.onLevel(rms, speaking, detail);
    } catch (error) {
      const message = error instanceof Error ? error.message : "VAD failed";
      console.log("[vad] error", message);
      options.onLevel(0, false, message);
    }
  };

  return {
    stop() {
      processor.onaudioprocess = null;
      source.disconnect();
      processor.disconnect();
      mute.disconnect();
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
