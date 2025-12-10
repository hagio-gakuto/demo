# バックエンド構築ガイドライン

このドキュメントでは、バックエンドアプリケーションを0から構築する手順を解説付きで説明します。

## 前提条件

- Node.js 22.x がインストールされていること
- PostgreSQL 14.x 以上がインストールされていること（または Docker を使用）
- npm がインストールされていること

## 1. プロジェクトの初期化

### 1.1 NestJS プロジェクトの作成

```bash
npm i -g @nestjs/cli
nest new backend
cd backend
```

**解説**: NestJS CLI を使用してプロジェクトを初期化します。`nest new` コマンドで標準的な NestJS プロジェクト構造が作成されます。

**なぜこれが必要か**: NestJS は TypeScript を第一級でサポートし、依存性注入、モジュールシステム、デコレータなどの強力な機能を提供します。これにより、スケーラブルで保守性の高いバックエンドアプリケーションを構築できます。

**意図**: プロジェクトの基盤を標準的な構造で作成することで、チーム開発時の一貫性を保ち、NestJS のベストプラクティスに従った開発が可能になります。

### 1.2 必要なパッケージのインストール

```bash
npm install @nestjs/common @nestjs/core @nestjs/platform-express
npm install @prisma/client prisma
npm install zod
npm install @nestjs/swagger swagger-ui-express
npm install nestjs-cls
npm install ulid
npm install exceljs
npm install pg @types/pg

npm install --save-dev @nestjs/cli @nestjs/schematics @nestjs/testing
npm install --save-dev @types/node @types/jest @types/express
npm install --save-dev typescript ts-node ts-jest tsconfig-paths
npm install --save-dev jest @types/supertest supertest
npm install --save-dev eslint prettier
```

**解説**:

- `@nestjs/*`: NestJS フレームワークのコアパッケージ
- `@prisma/client`, `prisma`: ORM と Prisma CLI
- `zod`: バリデーションライブラリ
- `@nestjs/swagger`: API ドキュメント生成
- `nestjs-cls`: リクエストスコープのコンテキスト管理
- `ulid`: ユニークID生成
- `exceljs`: Excel ファイル処理
- `pg`: PostgreSQL ドライバー

**なぜこれらのパッケージを選ぶか**:

- **Prisma**: 型安全なデータベースアクセスを提供し、マイグレーション管理が容易。スキーマから自動的に型を生成するため、開発効率が高い。
- **Zod**: ランタイムバリデーションとTypeScript型生成を同時に行える。バックエンドとフロントエンドで型を共有できる。
- **Swagger**: API仕様を自動生成し、フロントエンド開発者との連携を円滑にする。
- **nestjs-cls**: リクエストごとのトレースID管理など、リクエストスコープのデータを安全に管理できる。
- **ulid**: UUIDよりもソート可能で、データベースのインデックス性能が良い。

**意図**: 型安全性、開発効率、保守性を重視した技術選定を行い、長期的にメンテナンスしやすいコードベースを構築する。

## 2. Prisma のセットアップ

### 2.1 Prisma の初期化

```bash
npx prisma init
```

**解説**: Prisma を初期化し、`prisma/schema.prisma` ファイルと `.env` ファイルが作成されます。

**なぜこれが必要か**: Prisma はスキーマ駆動の開発を可能にし、データベーススキーマをコードで管理できます。これにより、バージョン管理が容易になり、チーム開発時のスキーマの整合性を保てます。

**意図**: データベーススキーマをコードとして管理し、マイグレーションを通じてスキーマの変更履歴を追跡できるようにする。

### 2.2 データベーススキーマの定義

`prisma/schema.prisma` を編集します：

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum UserRole {
  user
  admin
}

enum Gender {
  male
  female
  other
}

model User {
  id        String   @id @default(ulid())
  email     String   @unique
  role      UserRole @default(user)
  firstName String   @map("first_name")
  lastName  String   @map("last_name")
  gender    Gender?

  createdAt DateTime @default(now()) @map("created_at") @db.Timestamptz
  createdBy String   @map("created_by")
  updatedAt DateTime @updatedAt @map("updated_at") @db.Timestamptz
  updatedBy String   @map("updated_by")
  deletedAt DateTime? @map("deleted_at") @db.Timestamptz
  deletedBy String?   @map("deleted_by")

  @@index([deletedAt])
  @@map("users")
}

