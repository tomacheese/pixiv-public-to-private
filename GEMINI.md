# GEMINI.md

## 目的
- Gemini CLI 向けのコンテキストと作業方針を定義する。

## 出力スタイル
- 言語: 日本語
- トーン: 簡潔で事実ベース
- 形式: Markdown

## 共通ルール
- 会話は日本語で行う。
- PR とコミットは Conventional Commits に従う。
- PR タイトルとコミット本文の言語: PR タイトルは Conventional Commits 形式（英語推奨）。PR 本文は日本語。コミットは Conventional Commits 形式（description は日本語）。
- 日本語と英数字の間には半角スペースを入れる。

## プロジェクト概要
- 目的: Changes all illustrations and novels publicly bookmarked on pixiv to private bookmarks.

## コーディング規約
- フォーマット: 既存設定（ESLint / Prettier / formatter）に従う。
- 命名規則: 既存のコード規約に従う。
- コメント言語: 日本語
- エラーメッセージ: 英語

## 開発コマンド
```bash
# 依存関係のインストール
pnpm install

# 開発 / テスト / Lint は README を確認してください
```

## 注意事項
- 認証情報やトークンはコミットしない。
- ログに機密情報を出力しない。
- 既存のプロジェクトルールがある場合はそれを優先する。

## リポジトリ固有
- 概要: Changes all illustrations and novels publicly bookmarked on pixiv to private bookmarks.
- 主要言語: TypeScript
- パッケージマネージャー: pnpm
- 主なエントリポイント: `src/main.ts`
- CI 定義: `.github/workflows/` を参照
- 実行環境: `Dockerfile` を使用
