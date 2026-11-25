// utils/i18n/paths.js — add or remove the /en part of an address.
// Safe to use on the server and in the browser.

import { EN_PREFIX } from './config';

// "/en/news/x" → "/news/x", "/en" → "/", "/news/x" → "/news/x"
export function stripLangPrefix(pathname = '/') {
  if (pathname === EN_PREFIX) return '/';
  if (pathname.startsWith(`${EN_PREFIX}/`)) return pathname.slice(EN_PREFIX.length);
  return pathname;
}

export function hasEnPrefix(pathname = '/') {
  return pathname === EN_PREFIX || pathname.startsWith(`${EN_PREFIX}/`);
}

// Address of the same page in the given language.
// Leaves full URLs to other sites, #anchors, mailto: etc. untouched.
export function localizePath(path, lang) {
  if (typeof path !== 'string' || !path.startsWith('/') || path.startsWith('//')) return path;
  const plain = stripLangPrefix(path);
  if (lang !== 'en') return plain;
  return plain === '/' ? EN_PREFIX : `${EN_PREFIX}${plain}`;
}
