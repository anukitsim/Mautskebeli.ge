// app/free-column/[id]/[lang]/page.jsx — /free-column/<slug>/ENG|RU|HY|AZ
// Same page as translated articles (app/all-articles/[id]/TranslatedPostPage.jsx).
import { makeTranslatedPostPage } from '@/app/all-articles/[id]/TranslatedPostPage';

const page = makeTranslatedPostPage({
  postType: 'free-column',
  basePath: '/free-column',
  sectionName: 'თავისუფალი სვეტი',
  statsType: 'free-column',
});

export const generateMetadata = page.generateMetadata;
export default page.Page;
