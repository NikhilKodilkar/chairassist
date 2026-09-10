import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

function loadEnv(filePath) {
  const values = {};
  let text = "";
  try {
    text = readFileSync(filePath, "utf8");
  } catch {
    return values;
  }

  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }
    const eq = trimmed.indexOf("=");
    if (eq < 0) {
      continue;
    }
    values[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
  }
  return values;
}

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const env = {
  ...loadEnv(join(root, ".env.example")),
  ...loadEnv(join(root, ".env")),
};

const host = env.VITE_DEV_HOST || "127.0.0.1";
const port = env.VITE_DEV_PORT || "5173";
const clinicianPath = env.VITE_CLINICIAN_PATH || "/clinician";
const patientPath = env.VITE_PATIENT_PATH || "/patient";
const origin = `http://${host}:${port}`;

const child = spawn("npm", ["run", "dev"], {
  cwd: root,
  stdio: ["inherit", "pipe", "pipe"],
  env: process.env,
});

let opened = false;

function openViews() {
  if (opened) {
    return;
  }
  opened = true;
  spawn("open", [`${origin}${clinicianPath}?script=demo1`], { stdio: "inherit" });
  spawn("open", [`${origin}${patientPath}`], { stdio: "inherit" });
}

function handleChunk(chunk) {
  const text = String(chunk);
  process.stdout.write(text);
  if (text.includes("Local:") || text.includes("ready in")) {
    openViews();
  }
}

child.stdout.on("data", handleChunk);
child.stderr.on("data", (chunk) => {
  const text = String(chunk);
  process.stderr.write(text);
  handleChunk(text);
});

child.on("exit", (code) => {
  process.exit(code ?? 0);
});
