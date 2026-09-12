/// <reference types="vite/client" />

declare module "*.json" {
  const value: unknown;
  export default value;
}

interface ImportMetaEnv {
  readonly VITE_DEV_HOST: string;
  readonly VITE_DEV_PORT: string;
  readonly VITE_CLINICIAN_PATH: string;
  readonly VITE_PATIENT_PATH: string;
  readonly VITE_ARCHITECTURE_PATH: string;
  readonly VITE_WHISPER_MODEL: string;
  readonly VITE_WHISPER_DTYPE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
