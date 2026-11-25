'use client';

// Shown at the top of English content pages: says the text is a machine
// translation and offers the Georgian original. When the translation is
// not finished yet (complete = false), it says so instead of hiding it.

import { useLanguage } from '@/app/context/LanguageContext';

export default function MachineTranslationNote({ complete = true, className = '' }) {
  const { language, t, changeLanguage } = useLanguage();
  if (language !== 'en') return null;

  return (
    <p
      lang="en"
      className={`my-4 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-lg border border-[#AD88C6]/40 bg-[#AD88C6]/10 px-3 py-2 text-sm text-[#474F7A] ${className}`}
    >
      <span>{complete ? t('mt.note') : t('mt.pending')}</span>
      <button
        type="button"
        onClick={() => changeLanguage('ka')}
        className="font-semibold underline underline-offset-2 hover:text-[#AD88C6]"
      >
        {t('mt.original')}
      </button>
    </p>
  );
}
