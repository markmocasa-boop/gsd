# Agent Intelligence Framework

> Transform any AI coding assistant into a structured, quality-focused development agent.

---

## What Is This?

This folder (`.agent/`) is a portable framework that gives AI coding assistants:

- **Context** about your project
- **Specialized identities** for different tasks (planner, architect, builder, tester)
- **Proven workflows** that ensure complete output
- **Quality gates** that catch incomplete or insecure code

## How It Works

When an AI assistant starts working in your project:

1. It reads the **bootstrap chain** (files 00-05)
2. It understands your **project context**
3. It selects an **identity** based on the task
4. It follows a **workflow** appropriate for the complexity
5. Its output passes **quality gates** before delivery

## Getting Started

### First Time

If you just added this folder to your project, tell the AI:

> "Initialize the agent framework for this project"

It will ask you questions about:
- Your tech stack
- Your project's domain
- Any specific rules or constraints
- Your preferred workflow

### After Setup

Just work normally. The AI will:
- Reference the context when making decisions
- Follow the selected workflow
- Use the appropriate identity for each task
- Apply quality gates to its output

## Folder Structure

```
.agent/
├── 00-05*.md           # Bootstrap chain (AI reads these first)
├── core/               # Pre-built, reusable components
│   ├── identities/     # Agent personas (planner, builder, etc.)
│   ├── workflows/      # Process definitions
│   ├── quality-gates/  # Quality checks
│   └── knowledge/      # Domain knowledge
├── project/            # YOUR project's specific config
│   ├── context.yaml    # Project description
│   └── constraints.yaml # Rules and requirements
├── state/              # Session tracking
│   └── session-log.md  # What's been done
└── setup/              # Initial configuration tools
```

## Workflows

| Workflow | For | Phases |
|----------|-----|--------|
| **quick-fix** | Bug fixes, small changes | 1 (just build) |
| **feature-build** | New features | 3 (plan → design → build) |
| **full-stack** | FE + BE + DB | 5 (with testing and review) |
| **explore** | Experiments, learning | Flexible |
| **enterprise** | Production-critical | 7 (with staged rollout) |

## Identities

| Identity | Expertise |
|----------|-----------|
| **PLANNER** | Breaking down tasks, identifying dependencies |
| **ARCHITECT** | System design, APIs, data models |
| **BUILDER** | Writing clean, complete code |
| **TESTER** | Finding bugs, edge cases |
| **REVIEWER** | Code review, security audit |

## Customization

### Add Project-Specific Knowledge

Create files in `project/` with domain-specific information:
- API documentation
- Business rules
- Data dictionaries

### Add Constraints

Edit `05-CONSTRAINTS.md` to add:
- Required patterns
- Forbidden patterns
- Style requirements

### Change Workflow

Edit `04-WORKFLOW.md` to select a different workflow.

## FAQ

**Q: Does this work with Claude Code?**
A: Yes, that's the primary target.

**Q: Does it work with other AI assistants?**
A: It's designed to work with any LLM that can read files - Claude, GPT, Gemini, etc.

**Q: Can I remove parts I don't need?**
A: Yes, but keep at least 00-BOOTSTRAP.md and 01-FRAMEWORK.md for the system to work.

**Q: How do I update the framework?**
A: Replace the `core/` folder. Your `project/` folder is untouched.

---

## Support

This framework is designed to be self-documenting. If the AI is confused:

1. Make sure the bootstrap chain is complete
2. Check that project config is filled in
3. Try saying "read the framework setup again"
