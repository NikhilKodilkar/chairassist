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

export function isLikelyIphone(label: string): boolean {
  const lower = label.toLowerCase();
  return (
    lower.includes("iphone") ||
    lower.includes("16 pro max") ||
    lower.includes("16 pro-max") ||
    (lower.includes("pro max") && lower.includes("microphone"))
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
  const iphone = devices.find((device) => isLikelyIphone(device.label));
  if (iphone) {
    return iphone;
  }
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

export function selectMicId(current: string | undefined, devices: MicDevice[]): string | undefined {
  const preferred = pickPreferredMic(devices);
  const currentDevice = devices.find((device) => device.id === current);
  if (!currentDevice) {
    return preferred?.id;
  }
  if (preferred && isLikelyIphone(preferred.label) && currentDevice.kind === "builtin") {
    return preferred.id;
  }
  return currentDevice.id;
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
  console.log("[mic] getUserMedia request", {
    requestedId: deviceId ?? "(default)",
    exact: Boolean(deviceId),
  });
  const stream = await navigator.mediaDevices.getUserMedia({ audio });
  const track = stream.getAudioTracks()[0];
  const settings = track?.getSettings();
  console.log("[mic] getUserMedia granted", {
    requestedId: deviceId ?? "(default)",
    trackLabel: track?.label,
    trackDeviceId: settings?.deviceId,
    muted: track?.muted,
    enabled: track?.enabled,
    readyState: track?.readyState,
    sampleRate: settings?.sampleRate,
    channelCount: settings?.channelCount,
    echoCancellation: settings?.echoCancellation,
  });
  if (deviceId && settings?.deviceId && settings.deviceId !== deviceId) {
    console.log("[mic] device mismatch — browser opened a different input than the iPhone we asked for");
  }
  if (track?.muted) {
    console.log("[mic] track is muted at open — Continuity/iPhone often does this when the phone is locked, far away, or in use by another tab");
  }
  return stream;
}
