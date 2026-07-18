import Image from "next/image";
import { notFound, redirect } from "next/navigation";
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
async function fetchTranslation(slugOrId) {
  const decodedSlugOrId = decodeURIComponent(slugOrId);

  let apiUrl = `${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/wp/v2/targmani?slug=${encodeURIComponent(decodedSlugOrId)}&acf_format=standard`;

  try {
    let res = await fetch(apiUrl, { next: { revalidate: 10 } });
    if (res.ok) {
      const translations = await res.json();
      if (translations && translations.length > 0) {
        return translations[0];
      }
    }

    const isNumeric = !isNaN(decodedSlugOrId) && !isNaN(parseFloat(decodedSlugOrId));

    if (isNumeric) {
      apiUrl = `${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/wp/v2/targmani/${decodedSlugOrId}?acf_format=standard`;
      res = await fetch(apiUrl, { next: { revalidate: 10 } });
      if (!res.ok) return null;
      return res.json();
    }

    // Not a current slug, and not numeric — it may be a FORMER slug (e.g.
    // a translation whose URL was cleaned up to a Latin slug). Check
    // WordPress's own record of old slugs so shared links keep working.
    const resolveUrl = `${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/custom/v1/resolve-article-slug?post_type=targmani&slug=${encodeURIComponent(decodedSlugOrId)}`;
    const resolveRes = await fetch(resolveUrl, { next: { revalidate: 10 } });
    if (resolveRes.ok) {
      const resolved = await resolveRes.json();
      if (resolved.found) {
        return {
          id: resolved.id,
          slug: resolved.slug,
          title: resolved.title,
          date: resolved.date,
          acf: resolved.acf,
          _redirectFrom: decodedSlugOrId,
        };
      }
    }

    return null;
  } catch (error) {
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

  if (!translation) {
    return {
      title: "Translation Not Found",
      description: "This translation does not exist.",
    };
  }

  // Admins edit the "title" field in the meta box as the real editorial
  // title; the native WP title (top of the editor) is a separate field
  // that's easy to forget to keep in sync. Prefer the ACF field so the
  // site shows whatever the admin actually intended.
  const decodedTitle = decode(translation.acf?.title || translation.title.rendered || "");
  const rawDescription =
    translation.acf?.description || translation.acf?.sub_title || "";
  const decodedDescription = decode(rawDescription);

  const baseUrl = process.env.NEXT_PUBLIC_WORDPRESS_API_URL || "https://mautskebeli.wpenginepowered.com";
  let imageUrl = "https://www.mautskebeli.ge/images/default-og-image.jpg";
  if (translation.acf?.image) {
    const img = translation.acf.image;
    if (typeof img === "string") {
      imageUrl = img.startsWith("http") ? img : `${baseUrl}${img}`;
    } else if (typeof img === "object" && img?.url) {
      imageUrl = img.url.startsWith("http") ? img.url : `${baseUrl}${img.url}`;
    }
  }
  imageUrl = imageUrl.split("?")[0];

  const metadataBase = new URL("https://www.mautskebeli.ge");
  const canonicalPath = translation.slug ? `/translate/${translation.slug}` : `/translate/${id}`;

  return {
    metadataBase,
    title: decodedTitle,
    description: decodedDescription,
    openGraph: {
      title: decodedTitle,
      description: decodedDescription,
      url: canonicalPath,
      type: "article",
      images: [imageUrl],
      locale: "ka_GE",
      siteName: "Mautskebeli",
    },
    twitter: {
      card: "summary_large_image",
      title: decodedTitle,
      description: decodedDescription,
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
 * Sanitize the main-text HTML (aligned with articles/free-column for consistency and security)
 */
function getSanitizedContent(content) {
  const sanitized = sanitizeHtml(content, {
    allowedTags: [
      "b", "i", "em", "strong", "a", "p", "blockquote",
      "ul", "ol", "li", "br", "span", "h1", "h2", "h3", "h4", "h5", "h6",
      "img", "video", "source", "audio", "figure", "figcaption", "div",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt", "title", "class", "style"],
      video: ["src", "controls", "width", "height", "poster", "style"],
      audio: ["src", "controls"],
      source: ["src", "type"],
      span: ["style"],
      p: ["style", "class"],
      blockquote: ["cite", "style"],
      figure: ["class", "style"],
      figcaption: ["class"],
      div: ["class", "style"],
    },
    allowedSchemes: ["http", "https", "data"],
    allowedStyles: {
      "*": {
        width: [/^\d+(?:px|%)$/],
        height: [/^\d+(?:px|%)$/],
        "max-width": [/^\d+(?:px|%)$/],
        "max-height": [/^\d+(?:px|%)$/],
        float: [/^(left|right|none)$/],
        "object-fit": [/^(cover|contain|fill|none|scale-down)$/],
        "font-size": [/^\d+(?:px|em|rem|%)$/],
      },
    },
    allowVulnerableTags: false,
  });

  const $ = load(sanitized);
  $("a").each((_, elem) => {
    $(elem).attr("target", "_blank").attr("rel", "noopener noreferrer");
  });
  $("blockquote").each((_, elem) => {
    $(elem).css({
      "margin-left": "20px",
      "padding-left": "15px",
      "border-left": "5px solid #ccc",
      "font-style": "italic",
    });
  });
  $("img").each((_, elem) => {
    let src = $(elem).attr("src");
    if (src && !src.startsWith("http")) {
      src = `${process.env.NEXT_PUBLIC_WORDPRESS_API_URL || "https://mautskebeli.wpenginepowered.com"}${src}`;
    }
    src = src?.replace(/-\d+x\d+(?=\.\w{3,4}$)/, "");
    $(elem).attr("src", src);
    $(elem).removeAttr("width");
    $(elem).removeAttr("height");
  });
  return $.html();
}

/**
 * Single Translation Page (Server Component)
 */
export default async function TranslationPage({ params }) {
  const { id } = params;
  const translation = await fetchTranslation(id);

  if (!translation) notFound();

  if (translation._redirectFrom && translation.slug) {
    redirect(`/translate/${translation.slug}`);
  }

  const decodedTitle = decode(translation.acf?.title || translation.title?.rendered || "");
  const formattedDate = formatDate(translation.date);
  const sanitizedContent = getSanitizedContent(translation.acf["main-text"] || "");
  const imageUrl = translation.acf?.image
    ? (translation.acf.image.startsWith("http")
        ? translation.acf.image
        : `${process.env.NEXT_PUBLIC_WORDPRESS_API_URL || "https://mautskebeli.wpenginepowered.com"}${translation.acf.image}`)
    : "/images/default-og-image.jpg";

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
            alt={decodedTitle}
            width={800}
            height={450}
            className="rounded-lg w-full"
            style={{ objectFit: "cover" }}
          />
        </div>

        {/* Title, Subtitle */}
        <h1 className="font-alk-tall-mtavruli text-[32px] sm:text-[64px] font-light leading-none text-[#474F7A] mt-[24px] mb-5">
          {decodedTitle}
        </h1>
        <h3 className="font-alk-tall-mtavruli sm:text-[34px] lg:text-[34px] font-light leading-wide text-[#474F7A] mt-[24px] mb-5">
          {translation.acf?.sub_title}
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
        <DynamicClientComponents id={id} title={decodedTitle} />
      </div>
    </section>
  );
}
