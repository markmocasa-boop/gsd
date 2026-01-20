---
layout: layouts/page.hbs
title: Commands
description: "A practical reference for GSD slash commands."
permalink: /commands/
---

# Commands

A quick reference for the workflows most people run day-to-day.

## Core Workflow

| Command | What It Does |
|---|---|
| `/gsd:new-project` | Full initialization: questions → research → requirements → roadmap |
| `/gsd:discuss-phase [N]` | Capture implementation decisions before planning |
| `/gsd:plan-phase [N]` | Research + plan + verify for a phase |
| `/gsd:execute-phase <N>` | Execute all plans in parallel waves, verify when complete |
| `/gsd:verify-work [N]` | Manual user acceptance testing |
| `/gsd:complete-milestone` | Archive milestone, tag release |
| `/gsd:new-milestone [name]` | Start next version: questions → research → requirements → roadmap |

## Navigation

| Command | What It Does |
|---|---|
| `/gsd:progress` | Where am I? What’s next? |
| `/gsd:help` | Show all commands and usage guide |

## Brownfield

| Command | What It Does |
|---|---|
| `/gsd:map-codebase` | Analyze existing codebase before new-project |

## Phase Management

| Command | What It Does |
|---|---|
| `/gsd:add-phase` | Append phase to roadmap |
| `/gsd:insert-phase [N]` | Insert urgent work between phases |
| `/gsd:remove-phase [N]` | Remove future phase, renumber |

## Session

| Command | What It Does |
|---|---|
| `/gsd:pause-work` | Create handoff when stopping mid-phase |
| `/gsd:resume-work` | Restore from last session |

## Utilities

| Command | What It Does |
|---|---|
| `/gsd:add-todo [desc]` | Capture idea for later |
| `/gsd:check-todos` | List pending todos |
| `/gsd:debug [desc]` | Systematic debugging with persistent state |

<div class="callout">
  <strong>Tip:</strong> Keep <code>/gsd:progress</code> open in one Claude Code tab while you work. It’s the fastest way to stay oriented.
</div>

## Common Troubleshooting

### Commands Not Found

- Restart Claude Code after installing.
- Verify files exist in <code>~/.claude/commands/gsd/</code> (global) or <code>./.claude/commands/gsd/</code> (local).

### Updating

```bash
npx get-shit-done-cc@latest
```
