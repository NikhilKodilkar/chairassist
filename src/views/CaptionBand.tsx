export function CaptionBand({ text }: { text?: string }) {
  if (!text) {
    return null;
  }
  return <div className="caption">{text}</div>;
}
