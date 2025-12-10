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

#### ステップ1: カスタムエラーを作ってみよう！

まず、**抽象クラス `ApplicationError`** を継承してカスタムエラーを作成します。

##### なぜ抽象クラスを使うのか？

グローバル例外フィルターで、**1つの分岐で全てのカスタムエラーを処理できる**ようにするためです。

```typescript
// ❌ NG: 各エラークラスごとに分岐が必要
if (error instanceof NotFoundError) {
  /* ... */
}
if (error instanceof BadRequestError) {
  /* ... */
}
if (error instanceof DomainError) {
  /* ... */
}
// 新しいエラーを追加するたびに分岐を増やす必要がある

// ✅ OK: 抽象クラスを使うと1つの分岐でOK
if (error instanceof ApplicationError) {
  // 全てのカスタムエラーを処理できる
}
```

##### ✅ ステップ1-1: 抽象クラス `ApplicationError` を作成

```typescript
// common/errors/application-error.ts
export abstract class ApplicationError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number = 500,
    public readonly errorCode?: string,
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  // 統一的なレスポンス形式を返すメソッド
  toResponse() {
    return {
      statusCode: this.statusCode,
      errorCode: this.errorCode ?? this.constructor.name,
      message: this.message,
    };
  }
}
```

**ポイント**:

- `abstract class` なので、直接インスタンス化できない
- `toResponse()` メソッドで統一的なレスポンス形式を返す
- 全てのカスタムエラーが同じ形式のレスポンスを返す

##### ✅ ステップ1-2: カスタムエラーを作成

```typescript
// common/errors/not-found.error.ts
import { ApplicationError } from './application-error';
import { getResourceNotFound } from '../constants';

export class NotFoundError extends ApplicationError {
  constructor(resource: string, identifier?: string | number) {
    const message = getResourceNotFound(resource, identifier);
    super(message, 404, 'NOT_FOUND');
  }
}

// common/errors/bad-request.error.ts
import { ApplicationError } from './application-error';

export class BadRequestError extends ApplicationError {
  constructor(message: string) {
    super(message, 400, 'BAD_REQUEST');
  }
}

// common/errors/domain.error.ts
import { ApplicationError } from './application-error';

export class DomainError extends ApplicationError {
  constructor(message: string) {
    super(message, 400, 'DOMAIN_ERROR');
  }
}
```

**ポイント**:

- `ApplicationError` を継承するだけで、統一的なエラーハンドリングが可能
- 新しいエラークラスを追加しても、グローバル例外フィルターの修正は不要

#### ステップ2: グローバル例外フィルターで分岐を減らそう！

グローバル例外フィルターでは、**抽象クラスを使うことで分岐を最小限に抑えています**。

##### ✅ ステップ2-1: グローバル例外フィルターの実装

```typescript
// common/filters/global-exception.filter.ts
@Catch()
@Injectable()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: CustomLoggerService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // ✅ 抽象クラスを使うことで、1つの分岐で全てのカスタムエラーを処理
    if (exception instanceof ApplicationError) {
      const body = exception.toResponse(); // 統一的なレスポンス形式
      this.logger.warn(
        `ApplicationError: ${body.message} (${body.errorCode})`,
        'GlobalExceptionFilter',
      );
      response.status(exception.statusCode).json({
        ...body,
        timestamp: getCurrentDate().toISOString(),
      });
      return;
    }

    // HttpException（BadRequestException等）の処理
    if (exception instanceof HttpException) {
      // ...
    }

    // その他の予期しないエラー
    // ...
  }
}
```

**ポイント**:

- `instanceof ApplicationError` の1つの分岐で、`NotFoundError`、`BadRequestError`、`DomainError` など全てのカスタムエラーを処理
- 各エラーは `toResponse()` メソッドで統一的な形式のレスポンスを返す
- 新しいエラークラスを追加しても、グローバル例外フィルターの修正は不要

#### ステップ3: Repository で Prisma エラーをカスタムエラーに変換しよう！

Prismaのエラーは、`handlePrismaError` ヘルパー関数を使用してカスタムエラーに変換します。

##### ✅ ステップ3-1: Repository でのエラーハンドリング

