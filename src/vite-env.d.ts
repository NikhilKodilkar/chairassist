/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DEV_HOST: string;
  readonly VITE_DEV_PORT: string;
  readonly VITE_CLINICIAN_PATH: string;
  readonly VITE_PATIENT_PATH: string;
  readonly VITE_WHISPER_MODEL: string;
  readonly VITE_WHISPER_DTYPE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
