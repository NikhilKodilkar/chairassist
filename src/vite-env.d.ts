/// <reference types="vite/client" />

declare module "*.json" {
  const value: unknown;
  export default value;
}

interface ImportMetaEnv {
  readonly VITE_DEV_HOST: string;
  readonly VITE_DEV_PORT: string;
  readonly VITE_LANDING_PATH: string;
  readonly VITE_ABOUT_PATH: string;
  readonly VITE_LANDING_DEMO_HREF: string;
  readonly VITE_LANDING_VIDEO_HREF: string;
  readonly VITE_CLINICIAN_PATH: string;
  readonly VITE_CLINICIAN_NEO_PATH: string;
  readonly VITE_PATIENT_PATH: string;
  readonly VITE_ARCHITECTURE_PATH: string;
  readonly VITE_PRIVACY_PATH: string;
  readonly VITE_NPP_PATH: string;
  readonly VITE_TERMS_PATH: string;
  readonly VITE_COOKIES_PATH: string;
  readonly VITE_ACCESSIBILITY_PATH: string;
  readonly VITE_DISCLAIMER_PATH: string;
  readonly VITE_HIPAA_PATH: string;
  readonly VITE_PRIVACY_CHOICES_PATH: string;
  readonly VITE_LEGAL_ENTITY: string;
  readonly VITE_LEGAL_EFFECTIVE_DATE: string;
  readonly VITE_LEGAL_JURISDICTION: string;
  readonly VITE_PRIVACY_EMAIL: string;
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
