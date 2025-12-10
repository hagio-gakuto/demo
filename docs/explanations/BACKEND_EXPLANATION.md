# バックエンド実装説明書

## 1. 設計思想

このバックエンドアプリケーションは、NestJS の**機能ごとモジュール構成**をベースにした、**Use Case パターンと DDD の概念を組み合わせたアーキテクチャ**です。

現在は以下の 3 機能を扱います。

- `users` … ユーザー管理（user / admin ロール、ソフトデリート、CRUD、検索、CSV出力）
- `search-conditions` … 画面検索条件の保存（ソフトデリート）
- `me` … 認証済みユーザー情報の取得

### 1.1 レイヤー構成

- **Controller 層**: HTTP の受付（URL と入力チェック、レスポンス整形）
- **Use Case 層**: ユースケース単位のロジック（「何をするか」を書く）
- **Repository 層**: データの永続化（Entity と Prisma 型の変換）
- **Entity 層**: ドメインロジック（ビジネスルール）
- **Value Object 層**: 値のバリデーションとロジック

#### Controller 層

**責務**

- HTTP リクエスト（パスパラメータ、クエリ、ボディ）の受付
- Zod + `ZodValidationPipe` による入力バリデーション
- Use Case の呼び出しとレスポンスの返却

**してはいけないこと**

- 複雑なビジネスロジック（条件分岐・計算）
- Prisma を直接叩くこと
- Entity を直接操作すること

#### Use Case 層

**責務**

- ユースケース単位の処理をまとめる
- Repository を経由したデータ操作
- エラーハンドリングとログ出力

**してはいけないこと**

- HTTP 依存（`Request` / `Response` への依存）
- Prisma を直接叩くこと（Repository を経由する）

#### Repository 層

**責務**

- データの永続化
- Entity と Prisma 型の変換（Mapper を使用）
- Prisma のエラーをカスタムエラーに変換

**してはいけないこと**

- ビジネスロジック（Entity に書くべき）
- データの加工（Use Case 層に書くべき）

#### Entity 層

**責務**

- ドメインロジック（ビジネスルール）
- データの整合性を保つ
- Value Object を使用してプリミティブを排除

**してはいけないこと**

- Prisma への直接依存
- HTTP 依存

#### Value Object 層

**責務**

- 値のバリデーション
- 値に関するロジック（計算プロパティ等）

**してはいけないこと**

- エンティティへの依存

---

## 2. 技術スタック

- **NestJS**: フレームワーク
- **TypeScript**
- **Prisma 6.18.0**: ORM
- **PostgreSQL**
- **Zod**: バリデーション

---

## 3. ディレクトリ構成

現状のバックエンドの構成は次のとおりです。

```text
src/
├── app.module.ts          # ルートモジュール
├── main.ts                # エントリポイント
├── prisma/
│   ├── prisma.module.ts   # PrismaService を提供するモジュール
│   └── prisma.service.ts  # PrismaClient ラッパ
├── config/
│   └── logger.module.ts   # ロガー設定
├── common/                # 共通処理
│   ├── constants/         # 定数（エラーメッセージ、バリデーションメッセージ等）
│   ├── decorators/        # カスタムデコレータ（@CurrentUser等）
│   ├── errors/            # カスタムエラー
│   ├── filters/           # グローバル例外フィルター
│   ├── interceptors/      # インターセプター（ロギング等）
│   ├── middleware/        # ミドルウェア（認証等）
│   ├── pipes/             # Zod バリデーションパイプ
│   ├── services/           # 共通サービス（TraceService等）
│   └── utils/             # ユーティリティ（日付、エラーハンドリング等）
├── users/                 # ユーザー機能
│   ├── users.controller.ts
│   ├── users.module.ts
│   ├── dto/               # リクエスト/レスポンス DTO
│   ├── entities/          # UserEntity
│   ├── value-objects/     # UserEmail, UserName
│   ├── domain/           # Repository インターフェース
│   ├── infrastructure/   # Repository 実装、Mapper、FilterBuilder
│   └── use-cases/        # ユースケース（CreateUserUseCase等）
├── search-conditions/     # 検索条件機能
│   ├── search-conditions.controller.ts
│   ├── search-conditions.module.ts
│   ├── dto/
│   ├── entities/
│   ├── domain/
│   ├── infrastructure/
│   └── use-cases/
└── me/                    # 認証済みユーザー情報
    ├── me.controller.ts
    ├── me.module.ts
    ├── me.service.ts
    └── dto/
```