model SearchCondition {
  id        String @id @default(ulid())
  formType  String @map("form_type")
  name      String
  urlParams String @map("url_params")

  createdAt DateTime @default(now()) @map("created_at") @db.Timestamptz
  createdBy String   @map("created_by")
  updatedAt DateTime @updatedAt @map("updated_at") @db.Timestamptz
  updatedBy String   @map("updated_by")
  deletedAt DateTime? @map("deleted_at") @db.Timestamptz
  deletedBy String?   @map("deleted_by")

  @@unique([formType, name])
  @@index([deletedAt])
  @@map("search_conditions")
}
```

**解説**:

- `generator client`: Prisma Client の生成設定
- `datasource db`: データベース接続設定
- `enum`: 列挙型の定義（UserRole, Gender）
- `model`: データベーステーブルの定義
- `@id`, `@default(ulid())`: 主キーとデフォルト値
- `@unique`: ユニーク制約
- `@map`: データベースのカラム名マッピング
- `@db.Timestamptz`: PostgreSQL のタイムゾーン付きタイムスタンプ型

**なぜこの設計にするか**:

- **ULID**: UUIDよりもソート可能で、時系列順に並べられる。データベースのインデックス性能が良く、デバッグ時に時系列で追跡しやすい。
- **スネークケースのカラム名**: データベースの慣習に従い、SQLクエリの可読性を向上させる。
- **タイムゾーン付きタイムスタンプ**: グローバルなアプリケーションでも正確な時刻管理が可能。
- **ソフトデリート**: `deletedAt` フィールドで論理削除を実現し、データの復元や監査が可能。
- **監査フィールド**: `createdBy`, `updatedBy` で誰がいつ変更したかを追跡できる。

**意図**: データの整合性、追跡可能性、パフォーマンスを考慮したスキーマ設計を行う。

### 2.3 環境変数の設定

`.env` ファイルを編集します：

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/app?schema=public"
```

**解説**: PostgreSQL への接続URLを設定します。ポート5433を使用しているのは、ローカルの PostgreSQL と競合しないようにするためです。

**なぜ環境変数を使うか**: 環境ごと（開発、ステージング、本番）に異なるデータベース設定を簡単に切り替えられます。機密情報をコードに含めず、セキュリティを向上させます。

**意図**: 環境に依存しない設定管理を行い、デプロイ時の柔軟性を確保する。

### 2.4 マイグレーションの実行

```bash
npx prisma migrate dev --name init
npx prisma generate
```

**解説**:

- `prisma migrate dev`: データベースマイグレーションを作成・適用
- `prisma generate`: Prisma Client を生成

## 3. ディレクトリ構造の作成

以下のディレクトリ構造を作成します：

```
src/
├── app.module.ts
├── main.ts
├── prisma/
│   ├── prisma.module.ts
│   └── prisma.service.ts
├── config/
│   ├── logger.module.ts
│   └── custom-logger.service.ts
├── common/
│   ├── constants/
│   ├── decorators/
│   ├── enums/
│   ├── errors/
│   ├── filters/
│   ├── interceptors/
│   ├── middleware/
│   ├── pipes/
│   ├── services/
│   └── utils/
├── users/
│   ├── users.controller.ts
│   ├── users.module.ts
│   ├── dto/
│   ├── entities/
│   ├── value-objects/
│   ├── domain/
│   ├── infrastructure/
│   └── use-cases/
├── search-conditions/
│   └── ...
└── me/
    └── ...
```

**解説**: 機能ごとにモジュールを分割し、各モジュール内でレイヤーを分離します。

**なぜこの構造にするか**:

- **機能ごとのモジュール分割**: 各機能（users, search-conditions等）を独立したモジュールとして分離することで、変更の影響範囲を明確にし、チーム開発時のコンフリクトを減らします。
- **レイヤー分離**: Controller → Use Case → Repository → Entity という明確な責務分離により、各レイヤーのテストが容易になり、保守性が向上します。
- **共通モジュールの分離**: `common/` 配下に共通処理を集約することで、再利用性を高め、一貫性のある実装を保ちます。

