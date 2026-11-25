// utils/translate/provider.js — the machine-translation service (server only).
//
// MT_PROVIDER=microsoft  Microsoft Translator (free plan: 2M characters/month)
//   MT_MICROSOFT_KEY     the resource key from the Azure portal
//   MT_MICROSOFT_REGION  the resource region, e.g. "westeurope"
// MT_PROVIDER=mock       no network: Georgian letters → Latin letters, for
//                        testing layouts locally. Never use in production.
// (not set)              translation is off; English pages show the Georgian.

const MICROSOFT_URL = 'https://api.cognitive.microsofttranslator.com/translate';

// Microsoft limits: ≤ 1000 texts and ≤ 50,000 characters per request.
export const MAX_BATCH_ITEMS = 100;
export const MAX_BATCH_CHARS = 10_000; // smaller batches = each finishes fast

export function providerName() {
  const name = process.env.MT_PROVIDER || '';
  if (name === 'microsoft' && process.env.MT_MICROSOFT_KEY) return 'microsoft';
  if (name === 'mock') return 'mock';
  return '';
}

async function microsoft(texts, { html }) {
  const params = new URLSearchParams({ 'api-version': '3.0', from: 'ka', to: 'en' });
  if (html) params.set('textType', 'html');
  const headers = {
    'Content-Type': 'application/json; charset=UTF-8',
    'Ocp-Apim-Subscription-Key': process.env.MT_MICROSOFT_KEY,
  };
  if (process.env.MT_MICROSOFT_REGION) {
    headers['Ocp-Apim-Subscription-Region'] = process.env.MT_MICROSOFT_REGION;
  }
  const res = await fetch(`${MICROSOFT_URL}?${params}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(texts.map((Text) => ({ Text }))),
    cache: 'no-store',
  });
  if (!res.ok) {
    const detail = (await res.text()).slice(0, 300);
    throw new Error(`Microsoft Translator ${res.status}: ${detail}`);
  }
  const data = await res.json();
  return data.map((item) => item?.translations?.[0]?.text ?? '');
}

// Test-only: Georgian letters → Latin, so English pages look "translated".
const LATIN = {
  'ა': 'a', 'ბ': 'b', 'გ': 'g', 'დ': 'd', 'ე': 'e', 'ვ': 'v', 'ზ': 'z', 'თ': 't',
  'ი': 'i', 'კ': 'k', 'ლ': 'l', 'მ': 'm', 'ნ': 'n', 'ო': 'o', 'პ': 'p', 'ჟ': 'zh',
  'რ': 'r', 'ს': 's', 'ტ': 't', 'უ': 'u', 'ფ': 'p', 'ქ': 'k', 'ღ': 'gh', 'ყ': 'q',
  'შ': 'sh', 'ჩ': 'ch', 'ც': 'ts', 'ძ': 'dz', 'წ': 'ts', 'ჭ': 'ch', 'ხ': 'kh',
  'ჯ': 'j', 'ჰ': 'h',
};
async function mock(texts) {
  return texts.map((t) => t.replace(/[ა-ჿ]/g, (c) => LATIN[c] || c));
}

export async function translateBatch(texts, { html = false } = {}) {
  const name = providerName();
  if (name === 'microsoft') return microsoft(texts, { html });
  if (name === 'mock') return mock(texts);
  throw new Error('Machine translation is not configured (MT_PROVIDER).');
}
