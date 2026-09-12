import { useState } from "react";
import { Link } from "react-router-dom";
import { isLikelyIphone, isLikelyShokz } from "../audio/devices";
import { useLiveMic } from "../audio/useLiveMic";
import { architecturePath, clinicianPath } from "../config/paths";
import { chartedToothCount, toothHasTodayReading } from "../domain/exam";
import { useExamStore } from "../store/examStore";
import { NeoPerioGrid } from "./neo/NeoPerioGrid";
import { NeoToothPanel } from "./neo/NeoToothPanel";

type NeoTab = "perio" | "chart" | "timeline" | "radio" | "notes";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function formatVisitDate(iso: string): string {
  const parts = iso.split("-");
  if (parts.length !== 3) {
    return iso;
  }
  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);
  if (!year || !month || !day || month < 1 || month > 12) {
    return iso;
  }
  return `${MONTHS[month - 1]} ${day}, ${year}`;
}

function Waveform({
  level,
  listening,
  speaking,
}: {
  level: number;
  listening: boolean;
  speaking: boolean;
}) {
  const bases = [0.35, 0.7, 1, 0.55, 0.9, 0.4, 0.8, 0.6, 0.45];
  return (
    <div className={`neo-wave${speaking ? " live" : listening ? " open" : ""}`} aria-hidden="true">
      {bases.map((base, index) => {
        const height = listening ? 5 + base * (8 + level * 26) : 4 + base * 4;
        return <span key={index} style={{ height: `${Math.round(height)}px` }} />;
      })}
    </div>
  );
}

function Checklist({
  toothIdentified,
  measurements,
  findings,
  explanation,
}: {
  toothIdentified: boolean;
  measurements: boolean;
  findings: boolean;
  explanation: boolean;
}) {
  const rows = [
    { done: toothIdentified, label: toothIdentified ? "Tooth identified" : "Waiting for a tooth" },
    { done: measurements, label: measurements ? "Measurements captured" : "Waiting for measurements" },
    { done: findings, label: findings ? "Findings updated" : "Findings not updated yet" },
    { done: explanation, label: explanation ? "Patient explanation ready" : "Explanation pending" },
  ];
  return (
    <ul className="neo-check">
      {rows.map((row) => (
        <li key={row.label} className={row.done ? "done" : undefined}>
          <span>{row.done ? "✓" : "○"}</span>
          {row.label}
        </li>
      ))}
    </ul>
  );
}

