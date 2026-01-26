# GEMINI.md

## 目的

このドキュメントは、Gemini CLI がこのリポジトリで作業する際のコンテキストと方針を定義します。

## 出力スタイル

- 言語: 日本語
- トーン: プロフェッショナルかつ簡潔な CLI スタイル
- 形式: GitHub Flavored Markdown

## 共通ルール

- 会話は日本語で行う。
- コミットメッセージは Conventional Commits に従い、`<description>` は日本語とする。
- 日本語と英数字の間には半角スペースを挿入する。

## プロジェクト概要

- 目的: pixiv の公開ブックマークを非公開に変更する。
- 主要技術: TypeScript, Node.js, pnpm, `@book000/pixivts`.

## コーディング規約

- フォーマット: Prettier (`.prettierrc.yml`)
- Linter: ESLint (`eslint.config.mjs`)
- コメント: 日本語で JSDoc 形式の docstring を記載。
- エラーメッセージ: 英語（既存の絵文字スタイルを尊重する）。

## 開発コマンド

```bash
# 依存関係のインストール
pnpm install

# 実行
pnpm start

# Lint / 型チェック
pnpm lint

# 自動修正
pnpm fix
```

## 注意事項

- **認証情報**: `data/token.json` などの機密情報を絶対にコミットしない。
- **ログ**: トークンやパスワードをログに出力しない。
- **既存ルールの優先**: 常にリポジトリ内の既存のスタイルや実装パターンを優先する。
- **TypeScript**: `skipLibCheck` による回避は禁止。

## リポジトリ固有

- `src/main.ts` に主要なロジックが集約されている。
- `docker-compose.yml` (または `compose.yaml`) によるコンテナ実行が主目的である。
- `@book000/pixivts` を通じた API 操作が中心となる。
