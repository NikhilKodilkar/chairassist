import { pipeline } from "@huggingface/transformers";

type AsrPipeline = (audio: Float32Array, options?: { temperature?: number }) => Promise<{ text: string }>;
type WhisperDtype = "q4" | "q8" | "fp16" | "fp32";

function asDtype(value: string | undefined): WhisperDtype {
  if (value === "q4" || value === "q8" || value === "fp16" || value === "fp32") {
    return value;
  }
  return "q8";
}

let transcriber: AsrPipeline | undefined;

function toFloat32(samples: Float32Array | ArrayLike<number>): Float32Array {
  if (samples instanceof Float32Array) {
    return new Float32Array(samples);
  }
  return Float32Array.from(samples);
}

function resample(samples: Float32Array, inputRate: number, outputRate: number): Float32Array {
  if (inputRate === outputRate) {
    return samples;
  }
  const ratio = inputRate / outputRate;
  const length = Math.max(1, Math.round(samples.length / ratio));
  const next = new Float32Array(length);
  for (let i = 0; i < length; i += 1) {
    const source = i * ratio;
    const left = Math.floor(source);
    const right = Math.min(left + 1, samples.length - 1);
    const mix = source - left;
    next[i] = samples[left] * (1 - mix) + samples[right] * mix;
  }
  return next;
}

self.onmessage = async (event: MessageEvent) => {
  const data = event.data as {
    type: "load" | "transcribe";
    model?: string;
    dtype?: string;
    samples?: Float32Array;
    sampleRate?: number;
  };

  try {
    if (data.type === "load") {
      transcriber = (await pipeline("automatic-speech-recognition", data.model, {
        device: "webgpu",
        dtype: asDtype(data.dtype),
      })) as unknown as AsrPipeline;
      self.postMessage({ type: "ready" });
      return;
    }

    if (data.type === "transcribe" && data.samples && data.sampleRate && transcriber) {
      const audio = resample(toFloat32(data.samples), data.sampleRate, 16000);
      const result = await transcriber(audio, { temperature: 0 });
      self.postMessage({ type: "text", text: (result.text ?? "").trim() });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Whisper failed";
    self.postMessage({ type: "error", message });
  }
};
