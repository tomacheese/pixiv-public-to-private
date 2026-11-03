# AGENTS.md

Guidance for AI coding agents working in this repository.

## Language

- All deliverables are written in English: commit messages, PR/Issue titles and bodies, review comments, code comments, JSDoc, and documentation.
- Exceptions: localized UI strings, quotations, technical identifiers, generated files, and external source text.
- Error messages are English.
- CI (`.github/workflows/check-pr-language.yml`) fails a PR whose title or body is 80% or more Japanese.

## Overview

TypeScript (Node.js, ESM, pnpm) app that changes public pixiv illustration bookmarks, novel bookmarks, and (optionally) followings to private. It runs in a loop inside Docker (`entrypoint.sh` runs `pnpm start` every 10 minutes).

- `src/main.ts`: reads the token file, authenticates with pixiv, then runs each converter in sequence.
- `src/converters/base.ts`: `BaseConverter` abstract class (pagination, per-item conversion, deleted-item handling, enable check).
- `src/converters/`: `illust-bookmarks.ts`, `novel-bookmarks.ts`, `following.ts`.
- `src/exceptions.ts`: custom errors.

Configuration (see `README.md`): `PIXIV_TOKEN_PATH` (default `data/token.json`), `DELETE_BOOKMARK_FOR_DELETED_ITEMS`, and `ENABLE_<ITEM_TYPE>_CONVERTER` (e.g. `ENABLE_ILLUST_BOOKMARKS_CONVERTER`; falls back to the converter's `isDefaultEnabled`).

## Commands

```bash
pnpm install       # install dependencies
pnpm start         # run once
pnpm dev           # run with auto-reload
pnpm lint          # prettier --check, eslint, tsc
pnpm fix           # prettier --write, eslint --fix
```

There is no test suite. Node.js version is in `.node-version`; the pnpm version is pinned in `package.json`.

## Conventions

- Commits: [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) (`<type>(<scope>): <description>`); branches: [Conventional Branch](https://conventional-branch.github.io) short form (`feat`, `fix`, ...).
- Add and update JSDoc for functions.
- Never enable `skipLibCheck` in `tsconfig.json` to work around type errors.
- Failures are reported by setting `process.exitCode = 1` and continuing, so one failing converter does not abort the others. `PixivRateLimitExceededError` is intentionally re-thrown from `BaseConverter.run` and handled in `main` to stop the run.
- Emoji prefixes in log messages are an intentional convention.
- Never include sensitive information in commits or PRs (credentials, tokens such as `data/token.json`, `.env`, internal URLs), and never log secret values.
- Do not add commits to Renovate-created pull requests.

## Before a PR

- `pnpm lint` passes and the change was verified to work.
- No sensitive information in the diff.
- The PR title and body are in English, and the body describes only the branch's current final state, not its history.
- Commit messages follow Conventional Commits with an English description.
