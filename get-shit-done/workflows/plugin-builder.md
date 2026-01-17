# Plugin Builder Workflow

<objective>
Guide users through creating a new GSD plugin with interactive questions and automatic file generation.

Purpose: Enable users to create complete, well-structured plugins by answering questions about what they need, then generating all appropriate files from templates.

Output: A complete plugin directory with plugin.json, README.md, and all selected component files.
</objective>

<process>

<step name="gather_metadata">
## Step 1: Plugin Metadata

Gather basic plugin information using AskUserQuestion.

**Plugin Name:**
- header: "Plugin Name"
- question: "What should your plugin be called?"
- options: ["Let me type it"]

Validate the name is kebab-case (lowercase letters, numbers, hyphens only, starts with letter, 3-50 chars).

If invalid, explain the format and ask again.

**Description:**
- header: "Description"
- question: "One-line description of what this plugin does?"
- options: ["Let me type it"]

**Author:**
- header: "Author"
- question: "Author name (or name + email)?"
- options: ["Let me type it"]

**License:**
- header: "License"
- question: "What license?"
- options: ["MIT", "Apache-2.0", "ISC", "GPL-3.0", "Other"]

Default to MIT if user doesn't specify.
</step>

<step name="select_components">
## Step 2: Component Selection

Determine what components the plugin needs.

**Commands:**
- header: "Commands"
- question: "Will your plugin have slash commands users can invoke?"
- options: ["Yes, add commands", "No commands needed"]

Most plugins have at least one command.

**Hooks:**
- header: "Hooks"
- question: "Does your plugin need to respond to GSD lifecycle events?"
- options: ["Yes, add hooks", "No hooks needed"]

Explain: Hooks run automatically when GSD does things like create plans or execute tasks.

**Workflows:**
- header: "Workflows"
- question: "Does your plugin need multi-step workflow procedures?"
- options: ["Yes, add workflows", "No workflows needed"]

Explain: Workflows are reusable procedures that commands can invoke.

**Agents:**
- header: "Agents"
- question: "Does your plugin need specialized subagents for task execution?"
- options: ["Yes, add agents", "No agents needed"]

Explain: Agents are spawned during plan execution for specialized tasks.

**Services:**
- header: "Services"
- question: "Does your plugin need Docker containers or services?"
- options: ["Yes, add Docker services", "No services needed"]

Explain: Services run alongside GSD (databases, servers, etc.).
</step>

<step name="gather_component_details">
## Step 3: Component Details

For each selected component type, gather specifics.

### Commands (if selected)

- header: "Command Count"
- question: "How many commands?"
- options: ["1 command", "2-3 commands", "4+ commands", "Let me specify"]

For each command:
- header: "Command [N]"
- question: "Command name and brief description?"
- options: ["Let me type it"]

Command names should be kebab-case (the plugin prefix is added automatically).

### Hooks (if selected)

- header: "Hook Events"
- question: "Which lifecycle events should trigger your hooks?"
- options: ["post-plan", "post-execute", "pre-commit", "post-commit", "on-error", "Multiple hooks"]

Available hooks:
- `post-plan`: After plan creation
- `post-execute`: After plan execution
- `pre-commit`: Before git commit
- `post-commit`: After git commit
- `on-error`: When execution fails

### Workflows (if selected)

- header: "Workflow Count"
- question: "How many workflows?"
- options: ["1 workflow", "2-3 workflows", "Let me specify"]

For each workflow:
- header: "Workflow [N]"
- question: "Workflow name?"
- options: ["Let me type it"]

### Agents (if selected)

- header: "Agent Count"
- question: "How many agents?"
- options: ["1 agent", "2-3 agents", "Let me specify"]

For each agent:
- header: "Agent [N]"
- question: "Agent name and role?"
- options: ["Let me type it"]

### Services (if selected)

