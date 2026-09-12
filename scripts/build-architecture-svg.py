#!/usr/bin/env python3
"""Generate the Chairside Agent architecture SVG (Fireworks style 1)."""

from pathlib import Path

OUT = Path(__file__).resolve().parents[1] / "public" / "architecture.svg"

lines = []
a = lines.append

a('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 700" width="960" height="700">')
a("  <defs>")
a('    <marker id="arrow-blue" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">')
a('      <polygon points="0 0, 10 3.5, 0 7" fill="#2563eb"/>')
a("    </marker>")
a('    <marker id="arrow-green" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">')
a('      <polygon points="0 0, 10 3.5, 0 7" fill="#16a34a"/>')
a("    </marker>")
a('    <marker id="arrow-orange" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">')
a('      <polygon points="0 0, 10 3.5, 0 7" fill="#ea580c"/>')
a("    </marker>")
a('    <marker id="arrow-gray" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">')
a('      <polygon points="0 0, 10 3.5, 0 7" fill="#6b7280"/>')
a("    </marker>")
a('    <filter id="shadow" x="-8%" y="-8%" width="116%" height="120%">')
a('      <feDropShadow dx="0" dy="1" stdDeviation="1.4" flood-color="#111827" flood-opacity="0.12"/>')
a("    </filter>")
a("  </defs>")
a('  <style>')
a("    text { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; }")
a("  </style>")
a('  <rect width="960" height="700" fill="#ffffff"/>')
a('  <text x="480" y="32" text-anchor="middle" font-size="22" font-weight="700" fill="#111827">Chairside Agent architecture</text>')
a('  <text x="480" y="52" text-anchor="middle" font-size="13" fill="#6b7280">Operatory speech becomes a perio chart, a detailed report, and patient language</text>')

# Layer frames
a('  <rect x="40" y="68" width="880" height="108" rx="8" fill="#f8fafc" stroke="#e5e7eb" stroke-width="1.5" stroke-dasharray="5,4"/>')
a('  <text x="56" y="86" font-size="11" font-weight="600" fill="#6b7280" letter-spacing="0.06em">OPERATORY</text>')

a('  <rect x="40" y="192" width="880" height="118" rx="8" fill="#eff6ff" stroke="#bfdbfe" stroke-width="1.5" stroke-dasharray="5,4"/>')
a('  <text x="56" y="206" font-size="11" font-weight="600" fill="#2563eb" letter-spacing="0.06em">CAPTURE</text>')
a('  <text x="56" y="218" font-size="11" font-weight="600" fill="#2563eb" letter-spacing="0.06em">ON-DEVICE</text>')

a('  <rect x="40" y="332" width="880" height="118" rx="8" fill="#faf5ff" stroke="#ddd6fe" stroke-width="1.5" stroke-dasharray="5,4"/>')
a('  <text x="56" y="350" font-size="11" font-weight="600" fill="#7c3aed" letter-spacing="0.06em">AGENT CORE</text>')

a('  <rect x="40" y="472" width="880" height="132" rx="8" fill="#f0fdf4" stroke="#bbf7d0" stroke-width="1.5" stroke-dasharray="5,4"/>')
a('  <text x="56" y="490" font-size="11" font-weight="600" fill="#16a34a" letter-spacing="0.06em">SURFACES</text>')


def node(x, y, w, h, fill, stroke, title, sub, title_y=22):
    a(f'  <rect x="{x}" y="{y}" width="{w}" height="{h}" rx="8" fill="{fill}" stroke="{stroke}" stroke-width="1.5" filter="url(#shadow)"/>')
    a(f'  <text x="{x + w / 2}" y="{y + title_y}" text-anchor="middle" font-size="14" font-weight="600" fill="#111827">{title}</text>')
    a(f'  <text x="{x + w / 2}" y="{y + title_y + 18}" text-anchor="middle" font-size="11" fill="#6b7280">{sub}</text>')


def dashed_node(x, y, w, h, title, sub):
    a(f'  <rect x="{x}" y="{y}" width="{w}" height="{h}" rx="8" fill="#fff7ed" stroke="#fdba74" stroke-width="1.5" stroke-dasharray="6,3"/>')
    a(f'  <text x="{x + w / 2}" y="{y + 22}" text-anchor="middle" font-size="14" font-weight="600" fill="#111827">{title}</text>')
    a(f'  <text x="{x + w / 2}" y="{y + 40}" text-anchor="middle" font-size="11" fill="#6b7280">{sub}</text>')


def label(x, y, text, fill="#475569", side="above"):
    pad = 3
    width = max(28, len(text) * 5.8)
    height = 14
    if side == "below":
        cx, cy = x, y + 14
    elif side == "right":
        cx, cy = x + 10 + width / 2, y + 4
    elif side == "left":
        cx, cy = x - 10 - width / 2, y + 4
    else:
        cx, cy = x, y - 14
    a(f'  <rect x="{round(cx - width / 2 - pad, 1)}" y="{round(cy - 10, 1)}" width="{round(width + pad * 2, 1)}" height="{height}" rx="3" fill="#ffffff" opacity="0.95"/>')
    a(f'  <text x="{round(cx, 1)}" y="{round(cy, 1)}" text-anchor="middle" font-size="11" fill="{fill}">{text}</text>')


# Layer 1 people
node(70, 96, 220, 60, "#ffffff", "#d1d5db", "Hygienist", "Hands-busy speech")
node(370, 96, 220, 60, "#ffffff", "#d1d5db", "Patient", "Plain-language listen")

