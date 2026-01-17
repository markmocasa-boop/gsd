---
name: git-stats:summary
description: Show commit statistics for the current repository
allowed-tools: [Bash]
---

<process>
Generate a summary of git commit statistics for the current repository.

Run these commands and format the output:
1. Total commits: `git rev-list --count HEAD`
2. Commits this week: `git rev-list --count --since="1 week ago" HEAD`
3. Most active day: `git log --format='%ad' --date=format:'%A' | sort | uniq -c | sort -rn | head -1`
4. First commit date: `git log --reverse --format='%ai' | head -1`

Present the results in a formatted summary.
</process>
