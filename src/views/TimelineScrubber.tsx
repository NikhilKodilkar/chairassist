export function TimelineScrubber({
  value,
  onChange,
  compact = false,
}: {
  value: number;
  onChange: (value: number) => void;
  compact?: boolean;
}) {
  if (compact) {
    return (
      <label className="timeline compact" title="Since last visit">
        <span>Mar → Today</span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
        />
      </label>
    );
  }

  return (
    <div className="timeline">
      <div className="eyebrow">Since last visit</div>
      <strong>March → Today</strong>
      <input
        type="range"
        min={0}
        max={1}
        step={0.01}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        style={{ width: "100%", marginTop: 8 }}
      />
    </div>
  );
}
