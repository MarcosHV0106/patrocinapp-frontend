const runtime = globalThis as typeof globalThis & {
  __PATROCINAPP_CONFIG__?: { apiUrl?: string };
};

export const environment = {
  production: true,
  apiUrl: runtime.__PATROCINAPP_CONFIG__?.apiUrl || '/api'
};
