/// <reference types="vite/client" />

declare module "*.json" {
  const value: unknown;
  export default value;
}

interface ImportMetaEnv {
  readonly VITE_DEV_HOST: string;
  readonly VITE_DEV_PORT: string;
  readonly VITE_CLINICIAN_PATH: string;
  readonly VITE_CLINICIAN_NEO_PATH: string;
  readonly VITE_PATIENT_PATH: string;
  readonly VITE_ARCHITECTURE_PATH: string;
  readonly VITE_WHISPER_MODEL: string;
  readonly VITE_WHISPER_DTYPE: string;
  readonly VITE_OPENDENTAL_API_BASE: string;
  readonly VITE_OPENDENTAL_DEVELOPER_KEY: string;
  readonly VITE_OPENDENTAL_CUSTOMER_KEY: string;
  readonly VITE_OPENDENTAL_PAT_NUM: string;
  readonly VITE_OPENDENTAL_PROV_NUM: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
