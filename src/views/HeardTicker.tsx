import type { HeardItem } from "../store/examStore";

export function HeardTicker({
  items,
  speaking = false,
}: {
  items: HeardItem[];
  speaking?: boolean;
}) {
  const latest = items[0];
  if (!latest) {
    return null;
  }

  return (
    <p className="heard-compact">
      {speaking ? "Hearing you…" : "Heard"} · {latest.text}
    </p>
  );
}
