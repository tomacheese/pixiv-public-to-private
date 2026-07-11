# Copilot Code Review Instructions

Guidance for GitHub Copilot when reviewing pull requests in this repository. This is a TypeScript (Node.js, ESM) app that converts public pixiv bookmarks/followings to private, running on a loop inside Docker.

## Language

- All PR titles, PR bodies, code, comments, and JSDoc must be in English.
- The `check-pr-language` workflow fails a PR whose title or body is 80% or more Japanese. Flag non-English PR titles/bodies.

## Conventions enforced by tooling (do not re-flag as style opinions)

- Formatting is enforced by Prettier (`.prettierrc.yml`): no semicolons, single quotes, `printWidth` 80, `trailingComma: es5`, LF line endings. Do not raise findings that Prettier already normalizes.
- Linting uses `@book000/eslint-config` via `eslint.config.mjs`. TypeScript runs under `strict` with `noUnusedLocals`, `noUnusedParameters`, `noImplicitReturns`, and `noFallthroughCasesInSwitch`.
- Commit messages follow Conventional Commits with an English description.

## Review focus

- Error handling: the codebase reports failures by setting `process.exitCode = 1` and continuing, rather than throwing, so that one failing converter does not abort the others (see `src/main.ts` and `BaseConverter.run`). Preserve this pattern; flag changes that swallow errors silently or that let one converter's failure crash the whole run.
- `PixivRateLimitExceededError` is intentionally re-thrown out of `BaseConverter.run` and handled in `main` to stop the run early. Do not "fix" this by catching and continuing.
- New converters must extend `BaseConverter` and implement all abstract members; verify the `itemTypeName` matches the `ENABLE_<ITEM_TYPE>_CONVERTER` env-var convention.
- Public functions and classes should carry English JSDoc, consistent with the existing code.
- Never enable `skipLibCheck` in `tsconfig.json` to work around type errors.

## Security

- The pixiv refresh/access token lives in the token file (default `data/token.json`). Never hardcode tokens, and flag any change that logs token values or commits real credentials.
- Configuration comes from environment variables — the token file path (`PIXIV_TOKEN_PATH`) and the deleted-item behavior flag (`DELETE_BOOKMARK_FOR_DELETED_ITEMS`); do not introduce hardcoded alternatives.

## Known patterns — do not flag

- Emoji prefixes in log messages (e.g. `🚨`, `📝`, `🗑️`) are an intentional project convention.
- Setting `process.exitCode = 1` instead of calling `process.exit()` is intentional (lets the current loop iteration finish cleanly).
