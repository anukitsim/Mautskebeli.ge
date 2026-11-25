// utils/translate/server.js — for server components that fetch WordPress:
//   const data = await englishIfNeeded(await res.json());
// On English pages the texts come back translated; on Georgian pages the
// data is returned unchanged (no work, no cost).

import { getLang } from '../i18n/server';
import { translateWpJson } from './wp';

export async function englishIfNeeded(data, options) {
  if (getLang() !== 'en') return data;
  return (await translateWpJson(data, options)).data;
}
