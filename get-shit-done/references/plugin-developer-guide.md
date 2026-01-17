# Plugin Developer Guide

Create plugins to extend GSD with custom commands, hooks, workflows, agents, and services. This guide takes you from zero to working plugin in under 2 minutes.

## Quick Start

**Create your first plugin:**

```bash
/gsd:plugin-build-new
```

Follow the prompts to name your plugin, describe it, and select components. The workflow generates all necessary files.

**Install and test:**

```bash
/gsd:plugin install ./your-plugin-name
```

Your commands are now available at `/your-plugin-name:command`.

**Need more control?** Continue reading for detailed concepts and best practices.

---

## Core Concepts

### What Plugins Can Do

| Component | Purpose | Example |
|-----------|---------|---------|
| **Commands** | User-facing slash commands | `/neo4j:query` to query a knowledge graph |
| **Hooks** | Respond to GSD lifecycle events | Capture data after research completes |
| **Workflows** | Multi-step reusable procedures | Complex analysis with multiple stages |
| **Agents** | Specialized subagents for execution | Dedicated indexer for large datasets |
| **Services** | Docker containers | Neo4j database, Redis cache |

### How Plugins Integrate

Plugins are self-contained folders with a `plugin.json` manifest. When installed:

1. Commands copy to `~/.claude/commands/{plugin-name}/` - enabling `/plugin-name:command` syntax
2. Other files copy to `~/.claude/{plugin-name}/` - keeping plugin assets organized
3. Services start automatically if Docker is available

### Plugin Lifecycle

```
install → enable (default) → use → disable → uninstall
                ↑______________|
```

- **Install:** Files copied, services started (if Docker available)
- **Enable/Disable:** Toggle availability without removing files
- **Uninstall:** Complete removal including Docker volumes

### Command Namespacing

All plugin commands use the format `/plugin-name:command-name`:

- Prevents collision with core GSD commands (`/gsd:*`)
- Multiple commands share the same plugin prefix
- Example: `/neo4j:query`, `/neo4j:status`, `/neo4j:ingest`

---

## Creating Plugins

### Using /gsd:plugin-build-new (Recommended)

The plugin builder guides you through creation interactively:

```bash
/gsd:plugin-build-new
```

You will be asked for:
1. Plugin name (kebab-case, 3-50 characters)
2. Description (one line)
3. Author information
4. License selection
5. Component choices (commands, hooks, workflows, agents, services)
6. Details for each selected component

The workflow generates all files with proper structure and placeholders.

### Manual Creation

For manual creation, follow the structure defined in `plugin-format.md`.

**Minimum required files:**

```
my-plugin/
├── plugin.json      # Manifest (required)
├── README.md        # Documentation (required)
└── commands/        # At least one component
    └── hello.md
```

**Minimal plugin.json:**

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "What this plugin does",
  "author": "Your Name",
  "gsd": {
    "minVersion": "1.4.0",
    "commands": [
      {
        "name": "my-plugin:hello",
        "file": "commands/hello.md",
        "description": "Say hello"
      }
    ]
  }
}
```

### File Structure Overview

| Directory | Purpose | Required |
|-----------|---------|----------|
| `commands/` | Slash commands users invoke | No |
| `hooks/` | GSD lifecycle event handlers | No |
| `workflows/` | Multi-step procedures | No |
| `agents/` | Subagent definitions | No |
| `docker/` | Docker Compose and configs | No |
| `templates/` | File generation templates | No |
| `references/` | Documentation and guides | No |

---

## Plugin Components

### Commands

User-facing slash commands with YAML frontmatter:

```markdown
---
name: my-plugin:analyze
description: Analyze code in the current project
allowed-tools: [Read, Grep, Bash]
---

<process>
[Command implementation instructions]
</process>
```

Commands appear at `/my-plugin:analyze` after installation.

### Hooks

Respond to GSD lifecycle events:

```markdown
---
trigger: post-execute
---

<process>
[What to do when triggered]
</process>
```

**Available triggers:** `post-plan`, `post-execute`, `pre-commit`, `post-commit`, `on-error`

### Workflows

Multi-step procedures that commands can invoke:

```markdown
# Workflow Name