```typescript
// src/users/infrastructure/users.repository.ts
import { handlePrismaError } from '../../common/utils/prisma-error-handler';
import { CustomLoggerService } from '../../config/custom-logger.service';

@Injectable()
export class UsersRepository implements IUsersRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: CustomLoggerService,
  ) {}

  async update(user: UserEntity): Promise<UserEntity> {
    try {
      const data = PrismaUserMapper.toPrismaInput(user);
      const updated = await this.prisma.user.update({
        where: { id: user.id },
        data,
      });
      return PrismaUserMapper.toEntity(updated);
    } catch (error) {
      // ✅ ステップ1: エラーログを出力（traceIdが自動的に付与される）
      this.logger.error(error, undefined, 'UsersRepository');

      // ✅ ステップ2: Prismaエラーをカスタムエラーに変換
      handlePrismaError(error, {
        resourceName: 'ユーザー',
        id: user.id!,
        duplicateMessage: 'このメールアドレスは既に登録されています',
      });
      throw error; // この行には到達しない（handlePrismaErrorが必ずthrowする）
    }
  }
}
```

##### ✅ ステップ3-2: `handlePrismaError` の使い方

```typescript
// common/utils/prisma-error-handler.ts
export const handlePrismaError = (
  error: unknown,
  options: PrismaErrorHandlerOptions,
): never => {
  if (!(error instanceof PrismaClientKnownRequestError)) {
    throw error;
  }

  // P2025: 対象が見つからない → NotFoundError
  if (error.code === 'P2025') {
    throw new NotFoundError(
      options.notFoundResourceName || options.resourceName,
      options.id,
    );
  }

  // P2002: ユニーク制約違反 → BadRequestError
  if (error.code === 'P2002') {
    const message =
      options.duplicateMessage ||
      `${options.resourceName}は既に登録されています`;
    throw new BadRequestError(message);
  }

  // P2003: 外部キー制約違反
  if (error.code === 'P2003') {
    if (options.foreignKeyHandler) {
      return options.foreignKeyHandler(error);
    }
    throw new BadRequestError('関連するデータが見つかりません');
  }

  // その他のエラーはそのまま再スロー
  throw error;
};
```

**ポイント**:

- Prismaのエラーコード（P2025、P2002、P2003）をカスタムエラーに変換
- カスタムエラーは `ApplicationError` を継承しているので、グローバル例外フィルターで自動的に処理される

#### ステップ4: Use Case でエラーハンドリングしよう！

Use Case層では、Repository層で変換されたカスタムエラーをそのままスローします。

##### ✅ ステップ4-1: Use Case でのエラーハンドリング

```typescript
// src/users/use-cases/create-user.use-case.ts
@Injectable()
export class CreateUserUseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly logger: CustomLoggerService,
  ) {}

  async execute(params: CreateUserParams): Promise<UserResponseDto> {
    const entity = UserEntity.createNew({
      email: params.email,
      role: params.role,
      firstName: params.firstName,
      lastName: params.lastName,
      gender: params.gender,
      userId: params.userId,
    });

    try {
      const created = await this.usersRepository.create(entity);
      return created.toPrimitives();
    } catch (error) {
      // ✅ ステップ1: エラーログを出力（traceIdが自動的に付与される）
      this.logger.error(
        error instanceof Error ? error : new Error(String(error)),
        undefined,
        'CreateUserUseCase',
      );

      // ✅ ステップ2: Repository層でカスタムエラーに変換されているので、そのままスロー
      // ApplicationErrorの場合は、グローバル例外フィルターで自動的に処理される
      throw error;
    }
  }
}
```

**ポイント**:

- Repository層でカスタムエラーに変換されているので、Use Case層ではそのままスローするだけ
- `ApplicationError` の場合は、グローバル例外フィルターで自動的に処理される

---

### 4.4 ログとトレースID

#### ステップ1: トレースIDの仕組みを理解しよう！

このプロジェクトでは、**リクエストごとに一意のトレースIDを生成し、全てのログに自動的に付与**します。

##### ✅ ステップ1-1: トレースIDの生成と保存

