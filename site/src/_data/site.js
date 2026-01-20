/*
 * Global site data.
 *
 * Keep URLs compatible with GitHub Pages' repo subpath by using `pathPrefix`.
 */

const path = require('path');

function normalizePathPrefix(prefix) {
  if (!prefix) {
    return '/';
  }

  let result = String(prefix).trim();
  if (!result.startsWith('/')) {
    result = `/${result}`;
  }
  if (!result.endsWith('/')) {
    result = `${result}/`;
  }
  return result;
}

function readRootPackage() {
  try {
    // site/src/_data -> site/src -> site -> repo root
    const rootPath = path.join(__dirname, '..', '..', '..', 'package.json');
    // eslint-disable-next-line global-require
    return require(rootPath);
  } catch (err) {
    return null;
  }
}

module.exports = () => {
  const pathPrefix = normalizePathPrefix(process.env.PATH_PREFIX || '/');
  const rootPackage = readRootPackage();

  const repoUrl = 'https://github.com/glittercowboy/get-shit-done';
  const npmUrl = 'https://www.npmjs.com/package/get-shit-done-cc';

  const nav = [
    { label: 'Getting Started', url: `${pathPrefix}getting-started/` },
    { label: 'How It Works', url: `${pathPrefix}how-it-works/` },
    { label: 'Commands', url: `${pathPrefix}commands/` },
    { label: 'Community', url: `${pathPrefix}community/` },
    { label: 'Support', url: `${pathPrefix}support/` },
  ];

  return {
    title: 'Get Shit Done (GSD)',
    shortTitle: 'GSD',
    description: 'A lightweight meta-prompting, context engineering, and spec-driven development system for Claude Code by TÂCHES.',
    pathPrefix,
    repoUrl,
    npmUrl,
    version: rootPackage?.version || '',
    author: rootPackage?.author || 'TÂCHES',
    nav,
  };
};