**意図**: スケーラブルで保守性の高いアーキテクチャを実現し、機能追加や変更が容易な構造を構築する。

## 4. まずはシンプルにAPIエンドポイントを作ってみよう

### 4.1 普通のコントローラーを作ってみる

まずは、シンプルなコントローラーを作ってみましょう。

`src/users/users.controller.ts`:

```typescript
import { Controller, Get, Post, Body } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Controller('users')
export class UsersController {
  @Get()
  async findAll() {
    const users = await prisma.user.findMany({
      where: { deletedAt: null },
    });
    return { users };
  }

  @Post()
  async create(
    @Body() body: { email: string; firstName: string; lastName: string },
  ) {
    const user = await prisma.user.create({
      data: {
        email: body.email,
        firstName: body.firstName,
        lastName: body.lastName,
        role: 'user',
        createdBy: 'system',
        updatedBy: 'system',
      },
    });
    return user;
  }
}
```

**やってみよう**: このコードでユーザー一覧とユーザー作成のAPIを作ってみましょう！

**解説**:

- `@Controller('users')`: `/users` エンドポイントを定義
- `@Get()`: GETリクエストを処理
- `@Post()`: POSTリクエストを処理
- `PrismaClient`を直接インスタンス化して使用

### 4.2 複数のコントローラーで同じようなコードを書いてみる

次に、他のエンドポイントも作ってみましょう。

`src/search-conditions/search-conditions.controller.ts`:

```typescript
import { Controller, Get, Post, Body } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

@Controller('search-conditions')
export class SearchConditionsController {
  @Get()
  async findAll() {
    const conditions = await prisma.searchCondition.findMany({
      where: { deletedAt: null },
    });
    return { conditions };
  }

  @Post()
  async create(
    @Body() body: { formType: string; name: string; urlParams: string },
  ) {
    const condition = await prisma.searchCondition.create({
      data: {
        formType: body.formType,
        name: body.name,
        urlParams: body.urlParams,
        createdBy: 'system',
        updatedBy: 'system',
      },
    });
    return condition;
  }
}
```

**気づいたこと**:

- `PrismaClient`を複数のコントローラーでインスタンス化している
- `createdBy: 'system'`がハードコーディングされている
- エラーハンドリングが毎回同じ

### 4.3 共通化してみよう！

同じようなコードが複数箇所にあるので、共通化してみましょう！

`src/prisma/prisma.service.ts`:

```typescript
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();
  }
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

`src/prisma/prisma.module.ts`:

```typescript
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

**使い方**:

```typescript
import { Controller, Get, Post, Body } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('users')
export class UsersController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async findAll() {
    const users = await this.prisma.user.findMany({
      where: { deletedAt: null },
    });
    return { users };
  }
}
```

**良かったこと**:

- `PrismaClient`のインスタンスが1つだけになった
- 接続管理が自動化された
- どのコントローラーからでも`PrismaService`を使える

**意図**: まずはシンプルに実装し、共通化が必要になったら共通化する。段階的に改善していく。

### 4.4 ログも共通化してみよう

### 4.4.1 まずは普通のconsole.logを使う

まずは、普通の`console.log`を使ってみましょう。

```typescript
@Post()
async create(@Body() body: { email: string }) {
  console.log('ユーザー作成開始:', body.email);
  try {
    const user = await this.prisma.user.create({ data: body });
    console.log('ユーザー作成成功:', user.id);
    return user;
  } catch (error) {
    console.error('ユーザー作成失敗:', error);
    throw error;
  }
}
```

### 4.4.2 複数箇所で同じようなログを書いていることに気づく

複数のコントローラーで同じようなログを書いていることに気づきます。

```typescript
// UsersController
console.log('ユーザー作成開始:', body.email);
console.error('ユーザー作成失敗:', error);

// SearchConditionsController
console.log('検索条件作成開始:', body.name);
console.error('検索条件作成失敗:', error);
```

**気づいたこと**:

- ログのフォーマットが統一されていない
- エラーログにスタックトレースが含まれていない
- リクエストIDなど、追跡に必要な情報が含まれていない

