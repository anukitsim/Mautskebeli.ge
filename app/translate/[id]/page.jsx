import Image from "next/image";
import { notFound } from "next/navigation";
import moment from "moment";
import "moment/locale/ka";
import { decode } from "html-entities";
import sanitizeHtml from "sanitize-html";
import { load } from "cheerio";
import DynamicClientComponents from "./DynamicClientComponents";

/**
 * Categories for the top links
 */
const categories = [
  { name: "სტატიები", path: "/all-articles" },
  { name: "თარგმანი", path: "/translate" },
  { name: "მაუწყებელი წიგნები", path: "/books" },
  { name: "თავისუფალი სვეტი", path: "/free-column" },
];

/**
 * Server-side fetch for the translation
 */
async function fetchTranslation(id) {
  const apiUrl = `${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/wp/v2/targmani/${id}?acf_format=standard&_fields=id,title,acf,date`;

  try {
    const res = await fetch(apiUrl, { next: { revalidate: 10 } });
    if (!res.ok) {
      console.error(`Failed to fetch translation with id ${id}: ${res.statusText}`);
      return null;
    }
    const data = await res.json();
    console.log("Fetched translation data:", data); // Debugging log
    return data;
  } catch (error) {
    console.error(`Error fetching translation with id ${id}:`, error);
    return null;
  }
}

/**
 * generateMetadata() – used by Next.js for SEO & Open Graph
 * Must be in a server component file (i.e. no "use client")
 */
export async function generateMetadata({ params }) {
  const { id } = params;
  const translation = await fetchTranslation(id);

  // If no data found, return a 404-friendly metadata
  if (!translation) {
    console.log("Translation not found for ID:", id);
    return {
      title: "Translation Not Found",
      description: "This translation does not exist.",
    };
  }

  // Build out SEO metadata
  const decodedTitle = decode(translation.title.rendered || "");
  const description =
    translation.acf.description || translation.acf.sub_title || "";
  const imageUrl = translation.acf.image?.startsWith("http")
    ? translation.acf.image
    : `https://mautskebeli.wpenginepowered.com${translation.acf.image}`;

  console.log("Generated og:image URL:", imageUrl);

  return {
    title: decodedTitle,
    description,
    openGraph: {
      title: decodedTitle,
      description,
      url: `https://www.mautskebeli.ge/translate/${id}`,
      type: "article",
      images: [imageUrl],
      locale: "ka_GE",
      siteName: "Mautskebeli",
    },
    twitter: {
      card: "summary_large_image",
      title: decodedTitle,
      description,
      images: [imageUrl],
    },
  };
}

/**
 * Format date with Georgian locale
 */
function formatDate(dateString) {
  moment.locale("ka");
  return moment(dateString).format("LL");
}

/**
 * Sanitize the main-text HTML
 */
function getSanitizedContent(content) {
  const sanitized = sanitizeHtml(content, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
    allowedAttributes: {
      img: ["src", "alt", "title"],
      a: ["href", "target", "rel"],
    },
  });

  const $ = load(sanitized);
  $("a").attr("target", "_blank").attr("rel", "noopener noreferrer");
  $("blockquote").css({
    "border-left": "5px solid #ccc",
    "padding-left": "15px",
    "margin-left": "20px",
  });
  return $.html();
}

/**
 * Single Translation Page (Server Component)
 */
export default async function TranslationPage({ params }) {
  const { id } = params;
  const translation = await fetchTranslation(id);

  // 404 if not found
  if (!translation) {
    console.log("Translation not found for ID:", id);
    notFound();
  }

  // Prepare data
  const formattedDate = formatDate(translation.date);
  const sanitizedContent = getSanitizedContent(translation.acf["main-text"] || "");
  const imageUrl = translation.acf.image?.startsWith("http")
    ? translation.acf.image
    : `https://mautskebeli.wpenginepowered.com${translation.acf.image}`;

  console.log("TranslationPage Image URL:", imageUrl);

  return (
    <section className="w-full mx-auto mt-10 px-4 lg:px-0 overflow-x-hidden relative">
      <div className="w-full lg:w-[60%] mx-auto bg-opacity-90 p-5 rounded-lg">
        {/* Category Links */}
        <div className="lg:flex hidden justify-start rounded-md space-x-6 px-20 gap-10 py-4 mt-[-12px] mb-10 font-noto-sans-georgian w-full mx-auto bg-[#AD88C6]">
          {categories.map((category) => (
            <a
              key={category.name}
              href={category.path}
              className={`text-sm text-[#474F7A] ${
                category.name === "თარგმანი"
                  ? "text-white font-bold"
                  : "text-[#474F7A] hover:scale-110"
              }`}
            >
              {category.name}
            </a>
          ))}
        </div>

        {/* Featured Image */}
        <div className="w-full h-auto mb-5">
          <Image
            src={imageUrl || "/images/default-og-image.jpg"}
            alt={translation.title.rendered}
            width={800}
            height={450}
            className="rounded-lg w-full"
            style={{ objectFit: "cover" }}
          />
        </div>

        {/* Title, Subtitle */}
        <h1 className="font-alk-tall-mtavruli text-[32px] sm:text-[64px] font-light leading-none text-[#474F7A] mt-[24px] mb-5">
          {translation.title.rendered}
        </h1>
        <h3 className="font-alk-tall-mtavruli sm:text-[34px] lg:text-[34px] font-light leading-wide text-[#474F7A] mt-[24px] mb-5">
          {translation.acf.sub_title}
        </h3>

        {/* Author (ავტორი) */}
        <h2 className="font-noto-sans-georgian text-[16px] sm:text-[24px] font-extrabold text-[#474F7A] leading-normal mb-2">
          {translation.acf["ავტორი"]}
        </h2>

        {/* Translator (მთარგმნელი) */}
        {translation.acf["მთარგმნელი"] && (
          <h2 className="font-noto-sans-georgian text-[16px] sm:text-[24px] font-extrabold text-[#AD88C6] leading-normal mb-5">
            {translation.acf["მთარგმნელი"]}
          </h2>
        )}

        {/* Date */}
        <p className="text-[#474F7A] font-semibold pb-10">{formattedDate}</p>

        {/* PDF Download */}
        {translation.acf.full_article_pdf && (
          <p className="text-[#474F7A] font-semibold pb-10">
            იხილეთ სტატიის{" "}
            <a
              href={translation.acf.full_article_pdf}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="underline"
            >
              პდფ ვერსია
            </a>
          </p>
        )}

        {/* Main Text Content */}
        <div
          className="article-content text-[#474F7A] font-noto-sans-georgian text-[14px] sm:text-[16px] font-normal lg:text-justify leading-[30px] sm:leading-[35px] tracking-[0.32px] mt-5"
          dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        />

        {/* Client-Only Share/Buttons */}
        <DynamicClientComponents id={id} title={translation.title.rendered} />
      </div>
    </section>
  );
}