<objective>
What this workflow accomplishes.
</objective>

<process>
<step name="step_one">
## Step 1: First Step
...
</step>
</process>
```

### Agents

Specialized subagents for plan execution:

```markdown
# Agent Name

<role>
What this agent specializes in.
</role>

<process>
How the agent executes tasks.
</process>
```

### Services

Docker containers defined in `docker/docker-compose.yml`:

```yaml
version: '3.8'
services:
  my-service:
    image: some-image:tag
    ports:
      - "8080:8080"
    volumes:
      - my_data:/data

volumes:
  my_data:
```

Services start on install/enable and stop on disable/uninstall.

**For full component specifications, see `plugin-format.md`.**

---

## Development Workflow

### Using --link for Live Development

During development, use the `--link` flag to avoid reinstalling after each change:

```bash
/gsd:plugin install ./my-plugin --link
```

Changes to plugin files reflect immediately - no reinstall needed.

### Testing Your Plugin

1. **Install locally:**
   ```bash
   /gsd:plugin install ./my-plugin
   ```

2. **Verify installation:**
   ```bash
   /gsd:plugin info my-plugin
   ```

3. **Test commands:**
   ```bash
   /my-plugin:your-command
   ```

4. **Check command list:**
   ```bash
   /gsd:plugin commands
   ```

### Debugging Common Issues

**Command not found:**
- Verify plugin is enabled: `/gsd:plugin list`
- Check command namespacing matches plugin name
- Ensure command file exists at the path specified in manifest

**Services not starting:**
- Verify Docker is running: `docker info`
- Check docker-compose.yml syntax
- Review container logs: `docker logs gsd-{service-name}`

**Hook not firing:**
- Confirm trigger name matches exactly (e.g., `post-execute`, not `postExecute`)
- Check plugin is enabled
- Verify hook file path in manifest

---

## Best Practices

### Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Plugin name | kebab-case | `neo4j-knowledge-graph` |
| Command name | `plugin:command` | `neo4j:query` |
| Agent name | `plugin-agent` | `neo4j-kg-indexer` |
| File names | kebab-case.md | `capture-research.md` |

### Error Handling

- Commands should handle missing dependencies gracefully
- Check for required tools before execution
- Provide clear error messages with resolution steps
- Services should include health checks

### Documentation Standards

Every plugin needs:
- `README.md` with installation, commands, and usage
- Clear descriptions in `plugin.json` for all commands
- Examples for non-obvious functionality

### When to Use Hooks vs Commands

| Use Hooks When | Use Commands When |
|----------------|-------------------|
| Action should happen automatically | User should decide when to run |
| Triggered by GSD lifecycle events | Triggered by explicit user request |
| No user input needed | Requires arguments or configuration |
| Passive data capture | Active feature invocation |

---

## Distribution

### Preparing for Sharing

1. **Complete README.md** with:
   - Clear installation instructions
   - Command reference table
   - Usage examples
   - Requirements (GSD version, Docker, etc.)

2. **Validate plugin.json:**
   - All paths resolve to existing files
   - Command names match plugin prefix
   - Version follows semver (MAJOR.MINOR.PATCH)

3. **Test fresh install:**
   ```bash
   /gsd:plugin uninstall my-plugin
   /gsd:plugin install ./my-plugin
   ```

### Git Repository Structure

```
my-gsd-plugin/
├── plugin.json
├── README.md
├── LICENSE
├── commands/
├── ...
└── .gitignore
```

**Recommended .gitignore:**
```
.DS_Store
*.log
node_modules/
```

### README Requirements

At minimum, include:
- One-line description
- Installation command
- Command reference table
- License

See the README template at `templates/plugin/README.md` for a complete example.

---

## Reference Links

- **Full specification:** `~/.claude/get-shit-done/references/plugin-format.md`
- **CLI reference:** `/gsd:plugin help`
- **Plugin builder:** `/gsd:plugin-build-new`
- **Templates:** `~/.claude/get-shit-done/templates/plugin/`
