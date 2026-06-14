// Checks whether a PR title/body is mostly written in Japanese.
// Dependency-free Node.js ESM script intended to be run from CI via
// `pull_request_target` (see .github/workflows/check-pr-language.yml).

// Threshold (inclusive) above which the text is considered "mostly Japanese".
const JAPANESE_RATIO_THRESHOLD = 0.8

// Hiragana, katakana, and CJK Unified Ideographs (incl. extension A).
const JAPANESE_PATTERN = /[぀-ゟ゠-ヿ㐀-䶿一-鿿]/gu
// Latin letters and digits.
const LATIN_PATTERN = /[A-Za-z0-9]/gu

/**
 * Calculates the ratio of Japanese characters to the total number of
 * Japanese and Latin alphanumeric characters in the given text.
 *
 * @param text - Text to inspect
 * @returns A ratio between 0 and 1. Returns 0 if the text contains neither
 *   Japanese nor Latin alphanumeric characters.
 */
function calculateJapaneseRatio(text) {
  const japaneseCount = (text.match(JAPANESE_PATTERN) ?? []).length
  const latinCount = (text.match(LATIN_PATTERN) ?? []).length
  const total = japaneseCount + latinCount

  if (total === 0) {
    return 0
  }

  return japaneseCount / total
}

/**
 * Checks the PR title and body against {@link JAPANESE_RATIO_THRESHOLD}.
 *
 * The body is skipped if it is empty (or only whitespace).
 *
 * @param title - PR title
 * @param body - PR body (may be `null`/`undefined`/empty)
 * @returns An array of human-readable failure messages. Empty if both the
 *   title and body pass the check.
 */
function checkPullRequestLanguage(title, body) {
  const failures = []

  const titleRatio = calculateJapaneseRatio(title ?? '')
  if (titleRatio >= JAPANESE_RATIO_THRESHOLD) {
    failures.push(
      `PR title appears to be mostly Japanese (Japanese ratio: ${titleRatio.toFixed(2)}). Please write the PR title in English.`
    )
  }

  const trimmedBody = (body ?? '').trim()
  if (trimmedBody.length > 0) {
    const bodyRatio = calculateJapaneseRatio(trimmedBody)
    if (bodyRatio >= JAPANESE_RATIO_THRESHOLD) {
      failures.push(
        `PR body appears to be mostly Japanese (Japanese ratio: ${bodyRatio.toFixed(2)}). Please write the PR body in English.`
      )
    }
  }

  return failures
}

const title = process.env.PR_TITLE ?? ''
const body = process.env.PR_BODY ?? ''

const failures = checkPullRequestLanguage(title, body)
for (const failure of failures) {
  console.error(failure)
}

if (failures.length > 0) {
  process.exitCode = 1
}
