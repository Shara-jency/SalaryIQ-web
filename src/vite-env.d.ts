/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DATA_MODE?: "local" | "api";
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
