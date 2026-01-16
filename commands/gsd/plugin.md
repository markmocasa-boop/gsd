---
name: gsd:plugin
description: Manage GSD plugins (install, uninstall, list)
argument-hint: "<action> [source|name]"
allowed-tools: [Bash, Read]
---

<overview>
Plugin management for GSD. Install, uninstall, and manage plugins.

**Commands:**
- `/gsd:plugin install <git-url>` - Install from git repository
- `/gsd:plugin install <local-path>` - Install from local folder
- `/gsd:plugin install <path> --link` - Link for development (changes reflect immediately)
- `/gsd:plugin uninstall <name>` - Remove an installed plugin
- `/gsd:plugin uninstall <name> --dry-run` - Preview what would be removed
- `/gsd:plugin list` - List installed plugins (Phase 3)
</overview>

<process>
Parse the user's command and execute the appropriate action.

**For install:**
1. Determine if source is git URL (contains github.com, gitlab.com, or starts with git@)
2. Determine if --link flag present (local development mode)
3. Run: `node ~/.claude/get-shit-done/bin/plugin.js install <source> [--link] [--force]`
4. Report results

**For uninstall:**
1. Extract plugin name
2. Determine if --dry-run flag present
3. Run: `node ~/.claude/get-shit-done/bin/plugin.js uninstall <name> [--dry-run]`
4. Report results

**For list:**
Tell user this command is coming in Phase 3.

**Error handling:**
If the plugin.js command fails, show the error output to the user.

**If no action specified:**
Show usage help:
```
GSD Plugin Manager

Usage:
  /gsd:plugin install <git-url>         Install from git repository
  /gsd:plugin install <path>            Install from local folder
  /gsd:plugin install <path> --link     Link for development
  /gsd:plugin uninstall <name>          Remove a plugin
  /gsd:plugin uninstall <name> --dry-run Preview removal
  /gsd:plugin list                      List installed plugins

Examples:
  /gsd:plugin install https://github.com/user/my-plugin
  /gsd:plugin install ./my-local-plugin
  /gsd:plugin install ./my-plugin --link
  /gsd:plugin uninstall my-plugin
  /gsd:plugin uninstall my-plugin --dry-run
```
</process>

<examples>
Install from GitHub:
`/gsd:plugin install https://github.com/user/my-gsd-plugin`

Install local for development:
`/gsd:plugin install ./my-plugin --link`

Uninstall:
`/gsd:plugin uninstall my-plugin`

Preview uninstall:
`/gsd:plugin uninstall my-plugin --dry-run`
</examples>
