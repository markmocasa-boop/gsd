---
name: git-stats:contributors
description: List contributors with commit counts
allowed-tools: [Bash]
---

<process>
List all contributors to the repository sorted by commit count.

Run: `git shortlog -sn --all`

Format the output as a table showing:
- Contributor name
- Number of commits
- Percentage of total

Include a total at the bottom.
</process>