### 4.4.3 共通化してみよう！

同じようなログコードが複数箇所にあるので、共通化してみましょう！

`src/config/custom-logger.service.ts`:

```typescript
import { Injectable, LoggerService } from '@nestjs/common';

@Injectable()
export class CustomLoggerService implements LoggerService {
  log(message: string, context?: string) {
    console.log(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'LOG',
        context,
        message,
      }),
    );
  }

  error(error: Error | unknown, context?: string) {
    console.error(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'ERROR',
        context,
        message: error instanceof Error ? error.message : String(error),
        trace: error instanceof Error ? error.stack : undefined,
      }),
    );
  }

  warn(message: string, context?: string) {
    console.warn(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'WARN',
        context,
        message,
      }),
    );
  }
}
```

**使い方**:

```typescript
import { CustomLoggerService } from '../config/custom-logger.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: CustomLoggerService,
  ) {}

  @Post()
  async create(@Body() body: { email: string }) {
    this.logger.log(`ユーザー作成開始: ${body.email}`, 'UsersController');
    try {
      const user = await this.prisma.user.create({ data: body });
      this.logger.log(`ユーザー作成成功: ${user.id}`, 'UsersController');
      return user;
    } catch (error) {
      this.logger.error(error, 'UsersController');
      throw error;
    }
  }
}
```

**良かったこと**:

- ログのフォーマットが統一された
- JSON形式で出力されるようになった（ログ集約ツールで解析しやすい）
- エラーログにスタックトレースが含まれるようになった

**意図**: まずはシンプルに実装し、共通化が必要になったら共通化する。段階的に改善していく。

### 4.5 エラーハンドリングも共通化してみよう

### 4.5.1 まずは普通のtry-catchを使う

まずは、普通の`try-catch`でエラーハンドリングしてみましょう。

```typescript
@Get(':id')
async findOne(@Param('id') id: string) {
  try {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      return { statusCode: 404, message: 'ユーザーが見つかりません' };
    }
    return user;
  } catch (error) {
    return { statusCode: 500, message: 'エラーが発生しました' };
  }
}
```

### 4.5.2 複数箇所で同じようなエラーハンドリングを書いていることに気づく

複数のコントローラーで同じようなエラーハンドリングを書いていることに気づきます。

```typescript
// UsersController
if (!user) {
  return { statusCode: 404, message: 'ユーザーが見つかりません' };
}

// SearchConditionsController
if (!condition) {
  return { statusCode: 404, message: '検索条件が見つかりません' };
}
```

**気づいたこと**:

- エラーレスポンスの形式が統一されていない
- 同じようなエラーメッセージが複数箇所にある
- エラーログが出力されていない

### 4.5.3 共通化してみよう！

同じようなエラーハンドリングが複数箇所にあるので、共通化してみましょう！

`src/common/errors/not-found.error.ts`:

```typescript
export class NotFoundError extends Error {
  constructor(resourceName: string, id: string) {
    super(`${resourceName}（識別子: "${id}"）が見つかりません`);
    this.name = 'NotFoundError';
  }
}
```

`src/common/filters/global-exception.filter.ts`:

```typescript
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { NotFoundError } from '../errors/not-found.error';
import { CustomLoggerService } from '../../config/custom-logger.service';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: CustomLoggerService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = '予期しないエラーが発生しました';

    if (exception instanceof NotFoundError) {
      status = HttpStatus.NOT_FOUND;
      message = exception.message;
    }

    this.logger.error(exception, 'GlobalExceptionFilter');

    response.status(status).json({
      statusCode: status,
      message,
    });
  }
}
```

**使い方**:

```typescript
@Get(':id')
async findOne(@Param('id') id: string) {
  const user = await this.prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw new NotFoundError('ユーザー', id);
  }
  return user;
}
```

**良かったこと**:

- エラーレスポンスの形式が統一された
- エラーメッセージが一貫性を持った
- エラーログが自動的に出力されるようになった

**意図**: まずはシンプルに実装し、共通化が必要になったら共通化する。段階的に改善していく。

## 5. バリデーションも追加してみよう

### 5.1 まずは普通にバリデーションを書く

