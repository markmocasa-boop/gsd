---
layout: layouts/page.hbs
title: Getting Started
description: "Install GSD and run your first workflow in Claude Code."
permalink: /getting-started/
---

# Getting Started

GSD installs a set of Claude Code slash commands and a workflow that turns vague ideas into executable plans.

## Install GSD

Run:

```bash
npx get-shit-done-cc
```

This installs the GSD slash commands and workflows into your Claude Code config directory.

## First Run Checklist

1. **Restart Claude Code** so it reloads the new slash commands.
2. In a project repo, open Claude Code and run:

   ```
   /gsd:help
   ```

3. Start a new build:

   ```
   /gsd:new-project
   ```

## Staying Updated

GSD evolves fast. Check what's new:

```
/gsd:whats-new
```

Update with:

```bash
npx get-shit-done-cc@latest
```

## Recommended: Skip Permissions Mode

GSD is designed for frictionless automation. If you want a smooth experience, run Claude Code with:

```bash
claude --dangerously-skip-permissions
```

If you prefer granular permissions, the repo README includes an allowlist you can copy into `.claude/settings.json`.
