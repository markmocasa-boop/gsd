# Plugin Manifest Field Reference

This document explains each field in `plugin.json`. Use alongside the template.

## Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Plugin identifier (kebab-case, e.g., "neo4j-knowledge-graph") |
| `version` | string | Semantic version (e.g., "1.0.0") |
| `description` | string | One-line plugin description |
| `author` | string | Author name (or object with name/email/url) |

## Optional Fields

| Field | Type | Description |
|-------|------|-------------|
| `repository` | string | Git URL for the plugin source |
| `license` | string | SPDX license identifier (e.g., "MIT", "Apache-2.0") |
| `keywords` | array | Discovery tags for plugin search |

## GSD Configuration (`gsd` object)

| Field | Type | Description |
|-------|------|-------------|
| `minVersion` | string | Minimum GSD version required (e.g., "1.4.0") |
| `commands` | array | Commands the plugin provides |
| `workflows` | array | Workflow files the plugin provides |
| `agents` | array | Agent definitions for subagent spawning |
| `hooks` | object | GSD lifecycle event handlers |
| `services` | object | Docker/service configuration |

### Commands Array

Each command object:
```json
{
  "name": "plugin:command-name",
  "file": "commands/command.md",
  "description": "Optional description for help text"
}
```

- `name`: Command name (format: `pluginname:command`)
- `file`: Path relative to plugin root
- `description`: Optional help text

### Workflows Array

Each workflow object:
```json
{
  "name": "workflow-name",
  "file": "workflows/workflow.md"
}
```

### Agents Array

Each agent object:
```json
{
  "name": "agent-name",
  "file": "agents/agent.md"
}
```

### Hooks Object

Maps GSD lifecycle events to handler files:
```json
{
  "post-plan": "hooks/after-planning.md",
  "post-execute": "hooks/after-execution.md",
  "pre-commit": "hooks/before-commit.md"
}
```

Available hooks (see hooks documentation for details):
- `post-plan`: After plan creation
- `post-execute`: After plan execution
- `pre-commit`: Before git commit
- `post-commit`: After git commit
- `on-error`: When execution fails

### Services Object

For plugins with Docker containers:
```json
{
  "docker-compose": "services/docker-compose.yml",
  "healthCheck": "services/health.sh"
}
```

Set to `null` for plugins without services.

---

*See `get-shit-done/references/plugin-format.md` for complete documentation*