---

## 4. コーディング時の具体的な指針

### 4.1 各レイヤーの実装パターン

#### 処理の流れ

```text
HTTPリクエスト
  ↓
【Controller】
  - リクエスト受け取り
  - Zod で入力バリデーション
  - Use Case 呼び出し
  ↓
【Use Case】
  - Repository から Entity を取得/作成
  - Entity の振る舞いメソッドを呼び出し
  - Repository で保存
  - エラーハンドリング
  ↓
【Repository】
  - Mapper で Entity ↔ Prisma 型の変換
  - Prisma で DB アクセス
  - Prisma のエラーをカスタムエラーに変換
  ↓
【Controller】
  - レスポンス返却
```

#### ✅ Controller 層の書き方（例：Users）

```typescript
// src/users/users.controller.ts
import { Body, Controller, Get, Post } from '@nestjs/common';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateUserUseCase } from './use-cases/create-user.use-case';
import {
  createUserRequestSchema,
  type CreateUserRequestDto,
} from './dto/create-user-request.dto';
import type { UserResponseDto } from './dto/user-response.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly createUserUseCase: CreateUserUseCase) {}

  @Post()
  async create(
    @Body(new ZodValidationPipe(createUserRequestSchema))
    dto: CreateUserRequestDto,
    @CurrentUser() userId: string,
  ): Promise<UserResponseDto> {
    return this.createUserUseCase.execute({
      email: dto.email,
      role: dto.role,
      firstName: dto.firstName,
      lastName: dto.lastName,
      gender: dto.gender ?? null,
      userId,
    });
  }
}
```

#### ✅ Use Case 層の書き方（例：CreateUserUseCase）

```typescript
// src/users/use-cases/create-user.use-case.ts
import { Injectable } from '@nestjs/common';
import type { Gender, UserRole } from '@prisma/client';
import { UsersRepository } from '../infrastructure/users.repository';
import { UserEntity } from '../entities/user.entity';
import type { UserResponseDto } from '../dto/user-response.dto';
import { handlePrismaError } from '../../common/utils/prisma-error-handler';
import { CustomLoggerService } from '../../config/custom-logger.service';

type CreateUserParams = {
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  gender: Gender | null;
  userId: string;
};

@Injectable()
export class CreateUserUseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly logger: CustomLoggerService,
  ) {}

  async execute(params: CreateUserParams): Promise<UserResponseDto> {
    // ✅ OK: Entity のファクトリメソッドを使用
    const entity = UserEntity.createNew({
      email: params.email,
      role: params.role,
      firstName: params.firstName,
      lastName: params.lastName,
      gender: params.gender,
      userId: params.userId,
    });

    try {
      // ✅ OK: Repository で保存
      const created = await this.usersRepository.create(entity);
      return created.toPrimitives();
    } catch (error) {
      // ✅ OK: エラーハンドリングとログ出力
      this.logger.error(
        error instanceof Error ? error : new Error(String(error)),
        undefined,
        'CreateUserUseCase',
      );
      handlePrismaError(error, {
        resourceName: 'ユーザー',
        id: params.email,
        duplicateMessage: 'このメールアドレスは既に登録されています',
      });
      throw error;
    }
  }
}
```

#### ✅ Repository 層の書き方（例：UsersRepository）

