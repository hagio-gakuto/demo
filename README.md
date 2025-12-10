# Sample App

勉強用サンプルアプリ

## 必要な環境

- Node.js 22.x
- PostgreSQL 14.x 以上
- npm

## セットアップ

### クイックスタート（推奨）

**前提条件：Docker Desktop が起動していること**

開発に必要な全てのセットアップを一度に実行：

```bash
# Mac/Linuxの場合
make dev-setup

# Windowsの場合
.\make dev-setup
```

このコマンドは以下を自動で実行します：

1. バックエンドの依存関係インストール
2. フロントエンドの依存関係インストール
3. Docker の起動確認
4. PostgreSQL データベースの起動（Docker Compose）
5. Prisma クライアントの生成
6. データベースマイグレーションの実行
7. シードデータの投入

### 個別セットアップ

個別にセットアップする場合：

#### バックエンド

```bash
# Mac/Linuxの場合
make setup-backend

# Windowsの場合
.\make setup-backend
```

#### フロントエンド

```bash
# Mac/Linuxの場合
make setup-frontend

# Windowsの場合
.\make setup-frontend
```

#### シードデータの投入

```bash
# Mac/Linuxの場合
make seed-backend

# Windowsの場合
.\make seed-backend
```

### Windows での実行について

Windows では `.\make` コマンドで実行できます。実行できない場合は、以下の設定を行ってください：

```powershell
# PowerShell実行ポリシーの変更（管理者権限で実行）
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## 📚 ドキュメント・ガイドライン

### 実装説明書

- **[バックエンド実装説明書](./docs/explanations/BACKEND_EXPLANATION.md)**: バックエンドの設計思想、アーキテクチャ、実装パターン
- **[フロントエンド実装説明書](./docs/explanations/FRONTEND_EXPLANATION.md)**: フロントエンドの設計思想、アーキテクチャ、実装パターン

### セットアップガイド

- **[バックエンドセットアップガイド](./docs/guides/BACKEND_SETUP_GUIDE.md)**: バックエンドを0から構築する手順
- **[フロントエンドセットアップガイド](./docs/guides/FRONTEND_SETUP_GUIDE.md)**: フロントエンドを0から構築する手順

### その他のドキュメント

- **[ドキュメント一覧](./docs/README.md)**: 全ドキュメントの一覧

## テスト実行

### すべてのテスト

```bash
# Mac/Linuxの場合
make test

# Windowsの場合
.\make test
```

### バックエンドのみ

```bash
# Mac/Linuxの場合
make test-backend

# Windowsの場合
.\make test-backend
```

### フロントエンドのみ

```bash
# Mac/Linuxの場合
make test-frontend

# Windowsの場合
.\make test-frontend
```

### CI 環境と同じ条件でテスト

```bash
# Mac/Linuxの場合
make ci-test-backend

# Windowsの場合
.\make ci-test-backend
```

**重要：ローカルでテストを実行する前に、必ずセットアップを実行してください！**

```bash
# Mac/Linuxの場合
make setup-backend

# Windowsの場合
.\make setup-backend
```

## Lint & Format

詳細なセットアップ手順は [SETUP_LINT.md](./SETUP_LINT.md) を参照してください。

### バックエンド

```bash
# Mac/Linuxの場合
make lint-backend
make format-backend

# Windowsの場合
.\make lint-backend
.\make format-backend
```

### フロントエンド

```bash
# Mac/Linuxの場合
make lint-frontend
make format-frontend

# Windowsの場合
.\make lint-frontend
.\make format-frontend
```

### 自動フォーマット

VS Codeを使用している場合、ファイルを保存すると自動的にフォーマットされます。

コミット時にも自動的にLintとPrettierが実行されます（Husky + lint-staged）。

## クリーンアップ

```bash
# Mac/Linuxの場合
make clean

# Windowsの場合
.\make clean
```

## 開発環境の起動

### バックエンド

```bash
# Mac/Linuxの場合
make dev-be

# Windowsの場合
.\make dev-be
```

または直接実行：

```bash
cd backend
npm run start:dev
```

バックエンドは `http://localhost:3001` で起動します。

### フロントエンド

```bash
# Mac/Linuxの場合
make dev-fe

# Windowsの場合
.\make dev-fe
```

または直接実行：

```bash
cd frontend
npm run dev
```

フロントエンドは `http://localhost:3000` で起動します。

## データベース操作

### マイグレーション作成

```bash
cd backend
npx prisma migrate dev --name <マイグレーション名>
```

### マイグレーション適用

```bash
cd backend
npx prisma migrate deploy
```

### Prisma Studio（データベース GUI）

