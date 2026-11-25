// app/all-articles/[id]/[lang]/page.jsx — /all-articles/<slug>/ENG|RU|HY|AZ
import { makeTranslatedPostPage } from '../TranslatedPostPage';

const page = makeTranslatedPostPage({
  postType: 'article',
  basePath: '/all-articles',
  sectionName: 'სტატიები',
  statsType: 'article',
});

export const generateMetadata = page.generateMetadata;
export default page.Page;
