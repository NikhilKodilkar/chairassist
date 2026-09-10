export type SttStatus = "idle" | "loading" | "ready" | "error";

interface WorkerOk {
  type: "ready" | "text";
  text?: string;
}

interface WorkerErr {
  type: "error";
  message: string;
}

export function createWhisperSession(onStatus: (status: SttStatus, detail?: string) => void) {
  const worker = new Worker(new URL("./whisper.worker.ts", import.meta.url), {
    type: "module",
  });

  let status: SttStatus = "idle";

  worker.onmessage = (event: MessageEvent<WorkerOk | WorkerErr>) => {
    if (event.data.type === "ready") {
      status = "ready";
      onStatus("ready");
      return;
    }
    if (event.data.type === "error") {
      status = "error";
      onStatus("error", event.data.message);
    }
  };

  worker.onerror = (event) => {
    status = "error";
    onStatus("error", event.message || "Whisper worker failed");
  };

  return {
    load() {
      if (status === "loading" || status === "ready") {
        return;
      }
      status = "loading";
      onStatus("loading");
      worker.postMessage({
        type: "load",
        model: import.meta.env.VITE_WHISPER_MODEL,
        dtype: import.meta.env.VITE_WHISPER_DTYPE,
      });
    },
    transcribe(samples: Float32Array, sampleRate: number): Promise<string> {
      return new Promise((resolve, reject) => {
        if (status !== "ready") {
          reject(new Error(`Whisper is ${status}, not ready yet`));
          return;
        }
        let settled = false;
        const finish = (fn: () => void) => {
          if (settled) {
            return;
          }
          settled = true;
          window.clearTimeout(timer);
          worker.removeEventListener("message", handle);
          fn();
        };
        const handle = (event: MessageEvent<WorkerOk | WorkerErr>) => {
          if (event.data.type === "text" && event.data.text !== undefined) {
            finish(() => resolve(event.data.text ?? ""));
          }
          if (event.data.type === "error") {
            finish(() => reject(new Error(event.data.message)));
          }
        };
        const timer = window.setTimeout(() => {
          finish(() => reject(new Error("Whisper timed out")));
        }, 20000);
        worker.addEventListener("message", handle);
        console.log("[stt] transcribe", { status, length: samples.length, sampleRate });
        worker.postMessage({ type: "transcribe", samples, sampleRate }, [samples.buffer]);
      });
    },
    dispose() {
      worker.terminate();
    },
  };
}
