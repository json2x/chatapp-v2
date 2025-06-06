declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: string;
    VUE_ROUTER_MODE: 'hash' | 'history' | 'abstract' | undefined;
    VUE_ROUTER_BASE: string | undefined;
  }
}

// Vite-specific type declarations
interface ImportMeta {
  readonly env: ImportMetaEnv;
  readonly hot?: {
    readonly data: Record<string, unknown>;
    accept(): void;
    accept(cb: (mod: unknown) => void): void;
    accept(dep: string, cb: (mod: unknown) => void): void;
    accept(deps: string[], cb: (mods: unknown[]) => void): void;
    prune(cb: () => void): void;
    dispose(cb: (data: Record<string, unknown>) => void): void;
    decline(): void;
    invalidate(): void;
    on(event: string, cb: (...args: unknown[]) => void): void;
  };
}

interface ImportMetaEnv {
  [key: string]: string | boolean | undefined;
  BASE_URL: string;
  MODE: string;
  DEV: boolean;
  PROD: boolean;
  SSR: boolean;
  // Supabase environment variables
  VITE_SUPABASE_URL: string;
  VITE_SUPABASE_ANON_KEY: string;
}
