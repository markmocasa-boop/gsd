/**
 * GSD Multi-Language Support Utilities
 *
 * Provides language detection and pattern extraction for
 * Python, Rust, Go, Java, C++, and JavaScript/TypeScript.
 */

const fs = require('fs');
const path = require('path');

const CONFIG_PATH = path.join(__dirname, '..', 'config', 'languages.json');
let languageConfig = null;

function loadConfig() {
  if (languageConfig) return languageConfig;
  try {
    languageConfig = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
    return languageConfig;
  } catch (err) {
    return getDefaultConfig();
  }
}

function getDefaultConfig() {
  return {
    allExtensions: ['.js', '.ts', '.jsx', '.tsx', '.mjs', '.cjs', '.py', '.pyi', '.rs', '.cpp', '.cc', '.cxx', '.hpp', '.h', '.go', '.java']
  };
}

function detectLanguage(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const config = loadConfig();
  for (const [lang, langConfig] of Object.entries(config.languages || {})) {
    if (langConfig.extensions && langConfig.extensions.includes(ext)) {
      return lang;
    }
  }
  return null;
}

function isCodeFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const config = loadConfig();
  return config.allExtensions.includes(ext);
}

function getSupportedExtensions() {
  const config = loadConfig();
  return config.allExtensions || [];
}

function detectNamingCase(identifier) {
  if (!identifier || typeof identifier !== 'string' || identifier === 'default') return null;
  const patterns = [
    { name: 'SCREAMING_SNAKE', regex: /^[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)+$/ },
    { name: 'snake_case', regex: /^[a-z][a-z0-9]*(?:_[a-z0-9]+)+$/ },
    { name: 'PascalCase', regex: /^[A-Z][a-z0-9]+(?:[A-Z][a-z0-9]+)*$/ },
    { name: 'camelCase', regex: /^[a-z][a-z0-9]*(?:[A-Z][a-z0-9]+)+$/ }
  ];
  for (const { name, regex } of patterns) {
    if (regex.test(identifier)) return name;
  }
  if (/^[a-z][a-z0-9]*$/.test(identifier)) return 'camelCase';
  if (/^[A-Z][a-z0-9]+$/.test(identifier)) return 'PascalCase';
  return null;
}

function getTestFramework(language) {
  const config = loadConfig();
  return config.testFrameworks?.[language] || null;
}

module.exports = {
  detectLanguage,
  isCodeFile,
  getSupportedExtensions,
  detectNamingCase,
  getTestFramework,
  loadConfig
};
