/**
 * Host 同源路由封装
 *  - GET  /ext/dshp-vision-bridge/state
 *  - POST /ext/dshp-vision-bridge/config
 *  - GET  /ext/dshp-vision-bridge/check
 */
import type { CheckResponse, ConfigPatch, StateResponse, VisionConfig } from './types.js';

const BASE = '/ext/dshp-vision-bridge';

export async function fetchState(): Promise<StateResponse> {
  const r = await fetch(`${BASE}/state`, { cache: 'no-store' });
  return (await r.json()) as StateResponse;
}

export async function saveConfig(
  patch: ConfigPatch,
): Promise<{ ok: boolean; config?: VisionConfig; error?: string }> {
  const r = await fetch(`${BASE}/config`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(patch),
  });
  return (await r.json()) as { ok: boolean; config?: VisionConfig; error?: string };
}

export async function checkConnectivity(): Promise<CheckResponse> {
  const r = await fetch(`${BASE}/check`, { cache: 'no-store' });
  return (await r.json()) as CheckResponse;
}
