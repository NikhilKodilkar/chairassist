import { isLikelyIphone, isLikelyShokz } from "../audio/devices";
import type { MicDevice } from "../audio/devices";
import type { SttStatus } from "../audio/stt";

export function MicBar({
  devices,
  selectedId,
  onSelect,
  onStart,
  onStop,
  onRefresh,
  listening,
  level,
  speaking,
  status,
  statusDetail,
  compact = false,
}: {
  devices: MicDevice[];
  selectedId?: string;
  onSelect: (id: string) => void;
  onStart: () => void;
  onStop: () => void;
  onRefresh: () => void;
  listening: boolean;
  level: number;
  speaking: boolean;
  status: SttStatus;
  statusDetail?: string;
  compact?: boolean;
}) {
  const selected = devices.find((device) => device.id === selectedId);
  const shokzReady = selected ? isLikelyShokz(selected.label) : false;
  const iphoneReady = selected ? isLikelyIphone(selected.label) : false;

  return (
    <div className={compact ? "mic-bar compact" : "mic-bar"}>
      <select value={selectedId ?? ""} onChange={(event) => onSelect(event.target.value)}>
        {devices.length === 0 ? <option value="">No microphones yet</option> : null}
        {devices.map((device) => (
          <option key={device.id} value={device.id}>
            {isLikelyIphone(device.label)
              ? `iPhone · ${device.label}`
              : isLikelyShokz(device.label)
                ? `Shokz · ${device.label}`
                : device.label}
          </option>
        ))}
      </select>
      <button
        className={`mic-listen${listening ? " on" : ""}${speaking ? " speaking" : ""}`}
        type="button"
        onClick={listening ? onStop : onStart}
        aria-label={listening ? "Stop listening" : "Listen"}
        title={listening ? "Stop" : "Listen"}
      >
        <img src={`${import.meta.env.BASE_URL}molarmind-favicon.png`} alt="" />
      </button>
      {compact ? null : (
        <>
          <button type="button" onClick={onRefresh}>
            Refresh
          </button>
          <div className="level" aria-hidden="true">
            <span style={{ width: `${Math.min(100, Math.round(level * 400))}%` }} />
          </div>
          <span className="hint">
            {speaking ? "Hearing you…" : listening ? "Mic open" : "Mic idle"} · STT {status}
            {iphoneReady ? " · iPhone selected" : shokzReady ? " · Shokz selected" : ""}
            {statusDetail ? ` · ${statusDetail}` : ""}
          </span>
        </>
      )}
    </div>
  );
}
