# GitHub Copilot Instructions

## プロジェクト概要

- 目的: pixiv で公開設定になっているブックマーク（イラスト・小説）を、定期的に非公開設定に変更する。
- 主な機能: 公開ブックマークの取得、非公開への更新、削除済みアイテムのブックマーク解除。
- 対象ユーザー: pixiv のブックマークを常に非公開に保ちたいユーザー。

## 共通ルール

- 会話は日本語で行う。
- PR とコミットは [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) に従う。
  - `<type>(<scope>): <description>` 形式。
  - `<description>` は日本語で記載する。
- 日本語と英数字の間には半角スペースを入れる。

## 技術スタック

- 言語: TypeScript
- 実行環境: Node.js (tsx)
- パッケージマネージャー: pnpm
- 主要ライブラリ:
  - `@book000/pixivts`: pixiv API クライアント
  - `@book000/node-utils`: 共通ユーティリティ（Logger など）

## 開発コマンド

```bash
# 依存関係のインストール
pnpm install

# 実行
pnpm start

# 開発（ウォッチモード）
pnpm dev

# Lint チェック
pnpm lint

# コードの自動修正
pnpm fix
```

## コーディング規約

- フォーマット: Prettier (`.prettierrc.yml`)
- Linter: ESLint (`eslint.config.mjs`)
- TypeScript: `skipLibCheck` の使用は禁止。
- ドキュメント: 関数やインターフェースには JSDoc 形式の docstring を日本語で記載する。

## テスト方針

- 現在、明示的なテストコードは存在しない。新規機能追加時は必要に応じてテストを追加する。

## セキュリティ / 機密情報

- `data/token.json` などの認証情報や API キーをコミットに含めない。
- ログにアクセストークンなどの機密情報を出力しない。

## ドキュメント更新

- コードの変更に合わせて `README.md` や関連ドキュメントを更新する。

## リポジトリ固有

- `data/token.json` に `refresh_token` を配置して動作する。
- Docker Compose 環境での動作を想定している。