```typescript
// common/interceptors/logging.interceptor.ts
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly traceService: TraceService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();

    // ✅ ステップ1: リクエストごとに一意のトレースIDを生成（ULID形式）
    const traceId = ulid();

    // ✅ ステップ2: CLS（Continuation Local Storage）に保存
    // これにより、同じリクエスト内の全ての処理で同じtraceIdにアクセス可能
    this.traceService.setTraceId(traceId);

    return next.handle().pipe(
      tap(() => {
        // リクエストログを出力
        // traceIdは自動的にログに含まれる
      }),
    );
  }
}
```

##### ✅ ステップ1-2: CLS（Continuation Local Storage）の使用

```typescript
// common/services/trace.service.ts
import { Injectable } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class TraceService {
  constructor(private readonly cls: ClsService) {}

  getTraceId(): string | undefined {
    return this.cls.get('traceId');
  }

  setTraceId(traceId: string): void {
    this.cls.set('traceId', traceId);
  }
}
```

**ポイント**:

- **CLS（Continuation Local Storage）**: 非同期処理のコンテキストを保持する仕組み
- 同じリクエスト内の全ての処理（Controller、Use Case、Repository）で同じ `traceId` にアクセス可能
- 明示的に `traceId` を渡す必要がない

#### ステップ2: ログに自動的にトレースIDを付与しよう！

`CustomLoggerService` を使用すると、**全てのログに自動的に `traceId` が付与されます**。

##### ✅ ステップ2-1: CustomLoggerService の実装

```typescript
// config/custom-logger.service.ts
@Injectable()
export class CustomLoggerService implements LoggerService {
  constructor(private readonly traceService: TraceService) {}

  private formatLog(
    level: string,
    message: string,
    context?: string,
    trace?: string,
  ): string {
    const timestamp = getCurrentDate().toISOString();

    // ✅ CLSから自動的にtraceIdを取得
    const traceId = this.traceService.getTraceId() ?? 'no-trace';

    const log = {
      traceId, // 自動的に付与される
      timestamp,
      level,
      ...(context && { context }),
      message,
      ...(trace && { trace }),
    };

    return JSON.stringify(log);
  }

  log(message: string, context?: string) {
    console.log(this.formatLog('LOG', message, context));
  }

  error(message: string | Error, trace?: string, context?: string) {
    // Errorオブジェクトの場合は、スタックトレースも含める
    let outputMessage = '';
    let outputTrace = trace;

    if (message instanceof Error) {
      outputMessage = message.message;
      if (!outputTrace) {
        outputTrace = message.stack;
      }
    } else {
      outputMessage = message;
    }

    console.error(this.formatLog('ERROR', outputMessage, context, outputTrace));
  }

  warn(message: string, context?: string) {
    console.warn(this.formatLog('WARN', message, context));
  }
}
```

##### ✅ ステップ2-2: ログの出力例

```json
{
  "traceId": "01KAYWZQY4BDMP31RCX6GRWV7D",
  "timestamp": "2025-12-10T10:12:53.976Z",
  "level": "ERROR",
  "context": "CreateUserUseCase",
  "message": "このメールアドレスは既に登録されています",
  "trace": "Error: このメールアドレスは既に登録されています\n    at ..."
}
```

**ポイント**:

- `CustomLoggerService` を使用するだけで、全てのログに `traceId` が自動的に付与される
- 明示的に `traceId` を渡す必要はない

#### ステップ3: ログを出力しよう！

##### ✅ ステップ3-1: Use Case でのログ出力

```typescript
// src/users/use-cases/create-user.use-case.ts
@Injectable()
export class CreateUserUseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly logger: CustomLoggerService, // ✅ DIで注入
  ) {}

  async execute(params: CreateUserParams): Promise<UserResponseDto> {
    try {
      const created = await this.usersRepository.create(entity);

      // ✅ 成功時のログ（traceIdが自動的に付与される）
      this.logger.log('ユーザーを作成しました', 'CreateUserUseCase');

      return created.toPrimitives();
    } catch (error) {
      // ✅ エラーログ（traceIdが自動的に付与される）
      this.logger.error(
        error instanceof Error ? error : new Error(String(error)),
        undefined, // traceはErrorオブジェクトから自動取得
        'CreateUserUseCase',
      );
      throw error;
    }
  }
}
```

##### ✅ ステップ3-2: Repository でのログ出力

