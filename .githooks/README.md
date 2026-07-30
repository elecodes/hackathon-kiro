# Git Hooks

## Setup

To enable the secret scanner pre-commit hook:

```bash
git config core.hooksPath .githooks
```

This only needs to be done once per clone.

## What it does

The `pre-commit` hook scans staged files for common secret patterns including AWS keys, OpenAI keys, GitHub tokens, Stripe keys, private keys, hardcoded passwords, and `.env` files with real values.

If any are detected, the commit is blocked with instructions on how to fix it.

## Skip (not recommended)

```bash
git commit --no-verify
```
