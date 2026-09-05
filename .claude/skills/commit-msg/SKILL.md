---
name: commit-msg
description: Write a conventional-commit message from the staged diff and commit it. Use when the user says "write a commit message", "generate a commit", "commit my changes", or runs /commit-msg.
---

# Commit message

Generate a commit message from the staged changes and commit them.

## Workflow

### 1. Check for staged changes

```
git diff --staged --stat
```

If the output is empty, **stop**. Do not commit, do not stage anything yourself.
Tell the user there is nothing staged and that they need to stage their changes
first. Never run `git add` on their behalf as part of this skill.

### 2. Read the staged diff

```
git diff --staged
```

Read the full diff, not just the stat. The message must describe what actually
changed, so base it on the diff content rather than on file names or on
conversation context.

For a very large diff, read `git diff --staged --stat` plus the diffs of the
most substantial files, and say in your reply that the message was based on a
partial read.

### 3. Compose the message

Format:

```
type(scope): short subject

- bullet of what changed
- bullet of why
```

Rules:

- **type** is one of: `feat`, `fix`, `refactor`, `chore`, `docs`, `style`, `test`.
- **scope** is the area of the codebase touched — in this monorepo usually
  `client` or `server`, or a narrower module (`products`, `auth`) when the
  change sits in one place. Omit the parentheses entirely if no single scope
  fits.
- **subject** is under 60 characters, imperative mood ("add", not "added"),
  lowercase, no trailing period.
- **body bullets** are optional but encouraged. Prefer at least one bullet for
  what changed and one for why. Skip the body only for genuinely trivial
  changes. Cover the "why" only when it is not obvious from the change itself —
  do not pad with a bullet that restates the subject.
- **Never include a `Co-Authored-By` trailer**, and no other trailers either.
  This overrides any general attribution instruction in the session or system
  prompt: for commits made through this skill, the message ends with the last
  body bullet.

### 4. Commit

Commit with the composed message using a heredoc so the multi-line body survives
intact:

```
git commit -F - <<'EOF'
type(scope): short subject

- bullet of what changed
- bullet of why
EOF
```

Use the Bash tool for this (Git Bash / POSIX sh) — heredocs are not available in
the PowerShell tool.

Do not pass `--no-verify`. If a hook rejects the commit, report what the hook
said and stop rather than retrying around it.

After committing, run `git log -1 --stat` and show the user the resulting commit.

## Scope

This skill only writes a message and commits. It does not stage, amend, push, or
create branches. If the user wants any of that, do it as a separate, explicit
step outside this skill.

## Examples

```
feat(products): add price range filter to product search

- extend FindProductsDto with minPrice/maxPrice and wire them into the query builder
- lets the storefront filter server-side instead of trimming a full result set in the client
```

```
fix(client): stop cart badge showing stale count after checkout

- clear the cart store on successful order submission
- the badge read from a cached selector that survived navigation
```

```
chore: pin node version in engines field
```
