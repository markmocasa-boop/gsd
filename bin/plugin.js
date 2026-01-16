#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

// Colors
const cyan = '\x1b[36m';
const green = '\x1b[32m';
const yellow = '\x1b[33m';
const red = '\x1b[31m';
const dim = '\x1b[2m';
const reset = '\x1b[0m';

// Parse args
const args = process.argv.slice(2);
const command = args[0];
const source = args[1];

/**
 * Expand ~ to home directory
 */
function expandTilde(filePath) {
  if (filePath && filePath.startsWith('~/')) {
    return path.join(os.homedir(), filePath.slice(2));
  }
  return filePath;
}

/**
 * Get Claude config directory
 */
function getConfigDir() {
  const envDir = process.env.CLAUDE_CONFIG_DIR;
  if (envDir) {
    return expandTilde(envDir);
  }
  return path.join(os.homedir(), '.claude');
}

/**
 * Check if git is available
 */
function isGitAvailable() {
  try {
    execSync('git --version', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if source is a git URL
 */
function isGitUrl(source) {
  return source.startsWith('https://') ||
         source.startsWith('git@') ||
         source.startsWith('http://') ||
         source.endsWith('.git');
}

/**
 * Clone a git repository to temp directory
 */
function cloneRepo(gitUrl) {
  const tempDir = path.join(os.tmpdir(), `gsd-plugin-${Date.now()}`);

  try {
    console.log(`  Cloning ${dim}${gitUrl}${reset}...`);
    execSync(`git clone --depth 1 "${gitUrl}" "${tempDir}"`, { stdio: 'pipe' });
    return tempDir;
  } catch (err) {
    throw new Error(`Failed to clone ${gitUrl}`);
  }
}

/**
 * Clean up temp directory
 */
function cleanup(tempDir) {
  if (tempDir && tempDir.startsWith(os.tmpdir())) {
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  }
}

/**
 * Validate manifest according to plugin-format.md rules
 */
function validateManifest(manifest, pluginDir) {
  const errors = [];

  // Name validation: kebab-case, 3-50 chars, starts with letter
  const nameRegex = /^[a-z][a-z0-9-]{2,49}$/;
  if (!manifest.name) {
    errors.push('Missing required field: name');
  } else if (!nameRegex.test(manifest.name)) {
    errors.push(`Invalid plugin name "${manifest.name}" - must be kebab-case, 3-50 chars, start with letter`);
  }

  // Version validation: semver MAJOR.MINOR.PATCH
  const versionRegex = /^\d+\.\d+\.\d+$/;
  if (!manifest.version) {
    errors.push('Missing required field: version');
  } else if (!versionRegex.test(manifest.version)) {
    errors.push(`Invalid version "${manifest.version}" - must be semver (MAJOR.MINOR.PATCH)`);
  }

  // Required fields
  if (!manifest.description) {
    errors.push('Missing required field: description');
  }
  if (!manifest.author) {
    errors.push('Missing required field: author');
  }

  // Validate commands if present
  const gsd = manifest.gsd || {};
  if (gsd.commands && Array.isArray(gsd.commands)) {
    for (const cmd of gsd.commands) {
      // Command name must match pluginName:command format
      if (cmd.name) {
        const expectedPrefix = manifest.name + ':';
        if (!cmd.name.startsWith(expectedPrefix)) {
          errors.push(`Command "${cmd.name}" prefix doesn't match plugin name "${manifest.name}"`);
        }
      }

      // File must exist and not use absolute paths or traversal
      if (cmd.file) {
        if (path.isAbsolute(cmd.file)) {
          errors.push(`Command file path must be relative: ${cmd.file}`);
        } else if (cmd.file.includes('..')) {
          errors.push(`Command file path cannot use '..': ${cmd.file}`);
        } else {
          const filePath = path.join(pluginDir, cmd.file);
          if (!fs.existsSync(filePath)) {
            errors.push(`Command file not found: ${cmd.file}`);
          }
        }
      }
    }
  }

  return errors;
}

/**
 * Copy directory recursively with path replacement in .md files
 */
function copyWithPathReplacement(srcDir, destDir, pluginName) {
  fs.mkdirSync(destDir, { recursive: true });

  const entries = fs.readdirSync(srcDir, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);

    if (entry.isDirectory()) {
      copyWithPathReplacement(srcPath, destPath, pluginName);
    } else if (entry.name.endsWith('.md')) {
      // Replace relative path references with installed paths
      let content = fs.readFileSync(srcPath, 'utf8');
      // Replace @./workflows/ with @~/.claude/{plugin}/workflows/
      content = content.replace(/@\.\/workflows\//g, `@~/.claude/${pluginName}/workflows/`);
      content = content.replace(/@\.\/templates\//g, `@~/.claude/${pluginName}/templates/`);
      content = content.replace(/@\.\/references\//g, `@~/.claude/${pluginName}/references/`);
      content = content.replace(/@\.\/hooks\//g, `@~/.claude/${pluginName}/hooks/`);
      fs.writeFileSync(destPath, content);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

/**
 * Install plugin files to Claude config directory
 */
function installPluginFiles(pluginDir, manifest) {
  const configDir = getConfigDir();
  const pluginName = manifest.name;
  const installedFiles = [];

  // Installation mapping from plugin-format.md:
  // commands/*.md -> ~/.claude/commands/{plugin-name}/*.md
  // agents/*.md -> ~/.claude/agents/*.md (root level)
  // workflows/*.md -> ~/.claude/{plugin-name}/workflows/*.md
  // templates/*.md -> ~/.claude/{plugin-name}/templates/*.md
  // references/*.md -> ~/.claude/{plugin-name}/references/*.md
  // hooks/*.md -> ~/.claude/{plugin-name}/hooks/*.md
  // docker/* -> ~/.claude/{plugin-name}/docker/*

  const mappings = [
    { src: 'commands', dest: path.join(configDir, 'commands', pluginName) },
    { src: 'agents', dest: path.join(configDir, 'agents') },
    { src: 'workflows', dest: path.join(configDir, pluginName, 'workflows') },
    { src: 'templates', dest: path.join(configDir, pluginName, 'templates') },
    { src: 'references', dest: path.join(configDir, pluginName, 'references') },
    { src: 'hooks', dest: path.join(configDir, pluginName, 'hooks') },
    { src: 'docker', dest: path.join(configDir, pluginName, 'docker') },
  ];

  for (const mapping of mappings) {
    const srcPath = path.join(pluginDir, mapping.src);
    if (fs.existsSync(srcPath) && fs.statSync(srcPath).isDirectory()) {
      copyWithPathReplacement(srcPath, mapping.dest, pluginName);

      // Track installed files
      const files = fs.readdirSync(srcPath);
      for (const file of files) {
        installedFiles.push(path.join(mapping.dest, file));
      }
    }
  }

  // Copy plugin.json to ~/.claude/{plugin-name}/plugin.json for management
  const pluginMetaDir = path.join(configDir, pluginName);
  fs.mkdirSync(pluginMetaDir, { recursive: true });
  const manifestDest = path.join(pluginMetaDir, 'plugin.json');

  // Add installed files list to manifest for uninstall tracking
  const manifestWithTracking = {
    ...manifest,
    _installed: {
      date: new Date().toISOString(),
      files: installedFiles,
    },
  };
  fs.writeFileSync(manifestDest, JSON.stringify(manifestWithTracking, null, 2));

  return installedFiles;
}

/**
 * Get list of installed commands from manifest
 */
function getInstalledCommands(manifest) {
  const gsd = manifest.gsd || {};
  if (!gsd.commands || !Array.isArray(gsd.commands)) {
    return [];
  }
  return gsd.commands.map(cmd => cmd.name);
}

/**
 * Show help message
 */
function showHelp() {
  console.log(`
  ${cyan}GSD Plugin Manager${reset}

  ${yellow}Usage:${reset}
    plugin install <source>   Install a plugin from git URL or local path
    plugin list               List installed plugins (not yet implemented)
    plugin uninstall <name>   Remove a plugin (not yet implemented)

  ${yellow}Examples:${reset}
    ${dim}# Install from git repository${reset}
    plugin install https://github.com/user/my-plugin

    ${dim}# Install from local path${reset}
    plugin install ./my-plugin
    plugin install /path/to/my-plugin

  ${yellow}Options:${reset}
    --help, -h    Show this help message
`);
}

/**
 * Install a plugin from source (git URL or local path)
 */
function installPlugin(source) {
  if (!source) {
    console.error(`  ${red}Error:${reset} No source specified`);
    console.log(`  Usage: plugin install <git-url|local-path>`);
    process.exit(1);
  }

  let pluginDir;
  let tempDir = null;

  // Determine source type and get plugin directory
  if (isGitUrl(source)) {
    // Git URL - need to clone first
    if (!isGitAvailable()) {
      console.error(`  ${red}Error:${reset} git is required for plugin installation`);
      process.exit(1);
    }

    try {
      tempDir = cloneRepo(source);
      pluginDir = tempDir;
    } catch (err) {
      console.error(`  ${red}Error:${reset} ${err.message}`);
      process.exit(1);
    }
  } else {
    // Local path
    pluginDir = path.resolve(expandTilde(source));

    if (!fs.existsSync(pluginDir)) {
      console.error(`  ${red}Error:${reset} Path not found: ${source}`);
      process.exit(1);
    }

    if (!fs.statSync(pluginDir).isDirectory()) {
      console.error(`  ${red}Error:${reset} Not a directory: ${source}`);
      process.exit(1);
    }
  }

  try {
    // Check for plugin.json
    const manifestPath = path.join(pluginDir, 'plugin.json');
    if (!fs.existsSync(manifestPath)) {
      console.error(`  ${red}Error:${reset} Not a valid GSD plugin (missing plugin.json)`);
      cleanup(tempDir);
      process.exit(1);
    }

    // Parse manifest
    let manifest;
    try {
      const manifestContent = fs.readFileSync(manifestPath, 'utf8');
      manifest = JSON.parse(manifestContent);
    } catch (parseErr) {
      console.error(`  ${red}Error:${reset} Invalid plugin.json - ${parseErr.message}`);
      cleanup(tempDir);
      process.exit(1);
    }

    console.log(`\n  Installing plugin: ${cyan}${manifest.name}${reset} v${manifest.version}`);

    // Full validation
    const validationErrors = validateManifest(manifest, pluginDir);
    if (validationErrors.length > 0) {
      console.error(`  ${red}Validation errors:${reset}`);
      for (const err of validationErrors) {
        console.error(`    - ${err}`);
      }
      cleanup(tempDir);
      process.exit(1);
    }
    console.log(`  ${green}✓${reset} Validated plugin.json`);

    // Install files
    const installedFiles = installPluginFiles(pluginDir, manifest);

    // Get installed commands
    const commands = getInstalledCommands(manifest);
    if (commands.length > 0) {
      console.log(`  ${green}✓${reset} Installed commands: ${commands.join(', ')}`);
    }

    console.log(`  ${green}✓${reset} Installed ${installedFiles.length} files to ~/.claude/${manifest.name}/`);

    // Clean up temp directory
    cleanup(tempDir);

    console.log(`\n  ${green}Done!${reset} Run ${cyan}/gsd:help${reset} to see new commands.`);

  } catch (err) {
    cleanup(tempDir);
    console.error(`  ${red}Error:${reset} ${err.message}`);
    process.exit(1);
  }
}

// Main
if (args.includes('--help') || args.includes('-h') || !command) {
  showHelp();
  process.exit(command ? 0 : 1);
}

switch (command) {
  case 'install':
    installPlugin(source);
    break;
  case 'list':
    console.log(`  ${yellow}Not yet implemented${reset} - coming in Phase 3`);
    break;
  case 'uninstall':
    console.log(`  ${yellow}Not yet implemented${reset} - coming in Phase 3`);
    break;
  default:
    console.error(`  ${red}Error:${reset} Unknown command: ${command}`);
    showHelp();
    process.exit(1);
}
