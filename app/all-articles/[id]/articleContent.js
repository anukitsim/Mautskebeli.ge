// app/all-articles/[id]/articleContent.js
//
// Cleans the article HTML that comes from WordPress, for the Georgian
// page and every translated page:
//   1. sanitize (only safe tags / styles)
//   2. style blockquotes, open links in a new tab
//   3. full-size images, each wrapped in a link to the full image

import sanitizeHtml from 'sanitize-html';
import { load } from 'cheerio';

function getSanitizedContent(content) {
  const sanitized = sanitizeHtml(content || '', {
    allowedTags: [
      'b', 'i', 'em', 'strong', 'a', 'p', 'blockquote',
      'ul', 'ol', 'li', 'br', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'img', 'video', 'source', 'audio', 'figure', 'figcaption', 'div',
      'code', 'pre',
    ],
    allowedAttributes: {
      a: ['href', 'target', 'rel'],
      img: ['src', 'alt', 'title', 'class', 'style'],
      video: ['src', 'controls', 'width', 'height', 'poster', 'style'],
      audio: ['src', 'controls'],
      source: ['src', 'type'],
      span: ['style'],
      p: ['style', 'class'],
      blockquote: ['cite', 'style'],
      figure: ['class', 'style'],
      figcaption: ['class'],
      div: ['class', 'style'],
    },
    allowedSchemes: ['http', 'https', 'data', 'mailto'],
    allowedStyles: {
      '*': {
        width: [/^\d+(?:px|%)$/],
        height: [/^\d+(?:px|%)$/],
        'max-width': [/^\d+(?:px|%)$/],
        'max-height': [/^\d+(?:px|%)$/],
        float: [/^(left|right|none)$/],
        'object-fit': [/^(cover|contain|fill|none|scale-down)$/],
        'font-size': [/^\d+(?:px|em|rem|%)$/],
        color: [/^#[0-9a-fA-F]{3,6}$/],
        'background-color': [/^#[0-9a-fA-F]{3,6}$/],
        'font-weight': [/^bold$/],
        'text-align': [/^(left|right|center|justify)$/],
      },
    },
    allowVulnerableTags: false,
  });

  const $ = load(sanitized);

  $('blockquote').each((_, elem) => {
    $(elem).css('margin-left', '20px');
    $(elem).css('padding-left', '15px');
    $(elem).css('border-left', '5px solid #ccc');
    $(elem).css('font-style', 'italic');
  });

  $('a').each((_, elem) => {
    $(elem).attr('target', '_blank');
    $(elem).attr('rel', 'noopener noreferrer');
  });

  return $.html();
}

export function prepareArticleHtml(content) {
  const $ = load(getSanitizedContent(content));

  $('img').each((i, elem) => {
    let src = $(elem).attr('src');

    if (src && !src.startsWith('http')) {
      src = `${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}${src}`;
    }

    const highResSrc = src?.replace(/-\d+x\d+(?=\.\w{3,4}$)/, '');
    $(elem).attr('src', highResSrc || src);
    $(elem).removeAttr('width');
    $(elem).removeAttr('height');

    const imgHtml = $.html(elem);
    const wrapped = `<a href="${highResSrc}" target="_blank" rel="noopener noreferrer">${imgHtml}</a>`;
    $(elem).replaceWith(wrapped);
  });

  return $.html();
}
