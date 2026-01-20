/*
 * Prepare the website build.
 *
 * This script is intentionally small: it keeps the site assets in sync and
 * fails fast if the environment is obviously misconfigured.
 */

const fs = require('fs');
const path = require('path');

function copyIfDifferent(src, dest) {
  if (!fs.existsSync(src)) {
    return;
  }

  const destDir = path.dirname(dest);
  fs.mkdirSync(destDir, { recursive: true });

  const srcBuf = fs.readFileSync(src);
  const destBuf = fs.existsSync(dest) ? fs.readFileSync(dest) : null;
  if (destBuf && Buffer.compare(srcBuf, destBuf) === 0) {
    return;
  }

  fs.writeFileSync(dest, srcBuf);
}

function main() {
  const repoRoot = path.join(__dirname, '..', '..');
  const rootTerminalSvg = path.join(repoRoot, 'assets', 'terminal.svg');
  const siteTerminalSvg = path.join(repoRoot, 'site', 'src', 'assets', 'img', 'terminal.svg');

  copyIfDifferent(rootTerminalSvg, siteTerminalSvg);

  const nodeMajor = Number(process.versions.node.split('.')[0]);
  if (Number.isNaN(nodeMajor) || nodeMajor < 16) {
    console.error('GSD site build requires Node.js 16+');
    process.exit(1);
  }
}

main();
