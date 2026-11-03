# Copilot Code Review Instructions

See [AGENTS.md](../AGENTS.md) for the project overview, language rule (English), commands, and conventions.

## Review focus

- Do not re-flag what Prettier, ESLint (`@book000/eslint-config`), or `tsc` (strict) already enforce.
- Preserve the error-handling pattern: set `process.exitCode = 1` and continue; do not swallow errors silently or let one converter's failure abort the others.
- `PixivRateLimitExceededError` is intentionally re-thrown out of `BaseConverter.run` and handled in `main`; do not "fix" it by catching and continuing.
- New converters must extend `BaseConverter`, implement all abstract members, and use an `itemTypeName` matching the `ENABLE_<ITEM_TYPE>_CONVERTER` convention.
- Public functions and classes should carry English JSDoc.
- Flag non-English PR titles/bodies and any change that enables `skipLibCheck`.
- Flag hardcoded tokens, logging of token values, or committed credentials.
- Configuration comes from environment variables (see README); flag hardcoded alternatives.

## Known patterns — do not flag

- Emoji prefixes in log messages.
- `process.exitCode = 1` instead of `process.exit()`.
