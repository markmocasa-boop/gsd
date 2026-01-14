# Project Setup

This guide helps you initialize the Agent Intelligence Framework for your project.

---

## First Time Setup

When you first start working in a project with the `.agent/` folder, you need to configure it for YOUR project.

### What Needs Configuration

The framework has two types of files:

**Pre-built (ready to use):**
- `core/identities/` - Agent personas
- `core/workflows/` - Process definitions
- `core/quality-gates/` - Quality checks

**Need configuration (templates):**
- `02-PROJECT.md` - Your project's context
- `04-WORKFLOW.md` - Your selected workflow
- `05-CONSTRAINTS.md` - Your project's rules

---

## Setup Process

### Step 1: Project Context

Ask the user these questions to fill `02-PROJECT.md`:

```
1. What is this project? (brief description)

2. What is the tech stack?
   - Frontend: [e.g., Next.js, React, Vue, none]
   - Backend: [e.g., Node.js, Python, none]
   - Database: [e.g., PostgreSQL, Supabase, MongoDB]

3. What are the main entities/concepts?
   (e.g., users, products, orders)

4. Is there existing code? What's the structure?

5. Any specific conventions to follow?
```

### Step 2: Workflow Selection

Ask the user:

```
What type of work will you primarily do?

1. Quick fixes - Small changes, bug fixes
2. Feature building - Adding new capabilities
3. Full system - Frontend + backend + database work
4. Exploration - Creative, experimental projects
5. Enterprise - Production-critical, audit-required
```

Then configure `04-WORKFLOW.md` with their selection.

### Step 3: Constraints

Ask the user:

```
Are there any specific rules for this project?

1. Required patterns (e.g., "always use TypeScript")
2. Forbidden patterns (e.g., "no `any` types")
3. Style requirements (e.g., "use Tailwind only")
4. External rules (e.g., "follow company style guide")
```

Then configure `05-CONSTRAINTS.md` with their answers.

---

## Quick Setup (Minimal)

If the user wants to skip detailed setup:

```
Quick Setup Mode

I'll configure with sensible defaults:
- Workflow: feature-build
- Quality gates: standard
- No specific constraints

You can always refine later. Ready to work?
```

---

## Auto-Detection

If the project has existing files, try to detect:

| File | Infer |
|------|-------|
| `package.json` | Node.js project, check for framework |
| `requirements.txt` | Python project |
| `go.mod` | Go project |
| `next.config.js` | Next.js |
| `tailwind.config.js` | Uses Tailwind |
| `.env.example` | Environment variables needed |
| `supabase/` | Uses Supabase |
| `prisma/` | Uses Prisma ORM |

Use detected info to pre-fill suggestions.

---

## Template Files

Use templates in `setup/templates/` to generate:

### project-context.template.yaml
```yaml
project:
  name: "{{PROJECT_NAME}}"
  type: "{{PROJECT_TYPE}}"
  description: "{{DESCRIPTION}}"

stack:
  frontend: "{{FRONTEND}}"
  backend: "{{BACKEND}}"
  database: "{{DATABASE}}"
  styling: "{{STYLING}}"

entities:
  {{#each ENTITIES}}
  - name: "{{name}}"
    description: "{{description}}"
  {{/each}}
```

### constraints.template.yaml
```yaml
required:
  {{#each REQUIRED}}
  - "{{.}}"
  {{/each}}

forbidden:
  {{#each FORBIDDEN}}
  - "{{.}}"
  {{/each}}

style:
  formatting: "{{FORMATTING}}"
  naming: "{{NAMING}}"
```

---

## Validation

After setup, verify:

- [ ] `02-PROJECT.md` has project description
- [ ] `04-WORKFLOW.md` has selected workflow
- [ ] `05-CONSTRAINTS.md` has at least universal constraints
- [ ] `project/context.yaml` exists and is valid
- [ ] User confirmed setup is correct

---

## Example Conversation

```
Agent: I see this project has the Agent Intelligence Framework but isn't 
configured yet. Let me help you set it up.

What is this project? Give me a brief description.

User: It's an e-commerce platform for selling handmade crafts.

Agent: Got it. What tech stack are you using?

User: Next.js, Supabase for database, Stripe for payments.

Agent: What are the main things users can do?

User: Browse products, add to cart, checkout, track orders. 
Sellers can list products and manage inventory.

Agent: Any specific coding rules or patterns?

User: Use TypeScript everywhere, prefer server components,
no inline styles.

Agent: What workflow fits your work style?
1. Quick fixes
2. Feature building
3. Full system work
4. Exploration
5. Enterprise

User: 2 - mostly adding features

Agent: Perfect. I've configured the framework:
- Project: E-commerce for handmade crafts
- Stack: Next.js + Supabase + Stripe
- Workflow: feature-build (plan → design → build)
- Constraints: TypeScript required, server components preferred

Ready to work. What would you like to build?
```

---

## Re-Configuration

If the user wants to change setup later:

```
To reconfigure this project:
1. Edit the relevant file directly, or
2. Say "reconfigure project" for guided setup
```
