// app/all-articles/[id]/translations.js
//
// One list of every language an article can be published in.
// To add a new language later: add one entry here + its fields in
// WordPress (see the "article translations" ACF group in functions.php).
//
// `field` is the WordPress (ACF) field prefix, e.g. language3_title.
// `path`  is the URL ending, e.g. /all-articles/<slug>/HY.

export const ORIGINAL = {
  field: null,
  path: null,
  code: 'ka',
  label: 'ქართული',
  ogLocale: 'ka_GE',
  ui: {
    language: 'ენა',
    pdf: 'იხილეთ სტატიის პდფ ვერსია',
    share: 'გააზიარე',
    copyLink: 'ბმულის კოპირება',
    copied: 'დაკოპირდა!',
    backToTop: 'საწყისზე დაბრუნება',
  },
};

export const TRANSLATIONS = [
  {
    field: 'language1',
    path: 'ENG',
    code: 'en',
    label: 'English',
    ogLocale: 'en_US',
    ui: {
      language: 'Language',
      pdf: 'Download the PDF version',
      share: 'Share',
      copyLink: 'Copy link',
      copied: 'Copied!',
      backToTop: 'Back to top',
    },
  },
  {
    field: 'language2',
    path: 'RU',
    code: 'ru',
    label: 'Русский',
    ogLocale: 'ru_RU',
    ui: {
      language: 'Язык',
      pdf: 'Скачать PDF-версию',
      share: 'Поделиться',
      copyLink: 'Копировать ссылку',
      copied: 'Скопировано!',
      backToTop: 'Вернуться к началу',
    },
  },
  {
    field: 'language3',
    path: 'HY',
    code: 'hy',
    label: 'Հայերեն',
    ogLocale: 'hy_AM',
    ui: {
      language: 'Լեզու',
      pdf: 'Ներբեռնել PDF տարբերակը',
      share: 'Կիսվել',
      copyLink: 'Պատճենել հղումը',
      copied: 'Պատճենվեց',
      backToTop: 'Վերադառնալ վերև',
    },
  },
  {
    field: 'language4',
    path: 'AZ',
    code: 'az',
    label: 'Azərbaycanca',
    ogLocale: 'az_AZ',
    ui: {
      language: 'Dil',
      pdf: 'PDF versiyasını yükləyin',
      share: 'Paylaş',
      copyLink: 'Linki kopyala',
      copied: 'Kopyalandı!',
      backToTop: 'Yuxarı qayıt',
    },
  },
];

// "/ENG", "/eng" → the English entry. Unknown → undefined.
export function findTranslationByPath(path) {
  if (!path) return undefined;
  const upper = String(path).toUpperCase();
  return TRANSLATIONS.find((t) => t.path === upper);
}

// A translation has real content when its title field is filled in.
export function hasTranslationContent(acf, translation) {
  return Boolean(acf && acf[`${translation.field}_title`]);
}

// Translations shown in the switcher: the editor turned the toggle on
// AND filled in the title (so we never link to an empty page).
export function getPublishedTranslations(acf) {
  return TRANSLATIONS.filter(
    (t) => acf && acf[t.field] === true && hasTranslationContent(acf, t)
  );
}

export function articleUrl(slug, translation) {
  const base = `/all-articles/${slug}`;
  return translation && translation.path ? `${base}/${translation.path}` : base;
}
