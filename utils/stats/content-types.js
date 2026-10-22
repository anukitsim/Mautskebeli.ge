// utils/stats/content-types.js — the kinds of content we count, in one place.
//
// type      = the name stored in the database (stats_opens.content_type)
// wp        = the WordPress REST route (/wp/v2/<wp>)
// author    = the ACF field that holds the author line
// path      = the public page of one item

export const CONTENT_TYPES = {
  article: {
    label: 'სტატიები',
    wp: 'article',
    author: 'ავტორი',
    path: (item, lang = 'ka') => {
      const base = `/all-articles/${item.slug || item.id}`;
      return lang === 'en' ? `${base}/ENG` : lang === 'ru' ? `${base}/RU` : base;
    },
  },
  news: {
    label: 'ახალი ამბები',
    wp: 'news',
    author: 'author',
    path: (item) => `/news/${item.slug}`,
  },
  'free-column': {
    label: 'თავისუფალი სვეტი',
    wp: 'free-column',
    author: 'ავტორი',
    path: (item) => `/free-column/${item.slug || item.id}`,
  },
  translate: {
    label: 'თარგმანი',
    wp: 'targmani',
    author: 'ავტორი',
    path: (item) => `/translate/${item.slug || item.id}`,
  },
  book: {
    label: 'წიგნები',
    wp: 'mau-books',
    author: 'author',
    path: (item) => `/books/${item.id}`,
  },
};

export const TYPE_ORDER = ['article', 'news', 'free-column', 'translate', 'book'];

export const isContentType = (type) => Object.prototype.hasOwnProperty.call(CONTENT_TYPES, type);
