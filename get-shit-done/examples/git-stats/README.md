# git-stats

Git statistics for GSD projects. Provides quick insights into your repository's commit history and contributor activity.

## Installation

```bash
gsd plugin install ./git-stats
```

## Commands

| Command | Description |
|---------|-------------|
| `/git-stats:summary` | Show commit statistics for the current repository |
| `/git-stats:contributors` | List contributors with commit counts |

## Usage

### Summary Statistics

```
/git-stats:summary
```

Shows repository statistics including:
- Total commit count
- Commits in the last week
- Most active day of the week
- First commit date

**Example output:**
```
Repository Statistics
=====================
Total commits: 142
Commits this week: 12
Most active day: Friday (28 commits)
First commit: 2024-01-15
```

### Contributors

```
/git-stats:contributors
```

Lists all contributors sorted by commit count, showing each contributor's name, number of commits, and percentage of total.

**Example output:**
```
Contributors
============
| Name          | Commits | Percentage |
|---------------|---------|------------|
| Alice Smith   | 85      | 59.9%      |
| Bob Johnson   | 42      | 29.6%      |
| Carol White   | 15      | 10.5%      |
|---------------|---------|------------|
| Total         | 142     | 100%       |
```

## Requirements

- Git must be installed and available in PATH
- Must be run from within a git repository