```bash
cd backend
npm run prisma:studio
```

## Swagger API ドキュメント

バックエンドを起動後、以下の URL で Swagger UI にアクセスできます：

```
http://localhost:3001/api
```

## プロジェクト構成

```
├── backend/              # バックエンド（NestJS + Prisma）
│   ├── src/
│   │   ├── users/        # ユーザー管理機能
│   │   │   ├── users.controller.ts
│   │   │   ├── users.module.ts
│   │   │   ├── dto/      # リクエスト/レスポンス DTO
│   │   │   ├── entities/ # UserEntity
│   │   │   ├── value-objects/ # UserEmail, UserName
│   │   │   ├── domain/   # Repository インターフェース
│   │   │   ├── infrastructure/ # Repository 実装、Mapper
│   │   │   └── use-cases/ # ユースケース
│   │   ├── search-conditions/ # 検索条件保存機能
│   │   ├── me/           # 認証済みユーザー情報
│   │   ├── common/       # 共通処理
│   │   └── config/       # 設定
│   └── prisma/           # Prismaスキーマとシード
│
├── frontend/             # フロントエンド（Next.js）
│   ├── src/
│   │   ├── app/          # ルーティング
│   │   │   ├── admin/    # 管理者権限が必要なページ
│   │   │   ├── mypage/   # マイページ
│   │   │   └── unauthorized/ # 権限エラーページ
│   │   ├── components/   # 共通コンポーネント
│   │   │   ├── layout/   # レイアウトコンポーネント
│   │   │   ├── ui/       # UIコンポーネント
│   │   │   ├── form/     # フォームコンポーネント
│   │   │   └── features/ # 機能共通コンポーネント
│   │   ├── features/      # 機能ごとのドメインロジック
│   │   │   ├── dashboard/ # ダッシュボード
│   │   │   ├── user-management/ # ユーザー管理
│   │   │   └── mypage/   # マイページ
│   │   ├── contexts/     # React Context
│   │   ├── hooks/        # グローバルフック
│   │   ├── libs/         # ライブラリ設定
│   │   └── types/        # 型定義
│
├── docs/                 # ドキュメント
│   ├── README.md         # ドキュメント一覧
│   ├── BACKEND_EXPLANATION.md # バックエンド実装説明書
│   └── FRONTEND_EXPLANATION.md # フロントエンド実装説明書
│
├── Makefile              # Mac/Linux用タスクランナー
├── make.ps1              # Windows用タスクランナー（PowerShell）
└── make.bat              # Windows用タスクランナー（バッチファイル）
```

## アーキテクチャ

### バックエンド

- **NestJS**: フレームワーク
- **Use Case パターン**: 各操作（create, update, delete, find, search）を独立したUse Caseクラスとして実装
- **DDD (Domain-Driven Design)**: Entity、Value Object、Repository パターンを採用
- **Prisma**: ORM（Prisma 6.18.0）
- **Zod**: バリデーション

**レイヤー構成**:

```
Controller → Use Case → Repository → Entity
```

詳細は [バックエンド実装説明書](./docs/explanations/BACKEND_EXPLANATION.md) を参照してください。

### フロントエンド

- **Next.js 16**: App Router を使用
- **React 19**: UIライブラリ
- **Feature-based Architecture**: 機能ごとにコードを完全に分離
- **URL駆動の状態管理**: 検索条件やページネーションはURLパラメータで管理
- **React Hook Form**: フォーム管理
- **Tailwind CSS 4**: スタイリング
- **SWR**: データ取得とキャッシュ管理

詳細は [フロントエンド実装説明書](./docs/explanations/FRONTEND_EXPLANATION.md) を参照してください。

## 主な機能

### バックエンド

- **ユーザー管理**: CRUD、検索、CSV出力
- **検索条件保存**: 画面検索条件の保存・読み込み
- **認証**: `/me` エンドポイントで認証済みユーザー情報を取得

### フロントエンド

- **ダッシュボード**: 権限別のリンク集
- **ユーザー管理**: ユーザーのCRUD、検索、CSV出力/アップロード
- **マイページ**: ユーザー自身のプロフィール表示・編集

## テスト戦略

- **Unit Test**: ユニットテスト（各層の単体テスト）
- **Integration Test**: 結合テスト（Controller、Repository の統合テスト）
- **E2E Test**: E2E テスト（API 全体のテスト）

## CI/CD

GitHub Actions を使用して CI を実行しています：

- **Lint**: ESLint によるコード品質チェック
- **Test**: Jest による自動テスト
- **Type Check**: TypeScript の型チェック

## ライセンス

UNLICENSED