- header: "Service Type"
- question: "What kind of service?"
- options: ["Database (PostgreSQL, Neo4j, etc.)", "Cache (Redis, etc.)", "Custom service", "Let me describe"]

Gather:
- Service name (e.g., neo4j, postgres, redis)
- Docker image to use
- Ports to expose
</step>

<step name="confirm_plan">
## Step 4: Confirm Generation Plan

Present a summary of what will be created:

```
Plugin: {plugin-name}
Description: {description}
Author: {author}
License: {license}

Files to generate:
- plugin.json (manifest)
- README.md (documentation)
{for each command}
- commands/{command-name}.md
{for each hook}
- hooks/{hook-trigger}.md
{for each workflow}
- workflows/{workflow-name}.md
{for each agent}
- agents/{agent-name}.md
{if services}
- docker/docker-compose.yml
```

- header: "Confirm"
- question: "Generate these files?"
- options: ["Generate plugin", "Make changes", "Cancel"]

If "Make changes": Return to appropriate step based on what they want to change.
If "Cancel": Exit workflow.
</step>

<step name="generate_files">
## Step 5: Generate Plugin Files

Create the plugin directory structure and all files.

**Directory:** Create at current working directory: `./{plugin-name}/`

**Generate plugin.json:**
Use gathered metadata and component lists to create the manifest.

```json
{
  "name": "{plugin-name}",
  "version": "1.0.0",
  "description": "{description}",
  "author": "{author}",
  "license": "{license}",
  "gsd": {
    "minVersion": "1.4.0",
    "commands": [...],
    "workflows": [...],
    "agents": [...],
    "hooks": {...},
    "services": {...} or null
  }
}
```

**Generate README.md:**
Use template @~/.claude/get-shit-done/templates/plugin/README.md with gathered information.

**Generate component files:**
For each component, use the appropriate template:
- Commands: @~/.claude/get-shit-done/templates/plugin/command.md
- Hooks: @~/.claude/get-shit-done/templates/plugin/hook.md
- Workflows: @~/.claude/get-shit-done/templates/plugin/workflow.md
- Agents: @~/.claude/get-shit-done/templates/plugin/agent.md
- Services: @~/.claude/get-shit-done/templates/plugin/docker-compose.yml

Replace [PLACEHOLDER] markers with gathered information.
</step>

<step name="complete">
## Step 6: Complete

Present the generated plugin structure:

```
Created plugin: {plugin-name}/

{plugin-name}/
├── plugin.json
├── README.md
{generated structure based on components}

## Next Steps

1. Review and customize the generated files
2. Implement command/workflow/hook logic
3. Test locally: `gsd plugin install ./{plugin-name}`
4. When ready, publish to a git repository

## Commands

Your plugin provides these commands:
{list commands with descriptions}
```

If services were included, add:
```
## Services

Your plugin includes Docker services. They will start automatically when the plugin is enabled.

Requires: Docker Desktop or Docker Engine
```
</step>

</process>

<templates>
Component templates are located at:
- @~/.claude/get-shit-done/templates/plugin/command.md
- @~/.claude/get-shit-done/templates/plugin/hook.md
- @~/.claude/get-shit-done/templates/plugin/workflow.md
- @~/.claude/get-shit-done/templates/plugin/agent.md
- @~/.claude/get-shit-done/templates/plugin/docker-compose.yml
- @~/.claude/get-shit-done/templates/plugin/plugin.json (manifest example)
- @~/.claude/get-shit-done/templates/plugin/README.md (documentation template)
</templates>

<validation>
Before generating, validate:
- Plugin name is kebab-case
- Command names are kebab-case (prefix added automatically)
- No duplicate component names
- At least one component selected (a plugin should do something)
</validation>

<success_criteria>
- All metadata gathered through AskUserQuestion
- Component selection complete
- Plugin directory created with all files
- Files use consistent naming (kebab-case)
- plugin.json is valid and complete
- README.md documents all commands/features
- User knows next steps for customization and testing
</success_criteria>