export function ClinicianNeoView() {
  const store = useExamStore();
  const mic = useLiveMic();
  const [tab, setTab] = useState<NeoTab>("perio");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [chatDraft, setChatDraft] = useState("");
  const [chatHint, setChatHint] = useState<string>();

  const latest = store.heard[0];
  const charted = chartedToothCount(store.current);
  const active = store.activeTooth;
  const activeState = active ? store.current.teeth[active] : undefined;
  const measurements = active ? toothHasTodayReading(activeState) : false;
  const findings = Boolean(
    measurements ||
      (activeState &&
        (activeState.notes.length > 0 ||
          activeState.mobility !== undefined ||
          activeState.furcation !== undefined)),
  );
  const explanation = Boolean(store.caption && store.caption.length > 0);
  const interpreting = mic.speaking || (latest?.text === "Transcribing…");
  const transcript = latest?.text
    ? latest.text
    : mic.listening
      ? "Listening for the next charting line…"
      : "Press Listening to start live transcription.";

  const endVisit = () => {
    mic.publishUtterance("let's wrap up");
    if (mic.listening) {
      mic.stopMic();
    }
  };

  return (
    <main className="screen clinician-neo">
      <header className="neo-topbar">
        <div className="neo-brand">
          <img src={`${import.meta.env.BASE_URL}molarmind-favicon.png`} alt="" />
          <div>
            <strong>MolarMind</strong>
            <small>Listens. Charts. Clarifies.</small>
          </div>
        </div>

        <div className="neo-patient">
          <strong>{store.current.patientName}</strong>
          <small>Dental Cleaning · {formatVisitDate(store.current.date)}</small>
        </div>

        <div className="neo-listen-cluster">
          <button
            type="button"
            className={`neo-listen${mic.listening ? " on" : ""}${mic.speaking ? " speaking" : ""}`}
            onClick={() => (mic.listening ? mic.stopMic() : void mic.startMic())}
          >
            <i />
            {mic.listening ? "Listening" : "Listen"}
          </button>
          <Waveform level={mic.level} listening={mic.listening} speaking={mic.speaking} />
        </div>

        <div className="neo-top-actions">
          <div className="neo-settings-wrap">
            <button
              type="button"
              className="neo-icon-btn"
              aria-label="Settings"
              aria-expanded={settingsOpen}
              onClick={() => setSettingsOpen((open) => !open)}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M19.1 12.9a7.5 7.5 0 0 0 .1-.9 7.5 7.5 0 0 0-.1-.9l2-1.6a.5.5 0 0 0 .1-.6l-1.9-3.3a.5.5 0 0 0-.6-.2l-2.4 1a7 7 0 0 0-1.6-.9l-.4-2.5a.5.5 0 0 0-.5-.4h-3.8a.5.5 0 0 0-.5.4l-.4 2.5a7 7 0 0 0-1.6.9l-2.4-1a.5.5 0 0 0-.6.2L2.7 8.9a.5.5 0 0 0 .1.6l2 1.6a7.5 7.5 0 0 0-.1.9 7.5 7.5 0 0 0 .1.9l-2 1.6a.5.5 0 0 0-.1.6l1.9 3.3a.5.5 0 0 0 .6.2l2.4-1a7 7 0 0 0 1.6.9l.4 2.5a.5.5 0 0 0 .5.4h3.8a.5.5 0 0 0 .5-.4l.4-2.5a7 7 0 0 0 1.6-.9l2.4 1a.5.5 0 0 0 .6-.2l1.9-3.3a.5.5 0 0 0-.1-.6ZM12 15.5A3.5 3.5 0 1 1 12 8.5a3.5 3.5 0 0 1 0 7Z"
                />
              </svg>
            </button>
            {settingsOpen ? (
              <div className="neo-settings">
                <label>
                  Microphone
                  <select value={mic.selectedId ?? ""} onChange={(event) => mic.setSelectedId(event.target.value)}>
                    {mic.devices.length === 0 ? <option value="">No microphones yet</option> : null}
                    {mic.devices.map((device) => (
                      <option key={device.id} value={device.id}>
                        {isLikelyIphone(device.label)
                          ? `iPhone · ${device.label}`
                          : isLikelyShokz(device.label)
                            ? `Shokz · ${device.label}`
                            : device.label}
                      </option>
                    ))}
                  </select>
                </label>
                <p className="neo-settings-status">
                  {mic.speaking ? "Hearing you…" : mic.listening ? "Mic open" : "Mic idle"}
                  {mic.statusDetail ? ` · ${mic.statusDetail}` : ""}
                </p>
                <div className="neo-settings-actions">
                  <button type="button" onClick={() => void mic.refreshDevices()}>
                    Refresh mics
                  </button>
                  <button
                    type="button"
                    onClick={() => mic.publishUtterance("tooth fourteen, distal five, bleeding")}
                  >
                    Test event
                  </button>
                  <Link to={clinicianPath} onClick={() => setSettingsOpen(false)}>
                    Classic clinician
                  </Link>
                  <Link to={architecturePath} onClick={() => setSettingsOpen(false)}>
                    Architecture
                  </Link>
                </div>
              </div>
            ) : null}
          </div>
          <button type="button" className="neo-end" onClick={endVisit}>
            End visit
          </button>
        </div>
      </header>

      <section className="neo-live">
        <div className="neo-transcript">
          <p className="neo-kicker">Live transcription</p>
          <p className="neo-quote">“{transcript}”</p>
        </div>
        <div className="neo-status">
          <p className="neo-kicker">
            {interpreting ? "MolarMind is interpreting…" : mic.listening ? "Ready for the next line" : "Standby"}
          </p>
          <Checklist
            toothIdentified={Boolean(active)}
            measurements={measurements}
            findings={findings}
            explanation={explanation}
          />
        </div>
      </section>

      <section className="neo-toolbar">
        <nav className="neo-tabs" aria-label="Chart views">
          <button type="button" className={tab === "perio" ? "on" : undefined} onClick={() => setTab("perio")}>
            Periodontal Chart
          </button>
          <button type="button" className={tab === "chart" ? "on" : undefined} onClick={() => setTab("chart")}>
            Chart View
          </button>
          <button type="button" className={tab === "timeline" ? "on" : undefined} onClick={() => setTab("timeline")}>
            Timeline
          </button>
          <button type="button" className={tab === "radio" ? "on" : undefined} onClick={() => setTab("radio")}>
            Radiographs
          </button>
          <button type="button" className={tab === "notes" ? "on" : undefined} onClick={() => setTab("notes")}>
            Notes
          </button>
        </nav>
        <div className="neo-progress">
          <span>
            {charted} of 32 teeth charted
          </span>
          <div className="neo-progress-bar" aria-hidden="true">
            <i style={{ width: `${(charted / 32) * 100}%` }} />
          </div>
        </div>
        <ul className="neo-legend">
          <li>
            <i className="green" /> Normal (1–3 mm)
          </li>
          <li>
            <i className="amber" /> Watch (4 mm)
          </li>
          <li>
            <i className="red" /> Concern (≥5 mm)
          </li>
          <li>
            <b className="neo-bop" /> Bleeding on probing
          </li>
          <li>
            <b className="neo-rec" /> Recession
          </li>
        </ul>
      </section>

      <section className="neo-workspace">
        {tab === "perio" ? (
          <>
            <NeoPerioGrid
              exam={store.current}
              activeTooth={store.activeTooth}
              onSelectTooth={store.selectTooth}
            />
            <NeoToothPanel
              exam={store.current}
              lastVisit={store.lastVisit}
              tooth={store.activeTooth}
              caption={store.caption}
              onSelectTooth={store.selectTooth}
            />
          </>
        ) : (
          <div className="neo-stub">
            <h2>
              {tab === "chart"
                ? "Chart view"
                : tab === "timeline"
                  ? "Timeline"
                  : tab === "radio"
                    ? "Radiographs"
                    : "Notes"}
            </h2>
            <p>This panel is a visual stub. Live charting stays on Periodontal Chart.</p>
          </div>
        )}
      </section>

      <form
        className="neo-chat"
        onSubmit={(event) => {
          event.preventDefault();
          setChatDraft("");
          setChatHint("Notes and chat are coming soon.");
        }}
      >
        <input
          value={chatDraft}
          onChange={(event) => setChatDraft(event.target.value)}
          placeholder="Add a note or ask MolarMind…"
        />
        {chatHint ? <span className="neo-chat-hint">{chatHint}</span> : null}
        <button type="submit">Send</button>
      </form>

      {mic.pendingResetAll ? (
        <div className="confirm-overlay">
          <section className="panel confirm-dialog neo-confirm">
            <h2>Reset all charted data?</h2>
            <p className="hint">This clears today’s perio chart for {store.current.patientName}. Last-visit values stay.</p>
            <div className="controls">
              <button type="button" onClick={mic.cancelResetAll}>
                Cancel
              </button>
              <button className="primary" type="button" onClick={mic.confirmResetAll}>
                Reset all
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </main>
  );
}
