# Claude Code Working Guidelines

## Purpose

This document defines the policies and rules for Claude Code (an AI coding assistant) when working on the pixiv-public-to-private project.

## Project Overview

- Purpose: changes items publicly bookmarked/followed on pixiv (illust bookmarks, novel bookmarks, and followings) to private
- Main features:
  - Fetches the public lists (illust bookmarks, novel bookmarks, followings) via the pixiv API
  - Changes each item's visibility from public to private
  - Optionally removes bookmarks/followings for items that have been deleted
  - Runs continuously in a loop inside a Docker container (`entrypoint.sh`)
- Each item type is handled by a converter under `src/converters/` extending `BaseConverter`. A converter can be toggled via the `ENABLE_<ITEM_TYPE>_CONVERTER` environment variable (e.g. `ENABLE_ILLUST_BOOKMARKS_CONVERTER`); when unset, the converter's own default applies

## Important Rules

- Project language: English is the primary language for all project artifacts (code, comments, commit messages, PR titles/bodies, and documentation). The only exception is direct conversation with Claude Code itself, which follows the user's personal/global instructions.
- Code comments: English
- Error messages: English
- A CI check (`.github/workflows/check-pr-language.yml`) fails the PR if the PR title or body is 80% or more Japanese

## Environment Rules

- Commit messages: follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)
  - `<type>(<scope>): <description>` format
  - `<description>` is written in English
- Branch naming: follow [Conventional Branch](https://conventional-branch.github.io)
  - `<type>/<description>` format
  - Use the short form of `<type>` (feat, fix)
- When researching a GitHub repository, clone it into a temporary directory and search there
- Do not add commits or updates to existing Renovate-created pull requests

## Code Change Rules

- Never enable `skipLibCheck` in a TypeScript project to work around type errors
- Add and update docstrings (JSDoc) for functions, written in English

## Development Commands

```bash
# Install dependencies
pnpm install

# Run the application
pnpm start

# Run the application with auto-reload
pnpm dev

# Lint check (runs prettier, eslint, tsc in order)
pnpm lint

# Lint fix (runs prettier, eslint in order)
pnpm fix
```

## Architecture and Key Files

- `src/main.ts`: entry point. Authenticates with pixiv, then runs each converter in sequence
- `src/converters/base.ts`: `BaseConverter` abstract class shared by all converters (pagination, per-item conversion, deleted-item handling, env-var enable check)
- `src/converters/`: concrete converters — `illust-bookmarks.ts`, `novel-bookmarks.ts`, `following.ts`
- `entrypoint.sh`: Docker entrypoint that runs `pnpm start` in a loop with a 10-minute interval
- `Dockerfile`: builds the production image
- `compose.yaml`: example Docker Compose configuration

## Work Checklist

### Before New Work

1. Thoroughly explore and understand the project
2. Verify the working branch is appropriate — not a branch with a closed PR
3. Verify it is a new branch based on the latest remote branch
4. Verify that closed/unnecessary branches have been deleted
5. Install dependencies with `pnpm install`

### Before Commit/Push

1. Commit message follows Conventional Commits (`<description>` in English)
2. No sensitive information in the commit
3. `pnpm lint` runs without errors
4. Verify the change works as expected

### Before Creating a PR

1. The user has requested that a PR be created
2. No sensitive information in the commit
3. No risk of conflicts
4. Run `/code-review:code-review` and address all findings with a score of 50 or higher

### After Creating a PR

1. Confirm no conflicts have occurred
2. Update the PR body to reflect only the current state of the branch, in English, without including the update history of this PR
3. Wait for GitHub Actions CI with `gh pr checks <PR ID> --watch` and confirm it does not fail
4. Request a review from GitHub Copilot and respond to its comments
5. Run `/code-review:code-review` to perform a code review. Address all findings with a score of 50 or higher

## Repository-Specific Notes

- The package manager is pnpm (version pinned in `package.json`)
- The Node.js version is managed via the `.node-version` file
- Renovate is enabled for automatic dependency updates
