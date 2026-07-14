import { writeFileSync } from 'node:fs';

const apiUrl = (process.env.API_URL || '/api').replace(/\/$/, '');
const content = `window.__PATROCINAPP_CONFIG__ = ${JSON.stringify({ apiUrl })};\n`;
writeFileSync(new URL('../public/runtime-config.js', import.meta.url), content, 'utf8');