# Layer 2 capture
node(70, 226, 220, 60, "#ffffff", "#93c5fd", "Phone mic", "Default: iPhone")
node(370, 226, 220, 60, "#ffffff", "#93c5fd", "Energy VAD", "Utterance cuts")
node(660, 226, 220, 60, "#dbeafe", "#60a5fa", "Whisper (WebGPU)", "Local whisper-base.en")

# Layer 3 agent
node(70, 366, 220, 60, "#ede9fe", "#c4b5fd", "Lingo layer", "363 · facial · reset")
node(370, 366, 220, 60, "#ede9fe", "#c4b5fd", "Clinical parser", "Sites · BOP · notes")
node(660, 366, 220, 60, "#dcfce7", "#86efac", "Exam store", "Zustand chart state")

# Layer 4 surfaces
node(70, 510, 220, 72, "#ccfbf1", "#5eead4", "Clinician portal", "Grid · report · write-back", 24)
node(370, 510, 220, 72, "#ccfbf1", "#5eead4", "Patient portal", "Hero tooth · captions", 24)
dashed_node(660, 510, 220, 72, "Open Dental", "Mock perio write-back")

# Primary flow — capture row
a('  <path d="M 290 256 H 370" fill="none" stroke="#2563eb" stroke-width="2" marker-end="url(#arrow-blue)"/>')
label(330, 256, "audio", "#2563eb")
a('  <path d="M 590 256 H 660" fill="none" stroke="#2563eb" stroke-width="2" marker-end="url(#arrow-blue)"/>')
label(625, 256, "clip", "#2563eb")

# Hygienist to mic
a('  <path d="M 180 156 V 226" fill="none" stroke="#2563eb" stroke-width="2" marker-end="url(#arrow-blue)"/>')
label(180, 188, "speech", "#2563eb", side="right")

# Whisper down, across gap, into Lingo
a('  <path d="M 770 286 V 318 H 180 V 366" fill="none" stroke="#2563eb" stroke-width="2" marker-end="url(#arrow-blue)"/>')
label(480, 318, "transcript", "#2563eb")

# Agent row
a('  <path d="M 290 396 H 370" fill="none" stroke="#2563eb" stroke-width="2" marker-end="url(#arrow-blue)"/>')
label(330, 396, "rewrite", "#2563eb")
a('  <path d="M 590 396 H 660" fill="none" stroke="#2563eb" stroke-width="2" marker-end="url(#arrow-blue)"/>')
label(625, 396, "events", "#2563eb")

# Store to Open Dental (same column)
a('  <path d="M 770 426 V 510" fill="none" stroke="#ea580c" stroke-width="1.5" marker-end="url(#arrow-orange)"/>')
label(770, 466, "write-back", "#ea580c", side="right")

# Store to Patient UI — gap under agent layer
a('  <path d="M 660 426 V 456 H 480 V 510" fill="none" stroke="#16a34a" stroke-width="1.5" marker-end="url(#arrow-green)"/>')
label(560, 456, "captions", "#16a34a", side="below")

# Store to Clinician — slightly higher gap line
a('  <path d="M 660 426 V 444 H 180 V 510" fill="none" stroke="#16a34a" stroke-width="1.5" marker-end="url(#arrow-green)"/>')
label(300, 444, "chart", "#16a34a")

# BroadcastChannel between portals
a('  <path d="M 290 546 H 370" fill="none" stroke="#6b7280" stroke-width="1.5" stroke-dasharray="4,2" marker-end="url(#arrow-gray)"/>')
label(330, 546, "sync", "#6b7280")

# Patient language back to the person — under surfaces, left margin, then over the top into Patient
a('  <path d="M 420 582 V 618 H 22 V 62 H 480 V 96" fill="none" stroke="#16a34a" stroke-width="1.5" marker-end="url(#arrow-green)"/>')
label(22, 300, "plain language", "#16a34a", side="right")

# Legend
a('  <g transform="translate(56, 630)">')
a('    <text x="0" y="0" font-size="12" font-weight="600" fill="#111827">Flows</text>')
a('    <line x1="0" y1="18" x2="28" y2="18" stroke="#2563eb" stroke-width="2" marker-end="url(#arrow-blue)"/>')
a('    <text x="36" y="22" font-size="12" fill="#6b7280">Speech to chart events</text>')
a('    <line x1="220" y1="18" x2="248" y2="18" stroke="#16a34a" stroke-width="1.5" marker-end="url(#arrow-green)"/>')
a('    <text x="256" y="22" font-size="12" fill="#6b7280">State to screens</text>')
a('    <line x1="400" y1="18" x2="428" y2="18" stroke="#ea580c" stroke-width="1.5" marker-end="url(#arrow-orange)"/>')
a('    <text x="436" y="22" font-size="12" fill="#6b7280">PMS write-back</text>')
a('    <line x1="560" y1="18" x2="588" y2="18" stroke="#6b7280" stroke-width="1.5" stroke-dasharray="4,2" marker-end="url(#arrow-gray)"/>')
a('    <text x="596" y="22" font-size="12" fill="#6b7280">BroadcastChannel</text>')
a('    <text x="0" y="48" font-size="12" fill="#6b7280">Nothing leaves the room for STT — Whisper runs in the clinician browser.</text>')
a("  </g>")
a("</svg>")

OUT.write_text("\n".join(lines), encoding="utf-8")
print(f"wrote {OUT}")
