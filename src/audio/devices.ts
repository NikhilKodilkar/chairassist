export interface MicDevice {
  id: string;
  label: string;
  kind: "headset" | "builtin" | "other";
}

function classifyLabel(label: string): MicDevice["kind"] {
  const lower = label.toLowerCase();
  if (
    lower.includes("shokz") ||
    lower.includes("openrun") ||
    lower.includes("opencomm") ||
    lower.includes("openfit") ||
    lower.includes("openswim") ||
    lower.includes("airpods") ||
    lower.includes("headset")
  ) {
    return "headset";
  }
  if (lower.includes("macbook") || lower.includes("built-in") || lower.includes("internal")) {
    return "builtin";
  }
  return "other";
}

export function isLikelyShokz(label: string): boolean {
  const lower = label.toLowerCase();
  return (
    lower.includes("shokz") ||
    lower.includes("openrun") ||
    lower.includes("opencomm") ||
    lower.includes("openfit") ||
    lower.includes("openswim")
  );
}

export async function listMics(): Promise<MicDevice[]> {
  const devices = await navigator.mediaDevices.enumerateDevices();
  return devices
    .filter((device) => device.kind === "audioinput")
    .map((device, index) => ({
      id: device.deviceId,
      label: device.label || `Microphone ${index + 1}`,
      kind: classifyLabel(device.label),
    }));
}

export function pickPreferredMic(devices: MicDevice[]): MicDevice | undefined {
  const shokz = devices.find((device) => isLikelyShokz(device.label));
  if (shokz) {
    return shokz;
  }
  const headset = devices.find((device) => device.kind === "headset");
  if (headset) {
    return headset;
  }
  return devices[0];
}

export async function openMic(deviceId?: string): Promise<MediaStream> {
  const audio: MediaTrackConstraints = {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
    channelCount: 1,
    sampleRate: 16000,
  };
  if (deviceId) {
    audio.deviceId = { exact: deviceId };
  }
  return navigator.mediaDevices.getUserMedia({ audio });
}
