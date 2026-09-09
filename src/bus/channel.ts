import type { ChartEvent, Exam } from "../domain/types";

const CHANNEL_NAME = "chairside-events";

export type BusMessage =
  | { type: "chart-event"; event: ChartEvent }
  | { type: "exam-reset"; exam: Exam }
  | { type: "caption"; text: string }
  | { type: "summary"; sentences: string[] }
  | { type: "writeback"; payload: unknown }
  | { type: "heard"; text: string; confidence: "high" | "low" };

export function createBus(onMessage: (message: BusMessage) => void) {
  const channel = new BroadcastChannel(CHANNEL_NAME);

  channel.onmessage = (event: MessageEvent<BusMessage>) => {
    onMessage(event.data);
  };

  return {
    publish(message: BusMessage) {
      channel.postMessage(message);
      onMessage(message);
    },
    close() {
      channel.close();
    },
  };
}