まずは、コントローラーで直接バリデーションを書いてみましょう。

```typescript
@Post()
async create(@Body() body: any) {
  // バリデーション
  if (!body.email) {
    return { statusCode: 400, message: 'メールアドレスは必須です' };
  }
  if (!body.email.includes('@')) {
    return { statusCode: 400, message: 'メールアドレスの形式が正しくありません' };
  }
  if (!body.firstName) {
    return { statusCode: 400, message: '名前は必須です' };
  }

  // データ作成
  const user = await this.prisma.user.create({
    data: {
      email: body.email,
      firstName: body.firstName,
      lastName: body.lastName,
      role: 'user',
      createdBy: 'system',
      updatedBy: 'system',
    },
  });
  return user;
}
```

**やってみよう**: このコードでバリデーションを実装してみましょう！

### 5.2 複数箇所で同じようなバリデーションを書いていることに気づく

複数のコントローラーで同じようなバリデーションを書いていることに気づきます。

```typescript
// UsersController
if (!body.email) {
  return { statusCode: 400, message: 'メールアドレスは必須です' };
}
if (!body.email.includes('@')) {
  return { statusCode: 400, message: 'メールアドレスの形式が正しくありません' };
}

// 他のコントローラーでも同じようなバリデーション
```

**気づいたこと**:

- バリデーションのコードが長くなってきた
- 同じようなバリデーションが複数箇所にある
- エラーメッセージが統一されていない

### 5.3 Zodを使って共通化してみよう！

同じようなバリデーションが複数箇所にあるので、Zodを使って共通化してみましょう！

まずは、Zodをインストールします：

```bash
npm install zod
```

次に、バリデーションスキーマを定義します：

`src/users/dto/create-user-request.dto.ts`:

```typescript
import { z } from 'zod';

export const createUserRequestSchema = z.object({
  email: z.string().email('メールアドレスの形式が正しくありません'),
  firstName: z.string().min(1, '名前は必須です'),
  lastName: z.string().min(1, '姓は必須です'),
  role: z.enum(['user', 'admin']).optional(),
});

export type CreateUserRequestDto = z.infer<typeof createUserRequestSchema>;
```

バリデーションパイプを作成します：

`src/common/pipes/zod-validation.pipe.ts`:

```typescript
import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { ZodSchema } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodSchema) {}

  transform(value: unknown) {
    try {
      return this.schema.parse(value);
    } catch (error) {
      throw new BadRequestException({
        message: 'バリデーションエラー',
        details: error.errors,
      });
    }
  }
}
```

**使い方**:

```typescript
import { Body, Controller, Post } from '@nestjs/common';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import {
  createUserRequestSchema,
  type CreateUserRequestDto,
} from './dto/create-user-request.dto';

@Controller('users')
export class UsersController {
  @Post()
  async create(
    @Body(new ZodValidationPipe(createUserRequestSchema))
    dto: CreateUserRequestDto,
  ) {
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: dto.role || 'user',
        createdBy: 'system',
        updatedBy: 'system',
      },
    });
    return user;
  }
}
```

**良かったこと**:

- バリデーションのコードが短くなった
- バリデーションルールと型定義を1箇所で管理できる
- エラーメッセージが統一された

**意図**: まずはシンプルに実装し、共通化が必要になったら共通化する。段階的に改善していく。

## 6. コントローラーが大きくなってきた

### 6.1 コントローラーにロジックを書いてみる

まずは、コントローラーに直接ロジックを書いてみましょう。

```typescript
@Controller('users')
export class UsersController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async findAll() {
    const users = await this.prisma.user.findMany({
      where: { deletedAt: null },
    });
    return { users };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundError('ユーザー', id);
    }
    return user;
  }

  @Post()
  async create(
    @Body(new ZodValidationPipe(createUserRequestSchema))
    dto: CreateUserRequestDto,
  ) {
    // メールアドレスの重複チェック
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existingUser) {
      throw new BadRequestException('このメールアドレスは既に登録されています');
    }

    // ユーザー作成
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: dto.role || 'user',
        createdBy: 'system',
        updatedBy: 'system',
      },
    });
    return user;
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateUserRequestSchema))
    dto: UpdateUserRequestDto,
  ) {
    // ユーザー存在チェック
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundError('ユーザー', id);
    }

    // メールアドレスの重複チェック（自分以外）
    if (dto.email && dto.email !== user.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });
      if (existingUser) {
        throw new BadRequestException(
          'このメールアドレスは既に登録されています',
        );
      }
    }

    // ユーザー更新
    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        updatedBy: 'system',
      },
    });
    return updated;
  }
}
```

