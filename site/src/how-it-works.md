---
layout: layouts/page.hbs
title: How It Works
description: "Understand the GSD workflow: phases, subplans, task execution, and verification."
permalink: /how-it-works/
---

# How It Works

GSD wraps Claude Code in a workflow designed to keep output consistent as projects grow.

## The Core Idea

GSD is a context engineering and orchestration layer on top of Claude Code. You describe what you want, and GSD provides a repeatable structure so Claude can execute **spec-driven development** with less drift.

At a high level:

1. GSD turns a vague prompt into a **roadmap** (phases + deliverables).
2. Each phase is broken into **subplans**.
3. Each subplan contains **2–3 atomic tasks**.
4. Each task runs in a **fresh subagent context**, then writes a summary and creates a commit.

## The Three Documents You Rely On

### Project Document

The project doc is your single source of truth: what you are building, why, and the validated requirements. When you spin up a new session (or Claude is confused), this doc re-centers the work.

### Roadmap Document

The roadmap is the tactical plan: explicit phases and their expected outcomes. It is meant to be executed, not admired.

### State Document

The state doc records progress: what has been done, what is next, and (often) basic performance metrics. This is how GSD stays coherent across sessions.

## Why Subagents Matter

Long-running Claude sessions suffer from **context rot**: earlier tokens are more effective than later tokens as the context window fills. GSD counters that by running each atomic task in a clean subagent context.

Practical impact:

- Less drift over time
- More consistent adherence to requirements
- Better follow-through on verification criteria

## What Execution Looks Like

A typical flow for a phase:

1. **Discuss** implementation choices (`/gsd:discuss-phase [N]`).
2. **Plan** the phase (`/gsd:plan-phase [N]`) — research, plan, define checks.
3. **Execute** (`/gsd:execute-phase <N>`) — run tasks in parallel waves.
4. **Verify** (`/gsd:verify-work [N]`) — human acceptance testing when required.

## Verification Is Not Optional

Every plan includes measurable success criteria. If a step requires manual validation (for example, confirming a payment flow or running UI smoke tests), GSD will pause and ask you to confirm.

## Brownfield Support

Working in an existing codebase? Start with `/gsd:map-codebase` to generate an analysis before you begin planning.

## Where To Go Next

- Use <a href="{{site.pathPrefix}}commands/">Commands</a> as a quick reference
- Read <a href="{{site.pathPrefix}}community/">Community</a> to see how others explain the system