```typescript
// src/users/infrastructure/users.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UserEntity } from '../entities/user.entity';
import type { IUsersRepository } from '../domain/users.repository.interface';
import { PrismaUserMapper } from './persistence/prisma-user.mapper';

@Injectable()
export class UsersRepository implements IUsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(user: UserEntity): Promise<UserEntity> {
    // ✅ OK: Mapper を使用して Entity から Prisma 型に変換
    const data = PrismaUserMapper.toPrismaInput(user);
    const created = await this.prisma.user.create({ data });
    // ✅ OK: Mapper を使用して Prisma 型から Entity に変換
    return PrismaUserMapper.toEntity(created);
  }

  async findById(id: string): Promise<UserEntity | null> {
    const row = await this.prisma.user.findUnique({ where: { id } });
    if (!row) return null;
    return PrismaUserMapper.toEntity(row);
  }
}
```

#### ✅ Entity 層の書き方（例：UserEntity）

```typescript
// src/users/entities/user.entity.ts
import type { Gender, UserRole } from '@prisma/client';
import { UserName } from '../value-objects/user-name.vo';
import { UserEmail } from '../value-objects/user-email.vo';
import type { UserResponseDto } from '../dto/user-response.dto';

export class UserEntity {
  private constructor(private readonly props: UserProps) {}

  // ✅ OK: ファクトリメソッド（新規作成用）
  static createNew(params: {
    email: string;
    role: UserRole;
    firstName: string;
    lastName: string;
    gender: Gender | null;
    userId: string;
  }): UserEntity {
    return new UserEntity({
      email: UserEmail.create(params.email),
      role: params.role,
      name: UserName.create({
        firstName: params.firstName,
        lastName: params.lastName,
      }),
      gender: params.gender,
      createdBy: params.userId,
      updatedBy: params.userId,
    });
  }

  // ✅ OK: 再構築メソッド（DB から取得したデータ用）
  static reconstruct(props: UserProps): UserEntity {
    return new UserEntity(props);
  }

  // ✅ OK: 振る舞いメソッド
  changeEmail(email: string, userId: string): void {
    this.props.email = UserEmail.create(email);
    this.props.updatedBy = userId;
  }

  changeName(firstName: string, lastName: string, userId: string): void {
    this.props.name = UserName.create({ firstName, lastName });
    this.props.updatedBy = userId;
  }

  // ✅ OK: プリミティブへの変換（DTO 作成用）
  toPrimitives(): UserResponseDto {
    if (!this.props.id) {
      throw new Error('Entity is not persisted');
    }
    return {
      id: this.props.id,
      email: this.props.email.value,
      role: this.props.role,
      firstName: this.props.name.firstName,
      lastName: this.props.name.lastName,
      gender: this.props.gender,
      createdAt: this.props.createdAt!,
      createdBy: this.props.createdBy,
      updatedAt: this.props.updatedAt!,
      updatedBy: this.props.updatedBy,
      deletedAt: this.props.deletedAt ?? null,
      deletedBy: this.props.deletedBy ?? null,
    };
  }
}
```

#### ✅ Value Object 層の書き方（例：UserName）

```typescript
// src/users/value-objects/user-name.vo.ts
import { DomainError } from '../../common/errors/domain.error';
import { REQUIRED_FIELD } from '../../common/constants';

export class UserName {
  private constructor(
    public readonly firstName: string,
    public readonly lastName: string,
  ) {}

  static create(props: { firstName: string; lastName: string }): UserName {
    const trimmedFirst = props.firstName.trim();
    const trimmedLast = props.lastName.trim();

    if (!trimmedFirst || !trimmedLast) {
      throw new DomainError(REQUIRED_FIELD('姓・名'));
    }

    return new UserName(trimmedFirst, trimmedLast);
  }

  // ✅ OK: ロジックは VO に持たせる
  get fullName(): string {
    return `${this.lastName} ${this.firstName}`;
  }
}
```

---

### 4.2 DTO / バリデーションの書き方

#### ✅ DTO（Zod スキーマ）