**やってみよう**: このコードでユーザー管理のAPIを作ってみましょう！

### 6.2 コントローラーが大きくなってきたことに気づく

コントローラーにロジックを書いていくと、コントローラーが大きくなってきます。

**気づいたこと**:

- コントローラーが長くなってきた
- 同じようなロジック（存在チェック、重複チェックなど）が複数箇所にある
- テストが書きにくい

### 6.3 Use Caseに分離してみよう！

コントローラーが大きくなってきたので、ロジックをUse Caseに分離してみましょう！

`src/users/use-cases/create-user.use-case.ts`:

```typescript
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { CreateUserRequestDto } from '../dto/create-user-request.dto';

@Injectable()
export class CreateUserUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: CreateUserRequestDto) {
    // メールアドレスの重複チェック
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existingUser) {
      throw new BadRequestException('このメールアドレスは既に登録されています');
    }

    // ユーザー作成
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: dto.role || 'user',
        createdBy: 'system',
        updatedBy: 'system',
      },
    });
    return user;
  }
}
```

**使い方**:

```typescript
@Controller('users')
export class UsersController {
  constructor(private readonly createUserUseCase: CreateUserUseCase) {}

  @Post()
  async create(
    @Body(new ZodValidationPipe(createUserRequestSchema))
    dto: CreateUserRequestDto,
  ) {
    return this.createUserUseCase.execute(dto);
  }
}
```

**良かったこと**:

- コントローラーがシンプルになった
- ロジックが再利用しやすくなった
- テストが書きやすくなった

**さらに改善**: 複数のUse Caseで同じようなデータアクセスコードがある場合は、Repositoryに分離しましょう。

### 6.4 データの整合性に問題があることに気づく

Use Caseで直接Prismaを使っていると、データの整合性に問題が発生することがあります。

```typescript
// CreateUserUseCase
const user = await this.prisma.user.create({
  data: {
    email: dto.email, // メールアドレスの形式チェックは？
    firstName: dto.firstName, // 空文字列でも通ってしまう
    lastName: dto.lastName,
    role: dto.role || 'user', // デフォルト値の設定が散在
  },
});

// UpdateUserUseCase
const updated = await this.prisma.user.update({
  where: { id },
  data: {
    email: dto.email, // 同じメールアドレスのチェックロジックが重複
    firstName: dto.firstName,
  },
});
```

**気づいたこと**:

- メールアドレスの形式チェックが複数箇所に散在している
- 名前のバリデーション（空文字列チェックなど）が複数箇所にある
- ビジネスルール（例：メールアドレスの重複チェック）が複数箇所に書かれている

### 6.5 エンティティとValue Objectで改善してみよう！

データの整合性を保つために、エンティティとValue Objectを使ってみましょう！

まずは、Value Objectを作成します：

`src/users/value-objects/user-email.vo.ts`:

```typescript
export class UserEmail {
  private constructor(private readonly value: string) {
    // バリデーションを1箇所に集約
    if (!value || !value.includes('@')) {
      throw new Error('メールアドレスの形式が正しくありません');
    }
  }

  static create(email: string): UserEmail {
    return new UserEmail(email);
  }

  getValue(): string {
    return this.value;
  }
}
```

`src/users/value-objects/user-name.vo.ts`:

```typescript
export class UserName {
  private constructor(
    private readonly firstName: string,
    private readonly lastName: string,
  ) {
    // バリデーションを1箇所に集約
    if (!firstName || firstName.trim() === '') {
      throw new Error('名前は必須です');
    }
    if (!lastName || lastName.trim() === '') {
      throw new Error('姓は必須です');
    }
  }

  static create(params: { firstName: string; lastName: string }): UserName {
    return new UserName(params.firstName, params.lastName);
  }

  getFirstName(): string {
    return this.firstName;
  }

  getLastName(): string {
    return this.lastName;
  }

  // ビジネスロジックも1箇所に集約
  getFullName(): string {
    return `${this.lastName} ${this.firstName}`;
  }
}
```

