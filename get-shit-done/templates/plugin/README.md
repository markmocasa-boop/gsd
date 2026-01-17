# [PLUGIN_NAME]

[One-line description of what this plugin does]

## Installation

```bash
gsd plugin install [PLUGIN_SOURCE]
```

Where `[PLUGIN_SOURCE]` is one of:
- Git URL: `https://github.com/[user]/[repo]`
- Local path: `./path/to/plugin`

## Commands

| Command | Description |
|---------|-------------|
| `/[plugin-name]:command` | [What this command does] |

## Usage

### [Command 1]

```
/[plugin-name]:command [arguments]
```

[Describe what this command does and when to use it]

**Example:**
```
/[plugin-name]:command example-arg
```

## Configuration

[If your plugin requires configuration, describe it here. If not, remove this section.]

```json
{
  "[plugin-name]": {
    "setting": "value"
  }
}
```

## Plugin Structure

This plugin follows the GSD plugin format:

```
[plugin-name]/
├── plugin.json          # Manifest (required)
├── README.md            # This file (required)
├── commands/            # Commands (optional)
│   └── *.md            # Each file = one slash command
├── agents/              # Subagents (optional)
│   └── *.md            # Each file = one agent
├── workflows/           # Workflows (optional)
│   └── *.md            # Referenced by commands
├── templates/           # Templates (optional)
│   └── *.md            # File templates
├── references/          # Reference docs (optional)
│   └── *.md            # Implementation guides
├── docker/              # Services (optional)
│   ├── docker-compose.yml
│   └── Dockerfile
└── hooks/               # Lifecycle hooks (optional)
    └── *.md            # Hook handlers
```

### Directory Purposes

| Directory | Purpose | Installed To |
|-----------|---------|--------------|
| `commands/` | Slash commands users invoke | `~/.claude/commands/[plugin-name]/` |
| `agents/` | Subagent definitions for task execution | `~/.claude/agents/` |
| `workflows/` | Multi-step procedures called by commands | `~/.claude/[plugin-name]/workflows/` |
| `templates/` | Document templates for file generation | `~/.claude/[plugin-name]/templates/` |
| `references/` | Implementation guides and docs | `~/.claude/[plugin-name]/references/` |
| `hooks/` | GSD lifecycle event handlers | `~/.claude/[plugin-name]/hooks/` |
| `docker/` | Docker Compose and service configs | `~/.claude/[plugin-name]/docker/` |

### Naming Conventions

- **Plugin name:** kebab-case (e.g., `neo4j-knowledge-graph`)
- **Commands:** `[plugin-name]:command` namespace (e.g., `/neo4j:query`)
- **Agents:** `[plugin-name]-agent` format (e.g., `neo4j-kg-indexer`)
- **Files:** kebab-case.md for all markdown files

## Requirements

- GSD version: `>= [MIN_VERSION]`
- [List any other requirements]

## License

[LICENSE_TYPE]

## Author

[AUTHOR_NAME] - [AUTHOR_CONTACT]

---

*Built with the [GSD Plugin System](https://github.com/your-org/get-shit-done)*