```typescript
// src/users/dto/create-user-request.dto.ts
import { z } from 'zod';
import { VALIDATION_MESSAGES } from '../../common/constants/validation';
import { USER_ROLES, GENDERS } from '../../common/enums';

export const createUserRequestSchema = z.object({
  email: z.string().email(VALIDATION_MESSAGES.INVALID.EMAIL),
  role: z.enum(USER_ROLES, {
    errorMap: () => ({ message: VALIDATION_MESSAGES.REQUIRED.ROLE }),
  }),
  firstName: z.string().min(1, VALIDATION_MESSAGES.REQUIRED.FIRST_NAME),
  lastName: z.string().min(1, VALIDATION_MESSAGES.REQUIRED.LAST_NAME),
  gender: z.enum(GENDERS).nullable().optional(),
});

export type CreateUserRequestDto = z.infer<typeof createUserRequestSchema>;
```

#### ✅ Controller でのバリデーション

上記の Controller 例の通り、`ZodValidationPipe` にスキーマを渡して使います。

---

### 4.3 エラーハンドリングの書き方

#### ✅ カスタムエラーの定義

```typescript
// common/errors/not-found.error.ts
import { ApplicationError } from './application-error';

export class NotFoundError extends ApplicationError {
  constructor(resourceName: string, id: string) {
    super(`ユーザー（識別子: "${id}"）が見つかりません`, 'NOT_FOUND');
  }
}
```

#### ✅ Repository でのエラーハンドリング

```typescript
// src/users/infrastructure/users.repository.ts
import { handlePrismaError } from '../../common/utils/prisma-error-handler';

async update(user: UserEntity): Promise<UserEntity> {
  try {
    const data = PrismaUserMapper.toPrismaInput(user);
    const updated = await this.prisma.user.update({
      where: { id: user.id },
      data,
    });
    return PrismaUserMapper.toEntity(updated);
  } catch (error) {
    handlePrismaError(error, {
      resourceName: 'ユーザー',
      id: user.id!,
      duplicateMessage: 'このメールアドレスは既に登録されています',
    });
    throw error;
  }
}
```

#### ✅ グローバル例外フィルター

すべてのエラーは `GlobalExceptionFilter` で自動的に処理されます。

---

### 4.4 認証の書き方

#### ✅ `@CurrentUser()` デコレータの使用

```typescript
// src/users/users.controller.ts
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Post()
async create(
  @Body(new ZodValidationPipe(createUserRequestSchema))
  dto: CreateUserRequestDto,
  @CurrentUser() userId: string, // ✅ OK: 認証済みユーザーIDを取得
): Promise<UserResponseDto> {
  return this.createUserUseCase.execute({
    ...dto,
    userId, // Use Case に渡す
  });
}
```

---

## 5. 実装時のチェックリスト

### Controller 実装時

- [ ] `@Controller` デコレータを付けているか
- [ ] `ZodValidationPipe` で入力バリデーションしているか
- [ ] HTTP メソッドと URL がユースケースに合っているか
- [ ] `@CurrentUser()` デコレータを使用して認証済みユーザーIDを取得しているか

### Use Case 実装時

- [ ] `@Injectable` デコレータを付けているか
- [ ] Repository を経由してデータ操作しているか
- [ ] Entity の振る舞いメソッドを使用しているか
- [ ] エラーハンドリングとログ出力を行っているか

### Repository 実装時

- [ ] `IUsersRepository` インターフェースを実装しているか
- [ ] Mapper を使用して Entity ↔ Prisma 型の変換を行っているか
- [ ] Prisma のエラーをカスタムエラーに変換しているか

### Entity 実装時

- [ ] Value Object を使用してプリミティブを排除しているか
- [ ] ファクトリメソッド（`createNew`）と再構築メソッド（`reconstruct`）を用意しているか
- [ ] 振る舞いメソッドを用意しているか
- [ ] `toPrimitives()` メソッドを用意しているか

---

## 6. まとめ

- バックエンドは **Use Case パターンと DDD の概念を組み合わせたアーキテクチャ**です。
- `users` / `search-conditions` / `me` の 3 機能にフォーカスした構成です。
- 追加機能を作る場合も、`src/{feature}/{feature}.controller.ts` / `use-cases/` / `entities/` / `infrastructure/` という形で増やしていけば OK です。
