import { isLikelyShokz } from "../audio/devices";
import type { MicDevice } from "../audio/devices";
import type { SttStatus } from "../audio/stt";

export function MicBar({
  devices,
  selectedId,
  onSelect,
  onStart,
  onStop,
  listening,
  level,
  speaking,
  status,
  statusDetail,
}: {
  devices: MicDevice[];
  selectedId?: string;
  onSelect: (id: string) => void;
  onStart: () => void;
  onStop: () => void;
  listening: boolean;
  level: number;
  speaking: boolean;
  status: SttStatus;
  statusDetail?: string;
}) {
  const selected = devices.find((device) => device.id === selectedId);
  const shokzReady = selected ? isLikelyShokz(selected.label) : false;

  return (
    <div className="mic-bar">
      <select value={selectedId ?? ""} onChange={(event) => onSelect(event.target.value)}>
        {devices.length === 0 ? <option value="">No microphones yet</option> : null}
        {devices.map((device) => (
          <option key={device.id} value={device.id}>
            {isLikelyShokz(device.label) ? `Shokz · ${device.label}` : device.label}
          </option>
        ))}
      </select>
      {listening ? (
        <button type="button" onClick={onStop}>
          Stop mic
        </button>
      ) : (
        <button className="primary" type="button" onClick={onStart}>
          Listen
        </button>
      )}
      <div className="level" aria-hidden="true">
        <span style={{ width: `${Math.min(100, Math.round(level * 400))}%` }} />
      </div>
      <span className="hint">
        {speaking ? "Hearing you…" : listening ? "Mic open" : "Mic idle"} · STT {status}
        {shokzReady ? " · Shokz selected" : ""}
        {statusDetail ? ` · ${statusDetail}` : ""}
      </span>
    </div>
  );
}
