# プロジェクトドキュメント

このディレクトリには、プロジェクトの実装説明書とガイドラインが含まれています。

## ドキュメント一覧

### 実装説明書

- **[explanations/BACKEND_EXPLANATION.md](./explanations/BACKEND_EXPLANATION.md)**: バックエンド実装の詳細説明
- **[explanations/FRONTEND_EXPLANATION.md](./explanations/FRONTEND_EXPLANATION.md)**: フロントエンド実装の詳細説明

### ガイドライン

- **[guides/BACKEND_SETUP_GUIDE.md](./guides/BACKEND_SETUP_GUIDE.md)**: バックエンドを0から構築する手順
- **[guides/FRONTEND_SETUP_GUIDE.md](./guides/FRONTEND_SETUP_GUIDE.md)**: フロントエンドを0から構築する手順

## プロジェクト概要

このプロジェクトは、NestJSとNext.jsを使用したフルスタックアプリケーションです。

### バックエンド

- **フレームワーク**: NestJS
- **ORM**: Prisma 6.18.0
- **データベース**: PostgreSQL
- **主な機能**:
  - ユーザー管理（CRUD、検索、CSV出力）
  - 検索条件保存
  - 認証（`/me`エンドポイント）

### フロントエンド

- **フレームワーク**: Next.js 16 (App Router)
- **UIライブラリ**: React 19
- **スタイリング**: Tailwind CSS 4
- **主な機能**:
  - ダッシュボード
  - ユーザー管理（CRUD、検索、CSV出力/アップロード）
  - マイページ

## 開発ガイドライン

各ドキュメントには、以下の情報が含まれています：

- 設計思想とアーキテクチャ
- ディレクトリ構成
- コーディング規約
- 実装パターン
- よくある間違いと正しい実装

新しい機能を実装する際は、必ず該当するドキュメントを参照してください。
