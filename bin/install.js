#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');
const readline = require('readline');

// Colors
const cyan = '\x1b[36m';
const green = '\x1b[32m';
const yellow = '\x1b[33m';
const dim = '\x1b[2m';
const reset = '\x1b[0m';

// Get version from package.json
const pkg = require('../package.json');

const banner = `
${cyan}   ██████╗ ███████╗██████╗
  ██╔════╝ ██╔════╝██╔══██╗
  ██║  ███╗███████╗██║  ██║
  ██║   ██║╚════██║██║  ██║
  ╚██████╔╝███████║██████╔╝
   ╚═════╝ ╚══════╝╚═════╝${reset}

  Get Shit Done ${dim}v${pkg.version}${reset}
  A meta-prompting, context engineering and spec-driven
  development system for Claude Code by TÂCHES.
`;

// Parse args
const args = process.argv.slice(2);
const hasGlobal = args.includes('--global') || args.includes('-g');
const hasLocal = args.includes('--local') || args.includes('-l');

console.log(banner);

/**
 * Recursively copy directory, replacing paths in .md files
 */
function copyWithPathReplacement(srcDir, destDir, pathPrefix) {
  fs.mkdirSync(destDir, { recursive: true });

  const entries = fs.readdirSync(srcDir, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);

    if (entry.isDirectory()) {
      copyWithPathReplacement(srcPath, destPath, pathPrefix);
    } else if (entry.name.endsWith('.md')) {
      // Replace ~/.claude/ with the appropriate prefix in markdown files
      let content = fs.readFileSync(srcPath, 'utf8');
      content = content.replace(/~\/\.claude\//g, pathPrefix);
      fs.writeFileSync(destPath, content);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

/**
 * Merge GSD hooks into existing settings.json
 * Adds SessionStart and SessionEnd hooks without removing existing hooks
 */
function installHooks(claudeDir, pathPrefix) {
  const settingsPath = path.join(claudeDir, 'settings.json');
  const hooksPrefix = pathPrefix + 'hooks/';

  // GSD hooks to install
  const gsdHooks = {
    SessionStart: [{
      hooks: [{
        command: hooksPrefix + 'gsd-session-start.sh',
        type: 'command'
      }]
    }],
    SessionEnd: [{
      hooks: [{
        command: hooksPrefix + 'gsd-session-end.sh',
        type: 'command'
      }]
    }]
  };

  // Load existing settings or create new
  let settings = {};
  if (fs.existsSync(settingsPath)) {
    try {
      settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    } catch (e) {
      console.log(`  ${yellow}⚠${reset} Could not parse settings.json, creating backup`);
      fs.copyFileSync(settingsPath, settingsPath + '.backup');
      settings = {};
    }
  }

  // Ensure hooks object exists
  if (!settings.hooks) {
    settings.hooks = {};
  }

  // Remove old gsd-auto-spawn.sh if present (broken hook)
  for (const hookType of Object.keys(settings.hooks)) {
    if (Array.isArray(settings.hooks[hookType])) {
      settings.hooks[hookType] = settings.hooks[hookType].filter(entry => {
        if (entry.hooks && Array.isArray(entry.hooks)) {
          entry.hooks = entry.hooks.filter(h =>
            !h.command || !h.command.includes('gsd-auto-spawn.sh')
          );
          return entry.hooks.length > 0;
        }
        return true;
      });
    }
  }

  // Add GSD hooks (append, don't replace)
  for (const [hookType, hookEntries] of Object.entries(gsdHooks)) {
    if (!settings.hooks[hookType]) {
      settings.hooks[hookType] = [];
    }

    // Check if GSD hooks already exist
    const hasGsdHook = settings.hooks[hookType].some(entry =>
      entry.hooks && entry.hooks.some(h =>
        h.command && (h.command.includes('gsd-session-start.sh') || h.command.includes('gsd-session-end.sh'))
      )
    );

    if (!hasGsdHook) {
      settings.hooks[hookType].push(...hookEntries);
    }
  }

  // Write updated settings
  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
  return true;
}

/**
 * Install to the specified directory
 */
function install(isGlobal) {
  const src = path.join(__dirname, '..');
  const claudeDir = isGlobal
    ? path.join(os.homedir(), '.claude')
    : path.join(process.cwd(), '.claude');

  const locationLabel = isGlobal
    ? claudeDir.replace(os.homedir(), '~')
    : claudeDir.replace(process.cwd(), '.');

  // Path prefix for file references
  const pathPrefix = isGlobal ? '~/.claude/' : './.claude/';

  console.log(`  Installing to ${cyan}${locationLabel}${reset}\n`);

  // Create commands directory
  const commandsDir = path.join(claudeDir, 'commands');
  fs.mkdirSync(commandsDir, { recursive: true });

  // Copy commands/gsd with path replacement
  const gsdSrc = path.join(src, 'commands', 'gsd');
  const gsdDest = path.join(commandsDir, 'gsd');
  copyWithPathReplacement(gsdSrc, gsdDest, pathPrefix);
  console.log(`  ${green}✓${reset} Installed commands/gsd`);

  // Copy get-shit-done skill with path replacement
  const skillSrc = path.join(src, 'get-shit-done');
  const skillDest = path.join(claudeDir, 'get-shit-done');
  copyWithPathReplacement(skillSrc, skillDest, pathPrefix);
  console.log(`  ${green}✓${reset} Installed get-shit-done`);

  // Copy hooks
  const hooksSrc = path.join(src, 'hooks');
  const hooksDest = path.join(claudeDir, 'hooks');
  if (fs.existsSync(hooksSrc)) {
    fs.mkdirSync(hooksDest, { recursive: true });
    const hookFiles = fs.readdirSync(hooksSrc);
    for (const file of hookFiles) {
      const srcFile = path.join(hooksSrc, file);
      const destFile = path.join(hooksDest, file);
      fs.copyFileSync(srcFile, destFile);
      // Make executable
      fs.chmodSync(destFile, 0o755);
    }
    console.log(`  ${green}✓${reset} Installed hooks`);

    // Install hook configuration into settings.json
    if (installHooks(claudeDir, pathPrefix)) {
      console.log(`  ${green}✓${reset} Configured hooks in settings.json`);
    }
  }

  console.log(`
  ${green}Done!${reset} Run ${cyan}/gsd:help${reset} to get started.
`);
}

/**
 * Prompt for install location
 */
function promptLocation() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log(`  ${yellow}Where would you like to install?${reset}

  ${cyan}1${reset}) Global ${dim}(~/.claude)${reset} - available in all projects
  ${cyan}2${reset}) Local  ${dim}(./.claude)${reset} - this project only
`);

  rl.question(`  Choice ${dim}[1]${reset}: `, (answer) => {
    rl.close();
    const choice = answer.trim() || '1';
    const isGlobal = choice !== '2';
    install(isGlobal);
  });
}

// Main
if (hasGlobal && hasLocal) {
  console.error(`  ${yellow}Cannot specify both --global and --local${reset}`);
  process.exit(1);
} else if (hasGlobal) {
  install(true);
} else if (hasLocal) {
  install(false);
} else {
  promptLocation();
}
