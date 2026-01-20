/*
 * Eleventy config for the /site GitHub Pages website.
 *
 * Note: Passthrough copy paths are relative to the repo root.
 * Directory settings are specified on the CLI (see root package.json scripts)
 * to avoid absolute-path edge cases.
 */

const markdownIt = require('markdown-it');
const markdownItAnchor = require('markdown-it-anchor');

function slugify(value) {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-]/g, '')
    .replace(/-+/g, '-');
}

module.exports = function(eleventyConfig) {
  const md = markdownIt({
    html: true,
    linkify: true,
    typographer: true,
  }).use(markdownItAnchor, {
    level: [2, 3, 4],
    slugify,
    permalink: markdownItAnchor.permalink.ariaHidden({
      placement: 'after',
      class: 'heading-anchor',
      symbol: '#',
    }),
  });

  eleventyConfig.setLibrary('md', md);

  eleventyConfig.addPassthroughCopy({
    'site/src/assets': 'assets',
    'site/src/robots.txt': 'robots.txt',
  });

  eleventyConfig.addWatchTarget('site/src/assets/css');
  eleventyConfig.addWatchTarget('site/src/assets/js');

  return {
    markdownTemplateEngine: 'hbs',
    htmlTemplateEngine: 'hbs',
    dataTemplateEngine: 'hbs',
    pathPrefix: process.env.PATH_PREFIX || '/',
  };
};