次に、Entityを作成します：

`src/users/entities/user.entity.ts`:

```typescript
import { UserEmail } from '../value-objects/user-email.vo';
import { UserName } from '../value-objects/user-name.vo';

type UserProps = {
  id?: string;
  email: UserEmail;
  name: UserName;
  role: 'user' | 'admin';
  createdAt?: Date;
  createdBy: string;
  updatedAt?: Date;
  updatedBy: string;
};

export class UserEntity {
  private constructor(private readonly props: UserProps) {}

  static createNew(params: {
    email: string;
    firstName: string;
    lastName: string;
    role: 'user' | 'admin';
    userId: string;
  }): UserEntity {
    return new UserEntity({
      email: UserEmail.create(params.email), // バリデーションが自動的に実行される
      name: UserName.create({
        firstName: params.firstName,
        lastName: params.lastName,
      }), // バリデーションが自動的に実行される
      role: params.role,
      createdBy: params.userId,
      updatedBy: params.userId,
    });
  }

  // ビジネスロジックをEntityに集約
  changeEmail(email: string, userId: string): void {
    this.props.email = UserEmail.create(email); // バリデーションが自動的に実行される
    this.props.updatedBy = userId;
  }

  // DTOへの変換
  toPrimitives() {
    return {
      id: this.props.id,
      email: this.props.email.getValue(),
      firstName: this.props.name.getFirstName(),
      lastName: this.props.name.getLastName(),
      fullName: this.props.name.getFullName(), // ビジネスロジックを利用
      role: this.props.role,
      createdAt: this.props.createdAt,
      createdBy: this.props.createdBy,
      updatedAt: this.props.updatedAt,
      updatedBy: this.props.updatedBy,
    };
  }
}
```

**使い方**:

```typescript
@Injectable()
export class CreateUserUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: CreateUserRequestDto) {
    // Entityを作成（バリデーションが自動的に実行される）
    const entity = UserEntity.createNew({
      email: dto.email, // ここでメールアドレスの形式チェックが実行される
      firstName: dto.firstName, // ここで名前のバリデーションが実行される
      lastName: dto.lastName,
      role: dto.role || 'user',
      userId: 'system',
    });

    // メールアドレスの重複チェック
    const existingUser = await this.prisma.user.findUnique({
      where: { email: entity.toPrimitives().email },
    });
    if (existingUser) {
      throw new BadRequestException('このメールアドレスは既に登録されています');
    }

    // データベースに保存
    const user = await this.prisma.user.create({
      data: {
        email: entity.toPrimitives().email,
        firstName: entity.toPrimitives().firstName,
        lastName: entity.toPrimitives().lastName,
        role: entity.toPrimitives().role,
        createdBy: entity.toPrimitives().createdBy,
        updatedBy: entity.toPrimitives().updatedBy,
      },
    });
    return user;
  }
}
```

**良かったこと**:

- バリデーションロジックが1箇所に集約された
- ビジネスルール（例：フルネームの取得）がEntityに集約された
- 不正なデータの作成を防げるようになった
- コードの意図が明確になった

**意図**: まずはシンプルに実装し、データの整合性に問題があることに気づいたら、エンティティやValue Objectで改善する。段階的に改善していく。

## 7. モジュールを整理してみよう

### 7.1 まずはシンプルにモジュールを作る

まずは、シンプルなモジュールを作ってみましょう。

`src/users/users.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserUseCase } from './use-cases/create-user.use-case';

@Module({
  controllers: [UsersController],
  providers: [PrismaService, CreateUserUseCase],
})
export class UsersModule {}
```

**やってみよう**: このモジュールでユーザー機能を実装してみましょう！

### 7.2 複数のモジュールで同じサービスを使っていることに気づく

複数のモジュールで`PrismaService`や`CustomLoggerService`を使っていることに気づきます。

```typescript
// UsersModule
providers: [PrismaService, CustomLoggerService, ...]

// SearchConditionsModule
providers: [PrismaService, CustomLoggerService, ...]
```

