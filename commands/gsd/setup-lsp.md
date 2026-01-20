---
name: gsd:setup-lsp
description: Configure Language Server Protocol for code intelligence across languages
argument-hint: "[language]"
allowed-tools:
  - Bash
  - Glob
  - AskUserQuestion
---

<objective>
Set up LSP (Language Server Protocol) for code intelligence features.

LSP enables:
- `goToDefinition` - Jump to where something is defined
- `findReferences` - Find all usages of a symbol
- `hover` - Get type info and documentation
- `documentSymbol` - List all symbols in a file
- `incomingCalls`/`outgoingCalls` - Trace call hierarchies

LSP requires TWO components:
1. **Plugin** - Tells Claude Code how to connect to the language server
2. **Binary** - The actual language server executable (must be in PATH)

This command detects your codebase, checks what's installed, and helps install what's missing.
</objective>

<language_definitions>
| Language | Extensions | Plugin | Binary | Check Command |
|----------|------------|--------|--------|---------------|
| TypeScript/JS | .ts .tsx .js .jsx .mjs .cjs | typescript-lsp | typescript-language-server | `typescript-language-server --version` |
| Python | .py .pyi | pyright-lsp | pyright | `pyright --version` |
| Rust | .rs | rust-lsp | rust-analyzer | `rust-analyzer --version` |
| Go | .go | gopls-lsp | gopls | `gopls version` |
| C/C++ | .cpp .cc .cxx .hpp .h .c | clangd-lsp | clangd | `clangd --version` |
| Java | .java | jdtls-lsp | jdtls | `which jdtls` |
</language_definitions>

<install_commands>
**TypeScript/JavaScript:**
```bash
# Binary
npm install -g typescript-language-server typescript
```

**Python:**
```bash
# Binary (choose one)
npm install -g pyright
# OR
pip install pyright
```

**Rust:**
```bash
# Requires rustup (https://rustup.rs)
rustup component add rust-analyzer
```

**Go:**
```bash
# Requires Go installed (https://go.dev)
go install golang.org/x/tools/gopls@latest
```

**C/C++:**
```bash
# macOS
brew install llvm

# Ubuntu/Debian
sudo apt install clangd

# Windows
choco install llvm
```

**Java:**
```bash
# macOS
brew install jdtls

# Ubuntu/Debian (varies by distro)
# Download from: https://download.eclipse.org/jdtls/
```
</install_commands>

<process>

## Step 1: Detect Languages in Codebase

Scan current directory for code files:

```bash
find . -type f \( \
  -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" -o \
  -name "*.py" -o -name "*.rs" -o -name "*.go" -o \
  -name "*.cpp" -o -name "*.cc" -o -name "*.h" -o -name "*.hpp" -o \
  -name "*.java" \
\) -not -path "*/node_modules/*" -not -path "*/.git/*" \
  -not -path "*/dist/*" -not -path "*/build/*" \
  -not -path "*/target/*" -not -path "*/__pycache__/*" \
  -not -path "*/venv/*" -not -path "*/.venv/*" \
  2>/dev/null | head -100 | xargs -I {} dirname {} | sort -u
```

Group by language based on extensions found.

## Step 2: Ask About Additional Languages

Display detected languages and ask if user wants more:

```
Detected languages in codebase:
  ✓ TypeScript/JavaScript
  ✓ Python

Available languages:
  1) TypeScript/JavaScript - Web, Node.js, React
  2) Python - Data science, ML, scripting
  3) Rust - Systems programming, WebAssembly
  4) Go - Cloud services, CLI tools
  5) C/C++ - Systems, game dev, embedded
  6) Java - Enterprise, Android

Add more? (comma-separated numbers, or Enter to continue)
```

Use AskUserQuestion with multiSelect for language selection.

## Step 3: Check Plugin Status

For each selected language, check if plugin is installed:

```bash
# Check installed plugins
claude /plugin list 2>/dev/null | grep -i "lsp"
```

Note: If this fails, instruct user to run `/plugin list` in Claude Code to check.

## Step 4: Check Binary Status

For each selected language, verify binary is in PATH:

```bash
# TypeScript
typescript-language-server --version 2>/dev/null && echo "✓ installed" || echo "✗ not found"

# Python
pyright --version 2>/dev/null && echo "✓ installed" || echo "✗ not found"

# Rust
rust-analyzer --version 2>/dev/null && echo "✓ installed" || echo "✗ not found"

# Go
gopls version 2>/dev/null && echo "✓ installed" || echo "✗ not found"

# C/C++
clangd --version 2>/dev/null && echo "✓ installed" || echo "✗ not found"

# Java
which jdtls 2>/dev/null && echo "✓ installed" || echo "✗ not found"
```

## Step 5: Display Status Summary

Show comprehensive status:

```
╭─────────────────────────────────────────────────────────────╮
│  GSD LSP Setup                                              │
├─────────────────────────────────────────────────────────────┤
│  Language           Plugin              Binary              │
│  ─────────────────────────────────────────────────────────  │
│  TypeScript/JS      ✓ typescript-lsp    ✓ installed         │
│  Python             ✓ pyright-lsp       ✗ not found         │
│  Rust               ✗ not installed     ✗ not found         │
│  Go                 ✗ not installed     ✗ not found         │
╰─────────────────────────────────────────────────────────────╯
```

## Step 6: Provide Installation Instructions

For missing plugins:
```
Missing plugins - run in Claude Code:
  /plugin install pyright-lsp
  /plugin install rust-lsp
```

For missing binaries:
```
Missing binaries - run in terminal:
  npm install -g pyright
  rustup component add rust-analyzer
```

## Step 7: Offer Automatic Binary Installation

Ask user if they want to install binaries now:

```
Install missing binaries now? [y/N]
```

If yes, run the install commands for each missing binary.

## Step 8: Verify Installation

After installation, re-run checks to confirm:

```bash
# Re-verify each binary
typescript-language-server --version
pyright --version
# etc.
```

## Step 9: Display Next Steps

```
╭─────────────────────────────────────────────────────────────╮
│  LSP Setup Complete!                                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  LSP features now available:                                │
│  • goToDefinition  - Jump to definitions                    │
│  • findReferences  - Find all usages                        │
│  • hover           - Type info and docs                     │
│  • documentSymbol  - List file symbols                      │
│  • incomingCalls   - Who calls this function                │
│  • outgoingCalls   - What does this function call           │
│                                                             │
│  GSD agents use LSP automatically with grep/glob fallback.  │
│                                                             │
╰─────────────────────────────────────────────────────────────╯
```

</process>

<success_criteria>
- [ ] Languages detected from codebase
- [ ] User asked about additional languages (greenfield support)
- [ ] Plugin status checked for each language
- [ ] Binary status checked for each language
- [ ] Clear status summary displayed
- [ ] Missing plugins listed with install commands
- [ ] Missing binaries listed with install commands
- [ ] Automatic installation offered
- [ ] Final verification performed
- [ ] Next steps displayed
</success_criteria>
