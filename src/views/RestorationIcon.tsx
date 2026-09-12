import { useId } from "react";
import type { ToothRestoration } from "../domain/exam";

export function CrownIcon({ className }: { className?: string }) {
  const gold = useId();
  return (
    <svg className={className} viewBox="0 0 32 32" aria-hidden="true">
      <defs>
        <linearGradient id={gold} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffe9a3" />
          <stop offset="55%" stopColor="#d4af37" />
          <stop offset="100%" stopColor="#8a6b14" />
        </linearGradient>
      </defs>
      <path
        fill={`url(#${gold})`}
        d="M5 11.5 9.2 18 12.4 7.8c.3-1 1.7-1 2 0L16 16.2 17.6 7.8c.3-1 1.7-1 2 0L22.8 18 27 11.5 25.2 24.2H6.8Z"
      />
      <rect x="6.2" y="23.6" width="19.6" height="3.6" rx="1.2" fill="#c9a227" />
      <circle cx="12.4" cy="7.6" r="1.7" fill="#7eb6d6" />
      <circle cx="16" cy="6.4" r="1.9" fill="#f4d35e" />
      <circle cx="19.6" cy="7.6" r="1.7" fill="#e05b5b" />
    </svg>
  );
}

export function FillingIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" aria-hidden="true">
      <path
        fill="#e8eef4"
        d="M9 10.2c0-3.2 3.2-4.2 3.8-1.6.6-2.8 2.6-3.1 3.2-.4.6-2.7 2.6-2.4 3.2.4.7-2.6 3.8-1.6 3.8 1.6 0 4.4-1.2 9.8-7 11.8S9 23.8 9 16.4Z"
      />
      <ellipse cx="16" cy="14.6" rx="3.4" ry="2.6" fill="#3d454d" />
      <ellipse cx="15.2" cy="13.8" rx="1.1" ry="0.8" fill="#8d959c" />
      <path fill="#f4d35e" d="m23.2 6.2.7 2.1 2.1.7-2.1.7-.7 2.1-.7-2.1-2.1-.7 2.1-.7Z" />
    </svg>
  );
}

export function RestorationIcon({
  kind,
  className,
}: {
  kind: ToothRestoration;
  className?: string;
}) {
  if (kind === "crown") {
    return <CrownIcon className={className} />;
  }
  return <FillingIcon className={className} />;
}
