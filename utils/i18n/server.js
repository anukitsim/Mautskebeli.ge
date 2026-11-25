// utils/i18n/server.js — "which language is this request?" for server
// components and generateMetadata. (Browser components use useLanguage().)

import { headers } from 'next/headers';
import { DEFAULT_LANG, LANG_HEADER, isSiteLang } from './config';

export function getLang() {
  try {
    const value = headers().get(LANG_HEADER);
    return isSiteLang(value) ? value : DEFAULT_LANG;
  } catch {
    // Outside a request (e.g. at build time): Georgian.
    return DEFAULT_LANG;
  }
}