**気づいたこと**:

- 同じサービスを複数のモジュールで登録している
- モジュールの設定が冗長になってきた

### 7.3 グローバルモジュールにしてみよう！

複数のモジュールで同じサービスを使うので、グローバルモジュールにしてみましょう！

`src/prisma/prisma.module.ts`:

```typescript
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

**使い方**:

```typescript
// AppModuleで1回だけインポート
@Module({
  imports: [PrismaModule, UsersModule, SearchConditionsModule],
})
export class AppModule {}

// UsersModuleではインポート不要
@Module({
  controllers: [UsersController],
  providers: [CreateUserUseCase], // PrismaServiceは自動的に利用可能
})
export class UsersModule {}
```

**良かったこと**:

- モジュールの設定がシンプルになった
- 同じサービスを複数回登録する必要がなくなった

**意図**: まずはシンプルに実装し、共通化が必要になったら共通化する。段階的に改善していく。

## 8. main.ts の設定

`src/main.ts`:

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { CustomLoggerService } from './config/custom-logger.service';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TraceService } from './common/services/trace.service';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = app.get(CustomLoggerService);
  const traceService = app.get(TraceService);

  app.enableCors();
  app.useGlobalFilters(new GlobalExceptionFilter(logger));
  app.useGlobalInterceptors(new LoggingInterceptor(logger, traceService));

  // Swagger設定
  const config = new DocumentBuilder()
    .setTitle('Atsys API')
    .setDescription('ATSys API ドキュメント')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT ?? 3001;
  await app.listen(port);

  logger.log(`アプリケーションがポート ${port} で起動しました`, 'Bootstrap');
  logger.log(`Swagger UI: http://localhost:${port}/api`, 'Bootstrap');
}
bootstrap().catch((error) => {
  console.error('Error starting server:', error);
  process.exit(1);
});
```

**解説**: アプリケーションの起動設定を行います。グローバルフィルター、インターセプター、Swaggerを設定します。

**なぜグローバルフィルターを設定するか**: すべての例外を一元管理し、一貫性のあるエラーレスポンスを返すためです。これにより、各コントローラーで個別にエラーハンドリングを行う必要がなくなります。

**なぜインターセプターを設定するか**: リクエスト/レスポンスのロギング、トレースIDの生成など、横断的関心事をインターセプターで処理します。これにより、各コントローラーにロギングコードを書く必要がなくなります。

**なぜSwaggerを設定するか**: API仕様を自動生成することで、フロントエンド開発者との連携が円滑になります。また、APIの動作確認も容易になります。

**意図**: アプリケーション全体の横断的関心事を一元管理し、開発効率と運用性を向上させる。

## 9. シードデータの作成

`prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client';
import { seedUsers } from './seeds/user.seed';

const prisma = new PrismaClient();

async function main() {
  console.log('データベースのシードを開始...\n');
  await seedUsers({ prisma });
  console.log('すべてのシードが正常に完了しました！');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

`package.json` に追加:

```json
{
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
}
```

**解説**: 開発用の初期データを投入するシードスクリプトを作成します。

**なぜシードデータが必要か**: 開発環境で一貫したデータを用意することで、開発者が同じ条件でテストできます。また、新規メンバーのオンボーディング時にも、すぐに開発を始められます。

**なぜpackage.jsonに設定するか**: `prisma.seed`を設定することで、`prisma migrate reset`実行時に自動的にシードデータが投入されます。これにより、データベースのリセットとシードデータの投入を1コマンドで実行できます。

**意図**: 開発環境のセットアップを簡素化し、一貫した開発環境を提供する。

## 10. 開発サーバーの起動

```bash
npm run start:dev
```

**解説**: 開発モードでサーバーを起動します。ファイル変更時に自動的に再起動されます。

## まとめ

このガイドラインに従って、バックエンドアプリケーションを0から構築できます。各ステップで実装する内容とその理由を理解することで、プロジェクトの構造を把握しやすくなります。

詳細な実装パターンについては、[BACKEND_EXPLANATION.md](../explanations/BACKEND_EXPLANATION.md) を参照してください。
