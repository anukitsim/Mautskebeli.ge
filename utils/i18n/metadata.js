// utils/i18n/metadata.js — section titles/descriptions in the page's language.
//
//   const metadataKa = { title: 'ახალი ამბები | მაუწყებელი', ... };
//   export function generateMetadata() { return localizeMetadata(metadataKa); }
//
// On English pages every text found in the dictionary is replaced, the
// share-preview language becomes en_US and the share address gets /en.

import { getLang } from './server';
import { translateUi } from './dictionary';
import { localizePath } from './paths';

function mapStrings(value, fn) {
  if (typeof value === 'string') return fn(value);
  if (Array.isArray(value)) return value.map((v) => mapStrings(v, fn));
  if (value && typeof value === 'object' && !(value instanceof URL)) {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, mapStrings(v, fn)]));
  }
  return value;
}

// "ახალი ამბები | მაუწყებელი" → "News | Mautskebeli": whole text first,
// then each part around " | ", " – ", " - ".
function translateTitle(text) {
  const whole = translateUi('en', text);
  if (whole !== text) return whole;
  return text.split(/(\s[|–—-]\s)/).map((part) => translateUi('en', part)).join('');
}

export function localizeMetadata(metadata) {
  if (getLang() !== 'en') return metadata;
  const out = mapStrings(metadata, translateTitle);
  if (out.openGraph) {
    out.openGraph = { ...out.openGraph, locale: 'en_US' };
    if (typeof out.openGraph.url === 'string') {
      const u = out.openGraph.url.replace(/^https:\/\/www\.mautskebeli\.ge/, '');
      out.openGraph.url = `https://www.mautskebeli.ge${localizePath(u || '/', 'en')}`;
    }
  }
  return out;
}