```typescript
// src/users/infrastructure/users.repository.ts
@Injectable()
export class UsersRepository implements IUsersRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: CustomLoggerService, // ✅ DIで注入
  ) {}

  async create(user: UserEntity): Promise<UserEntity> {
    try {
      const created = await this.prisma.user.create({ data });
      return PrismaUserMapper.toEntity(created);
    } catch (error) {
      // ✅ エラーログ（traceIdが自動的に付与される）
      this.logger.error(error, undefined, 'UsersRepository');
      handlePrismaError(error, {
        /* ... */
      });
      throw error;
    }
  }
}
```

**ポイント**:

- `CustomLoggerService` をDIで注入するだけで、全てのログに `traceId` が自動的に付与される
- 明示的に `traceId` を渡す必要はない
- 同じリクエスト内の全てのログが同じ `traceId` を持つため、1つのリクエストの処理を追跡できる

---

### 4.5 認証の書き方

#### `@CurrentUser()` デコレータでユーザーIDを簡単に取得！

毎回リクエストからユーザーIDを取得するのは面倒ですよね？このプロジェクトでは、**`@CurrentUser()` デコレータ**を使うことで、認証済みユーザーIDを簡単に取得できます。

##### ✅ `@CurrentUser()` デコレータの使い方

```typescript
// src/users/users.controller.ts
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly createUserUseCase: CreateUserUseCase) {}

  @Post()
  async create(
    @Body(new ZodValidationPipe(createUserRequestSchema))
    dto: CreateUserRequestDto,
    @CurrentUser() userId: string, // ✅ これだけで認証済みユーザーIDを取得！
  ): Promise<UserResponseDto> {
    return this.createUserUseCase.execute({
      ...dto,
      userId, // Use Case に渡す
    });
  }
}
```

**ポイント**:

- `@CurrentUser()` デコレータをパラメータに付けるだけで、認証済みユーザーIDを取得できる
- 認証ミドルウェア（`AuthMiddleware`）で設定されたユーザーIDを自動的に取得
- リクエストヘッダーから手動で取得する必要がない

##### ✅ `@CurrentUser()` デコレータの実装

```typescript
// common/decorators/current-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import { SYSTEM_USER_ID } from '../constants/system';

type RequestWithUser = Request & {
  user?: {
    id: string;
  };
};

/**
 * 現在のログインユーザーIDを取得するデコレータ
 * 認証ミドルウェアで設定されたユーザーIDを取得します
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    // 認証ミドルウェアで設定されたユーザーIDを取得
    const userId =
      request.user?.id || request.headers['x-user-id'] || SYSTEM_USER_ID;
    return userId as string;
  },
);
```

**ポイント**:

- NestJSの `createParamDecorator` を使用してカスタムデコレータを作成
- 認証ミドルウェア（`AuthMiddleware`）で設定された `request.user.id` を取得
- デフォルト値として `SYSTEM_USER_ID` を使用（開発環境用）

##### ✅ 複数のエンドポイントで使用する例

```typescript
// src/users/users.controller.ts
@Controller('users')
export class UsersController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly deleteUserUseCase: DeleteUserUseCase,
  ) {}

  @Post()
  async create(
    @Body(new ZodValidationPipe(createUserRequestSchema))
    dto: CreateUserRequestDto,
    @CurrentUser() userId: string, // ✅ 作成者IDを取得
  ): Promise<UserResponseDto> {
    return this.createUserUseCase.execute({
      ...dto,
      userId,
    });
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateUserRequestSchema))
    dto: UpdateUserRequestDto,
    @CurrentUser() userId: string, // ✅ 更新者IDを取得
  ): Promise<UserResponseDto> {
    return this.updateUserUseCase.execute({
      id,
      ...dto,
      userId,
    });
  }

  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @CurrentUser() userId: string, // ✅ 削除者IDを取得
  ): Promise<void> {
    return this.deleteUserUseCase.execute({
      id,
      userId,
    });
  }
}
```

**ポイント**:

- 各エンドポイントで `@CurrentUser()` デコレータを使うだけで、ユーザーIDを取得できる
- `createdBy`、`updatedBy`、`deletedBy` などのフィールドに自動的に設定できる

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
