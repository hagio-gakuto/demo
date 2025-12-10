# フロントエンド構築ガイドライン

このドキュメントでは、フロントエンドアプリケーションを0から構築する手順を解説付きで説明します。

## 前提条件

- Node.js 22.x がインストールされていること
- npm がインストールされていること

## 1. プロジェクトの初期化

### 1.1 Next.js プロジェクトの作成

```bash
npx create-next-app@latest frontend --typescript --tailwind --app --no-src-dir=false
cd frontend
```

**解説**: Next.js CLI を使用してプロジェクトを初期化します。`--typescript` でTypeScript、`--tailwind` でTailwind CSS、`--app` でApp Router、`--no-src-dir=false` で`src/`ディレクトリを使用します。

**なぜNext.jsを選ぶか**: Next.jsはReactベースのフレームワークで、SSR（サーバーサイドレンダリング）、ルーティング、画像最適化などの機能を提供します。App Routerにより、最新のReact機能を活用した開発が可能です。

**なぜApp Routerを使うか**: App RouterはNext.js 13以降の新しいルーティングシステムで、Server Components、ストリーミング、レイアウトなどの機能を提供します。これにより、パフォーマンスと開発体験が向上します。

**なぜsrc/ディレクトリを使うか**: `src/`ディレクトリにコードを配置することで、プロジェクトルートを整理し、設定ファイルとソースコードを明確に分離できます。

**意図**: モダンなReact開発環境を構築し、パフォーマンスと開発効率を最適化する。

### 1.2 必要なパッケージのインストール

```bash
npm install react-hook-form react-hot-toast swr
npm install zod exceljs
npm install @hookform/resolvers

npm install --save-dev @tailwindcss/postcss tailwindcss
npm install --save-dev eslint-config-next
```

**解説**:

- `react-hook-form`: フォーム管理ライブラリ
- `react-hot-toast`: トースト通知ライブラリ
- `swr`: データ取得とキャッシュ管理
- `zod`: バリデーション（バックエンドとの型共有）
- `exceljs`: Excel ファイル処理
- `@tailwindcss/postcss`: Tailwind CSS v4 のPostCSSプラグイン

**なぜこれらのパッケージを選ぶか**:

- **react-hook-form**: パフォーマンスが高く、再レンダリングを最小限に抑えます。バリデーションとエラーハンドリングが統合されており、開発効率が高い。
- **react-hot-toast**: 軽量で使いやすいトースト通知ライブラリ。ユーザーへのフィードバックを簡単に提供できる。
- **swr**: データフェッチングとキャッシュ管理を自動化し、リアルタイムなデータ更新を実現。バックエンドの変更を自動的に検知し、UIを更新する。
- **zod**: バックエンドと同じバリデーションスキーマを使用することで、型の一貫性を保てる。ランタイムバリデーションも可能。
- **Tailwind CSS v4**: ユーティリティファーストのCSSフレームワーク。カスタムCSSを書く必要が少なく、一貫性のあるデザインを実現できる。

**意図**: 開発効率とパフォーマンスを重視し、保守性の高いコードを書けるツールを選定する。

## 2. ディレクトリ構造の作成

以下のディレクトリ構造を作成します：

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── error.tsx
│   ├── not-found.tsx
│   ├── admin/
│   ├── mypage/
│   └── unauthorized/
├── components/
│   ├── layout/
│   ├── ui/
│   ├── form/
│   ├── features/
│   └── providers/
├── features/
│   ├── dashboard/
│   ├── user-management/
│   └── mypage/
├── contexts/
├── hooks/
├── libs/
├── types/
└── constants/
```

**解説**:

- `app/`: Next.js App Routerのルーティング定義
- `components/`: 共通コンポーネント
- `features/`: 機能ごとのドメインロジック
- `contexts/`: React Context
- `hooks/`: グローバルフック
- `libs/`: ライブラリ設定
- `types/`: 型定義
- `constants/`: 定数

**なぜこの構造にするか**:

- **Feature-based Architecture**: 機能ごとにコードを完全に分離することで、機能間の依存関係を最小限に抑え、変更の影響範囲を明確にします。チーム開発時にコンフリクトが発生しにくくなります。
- **app/とfeatures/の分離**: `app/`はルーティングのみを担当し、ビジネスロジックは`features/`に配置します。これにより、ルーティングと機能の責務が明確になります。
- **共通コンポーネントの分離**: 全画面で使用されるコンポーネントを`components/`に配置することで、再利用性を高めます。

**意図**: スケーラブルで保守性の高いコード構造を構築し、機能追加や変更が容易な設計にする。

## 3. Tailwind CSS の設定

### 3.1 PostCSS の設定

`postcss.config.mjs`:

```javascript
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};

export default config;
```

**解説**: Tailwind CSS v4 では、PostCSSプラグインを使用します。

**なぜTailwind CSS v4を使うか**: Tailwind CSS v4は、設定ファイル不要で、CSS変数ベースのテーマシステムを提供します。これにより、設定が簡素化され、カスタマイズが容易になります。

**なぜPostCSSプラグインを使うか**: PostCSSプラグインとして統合することで、Next.jsのビルドプロセスに自然に組み込まれます。JIT（Just-In-Time）コンパイルにより、使用したクラスのみがCSSに含まれ、パフォーマンスが向上します。

**意図**: 効率的なスタイリングシステムを構築し、開発効率とパフォーマンスを最適化する。

### 3.2 グローバルスタイルの設定

`src/app/globals.css`:

```css
@import 'tailwindcss';
```

**解説**: Tailwind CSS v4 では、`@import "tailwindcss"` でインポートします。

## 4. TypeScript の設定

### 4.1 tsconfig.json の設定

`tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

**解説**:

- `paths`: `@/` エイリアスを設定し、相対パスを避けます
- `strict`: 厳密な型チェックを有効化

**なぜパスエイリアスを使うか**: `@/`エイリアスを使用することで、相対パス（`../../../components/ui`）を避けられ、インポートパスが読みやすくなります。また、ファイルを移動した際のインポート修正が容易になります。

**なぜstrictモードを有効化するか**: TypeScriptのstrictモードを有効化することで、型安全性が向上し、潜在的なバグを早期に発見できます。開発初期から型の整合性を保つことで、リファクタリングが容易になります。

**意図**: 型安全性を最大化し、開発効率とコード品質を向上させる。

## 5. まずはシンプルにAPIを呼び出してみよう

### 5.1 普通のfetchでAPIを呼び出してみる

まずは、普通の`fetch`を使ってAPIを呼び出してみましょう。

`src/app/page.tsx`:

```typescript
'use client';

import { useEffect, useState } from 'react';

type User = {
  id: string;
  name: string;
  email: string;
};

export default function Home() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://localhost:3001/users');
        const data = await response.json();
        setUsers(data.users);
      } catch (error) {
        console.error('エラー:', error);
      } finally {
        setIsLoading(false);
      }
    };
    void fetchUsers();
  }, []);

  if (isLoading) {
    return <div>読み込み中...</div>;
  }

  return (
    <div>
      <h1>ユーザー一覧</h1>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            {user.name} ({user.email})
          </li>
        ))}
      </ul>
    </div>
  );
}
```

**やってみよう**: このコードを実行して、ユーザー一覧が表示されることを確認しましょう！

**解説**:

- `useState`でユーザーリストとローディング状態を管理
- `useEffect`でコンポーネントがマウントされたときにAPIを呼び出す
- `fetch`でAPIを呼び出し、レスポンスをJSONに変換

### 5.2 複数箇所で同じようなコードを書いてみる

次に、ユーザー作成の機能も追加してみましょう。

`src/app/create-user/page.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateUser() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3001/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email }),
      });
      const data = await response.json();
      console.log('作成成功:', data);
      router.push('/');
    } catch (error) {
      console.error('エラー:', error);
    }
  };

  return (
    <div>
      <h1>ユーザー作成</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>
            名前:
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
        </div>
        <div>
          <label>
            メール:
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
        </div>
        <button type="submit">作成</button>
      </form>
    </div>
  );
}
```

**気づいたこと**:

- `fetch`のコードが複数箇所に書かれている
- エラーハンドリングが毎回同じ
- URLが`http://localhost:3001`でハードコーディングされている

### 5.3 共通化してみよう！

同じようなコードが複数箇所にあることに気づいたので、共通化してみましょう！

`src/libs/api-client.ts`:

```typescript
const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

export const apiClient = async <T>(
  endpoint: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: unknown;
  } = {},
): Promise<T> => {
  const url = `${baseUrl}${endpoint}`;
  const response = await fetch(url, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json() as Promise<T>;
};
```

**使い方**:

```typescript
// GETリクエスト
const users = await apiClient<User[]>('/users');

// POSTリクエスト
const newUser = await apiClient<User>('/users', {
  method: 'POST',
  body: { name, email },
});
```

**良かったこと**:

- URLが1箇所で管理できるようになった
- エラーハンドリングが統一された
- コードが短くなった

**さらに改善**: エラーメッセージをより詳しく表示したい場合は、カスタムエラークラスを作成しましょう。

`src/libs/api-client.ts`（改善版）:

```typescript
export class ApiClientError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

export const apiClient = async <T>(
  endpoint: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: unknown;
  } = {},
): Promise<T> => {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
  const url = `${baseUrl}${endpoint}`;
  const response = await fetch(url, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiClientError(
      errorData.message || `HTTP error! status: ${response.status}`,
      response.status,
    );
  }

  return response.json() as Promise<T>;
};
```

**意図**: まずはシンプルに実装し、共通化が必要になったら共通化する。段階的に改善していく。

## 6. フォームを作ってみよう

### 6.1 普通のHTMLフォームを作ってみる

まずは、普通のHTMLフォームを作ってみましょう。

`src/app/create-user/page.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/libs/api-client';

export default function CreateUser() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await apiClient('/users', {
        method: 'POST',
        body: { name, email },
      });
      router.push('/');
    } catch (err) {
      setError('ユーザーの作成に失敗しました');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">ユーザー作成</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">
            名前:
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </label>
        </div>
        <div>
          <label className="block mb-1">
            メール:
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </label>
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          作成
        </button>
      </form>
    </div>
  );
}
```

**やってみよう**: このフォームでユーザーを作成してみましょう！

**解説**:

- `useState`でフォームの値を管理
- `onChange`で入力値を更新
- `onSubmit`でフォーム送信時にAPIを呼び出す

### 6.2 複数のフォームを作ってみる

次に、ユーザー編集のフォームも作ってみましょう。

`src/app/edit-user/[id]/page.tsx`:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { apiClient } from '@/libs/api-client';

export default function EditUser() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await apiClient<{ name: string; email: string }>(
          `/users/${userId}`,
        );
        setName(user.name);
        setEmail(user.email);
      } catch (err) {
        setError('ユーザーの取得に失敗しました');
      }
    };
    void fetchUser();
  }, [userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await apiClient(`/users/${userId}`, {
        method: 'PUT',
        body: { name, email },
      });
      router.push('/');
    } catch (err) {
      setError('ユーザーの更新に失敗しました');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">ユーザー編集</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">
            名前:
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </label>
        </div>
        <div>
          <label className="block mb-1">
            メール:
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </label>
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          更新
        </button>
      </form>
    </div>
  );
}
```

**気づいたこと**:

- フォームのコードが似ている
- バリデーション（必須チェックなど）が毎回同じ
- エラーメッセージの表示方法が同じ

### 6.3 React Hook Formを使ってみよう

同じようなコードが複数箇所にあるので、React Hook Formを使って共通化してみましょう！

まずは、React Hook Formをインストールします：

```bash
npm install react-hook-form
```

次に、フォームを書き直してみましょう：

`src/app/create-user/page.tsx`（改善版）:

```typescript
'use client';

import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/libs/api-client';

type FormData = {
  name: string;
  email: string;
};

export default function CreateUser() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    try {
      await apiClient('/users', {
        method: 'POST',
        body: data,
      });
      router.push('/');
    } catch (err) {
      console.error('エラー:', err);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">ユーザー作成</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block mb-1">
            名前:
            <input
              type="text"
              {...register('name', { required: '名前は必須です' })}
              className="w-full px-3 py-2 border rounded"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </label>
        </div>
        <div>
          <label className="block mb-1">
            メール:
            <input
              type="email"
              {...register('email', {
                required: 'メールは必須です',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'メールアドレスの形式が正しくありません',
                },
              })}
              className="w-full px-3 py-2 border rounded"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
            )}
          </label>
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          作成
        </button>
      </form>
    </div>
  );
}
```

**良かったこと**:

- バリデーションが簡単になった
- エラーメッセージの表示が統一された
- コードが短くなった

### 6.4 さらに共通化してみよう！

フォームフィールドのコードが似ているので、共通コンポーネントを作ってみましょう！

`src/components/form/TextField.tsx`:

```typescript
import { useId } from 'react';
import {
  Controller,
  type Control,
  type FieldValues,
  type FieldPath,
  type RegisterOptions,
} from 'react-hook-form';

type TextFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  label?: string;
  rules?: RegisterOptions<T>;
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'date';
};

export const TextField = <T extends FieldValues>({
  control,
  name,
  label,
  rules,
  placeholder,
  type = 'text',
}: TextFieldProps<T>) => {
  const id = useId();

  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field, fieldState: { error } }) => {
        const errorMessage =
          typeof error?.message === 'string' ? error.message : undefined;

        return (
          <div className="flex flex-col gap-1">
            {label && (
              <label htmlFor={id} className="font-medium text-sm">
                {label}
              </label>
            )}
            <input
              id={id}
              type={type}
              {...field}
              value={field.value ?? ''}
              placeholder={placeholder}
              className="w-full px-3 py-2 border rounded"
            />
            {errorMessage && (
              <p className="text-red-500 text-xs">{errorMessage}</p>
            )}
          </div>
        );
      }}
    />
  );
};
```

**使い方**:

```typescript
const { control } = useForm<FormData>();

<TextField
  control={control}
  name="name"
  label="名前"
  rules={{ required: '名前は必須です' }}
/>
```

**良かったこと**:

- フォームフィールドのコードが短くなった
- バリデーションとエラー表示が統一された
- ラベルと入力欄が自動的に紐づけられた（アクセシビリティ向上）

**意図**: まずはシンプルに実装し、共通化が必要になったら共通化する。段階的に改善していく。

## 7. ボタンも共通化してみよう

### 7.1 普通のbuttonタグを使う

まずは、普通の`button`タグを使ってみましょう。

```typescript
<button
  type="submit"
  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
>
  作成
</button>
```

### 7.2 複数箇所で同じスタイルを使っていることに気づく

フォームの「作成」ボタンと「更新」ボタン、削除確認の「キャンセル」ボタンなど、複数箇所で同じようなスタイルのボタンを使っていることに気づきます。

```typescript
// 作成ボタン
<button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
  作成
</button>

// 更新ボタン
<button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
  更新
</button>

// キャンセルボタン
<button className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">
  キャンセル
</button>
```

**気づいたこと**:

- 同じスタイルのボタンが複数箇所にある
- 色だけが違う（青、グレー、赤など）

### 7.3 共通化してみよう！

同じようなコードが複数箇所にあるので、共通コンポーネントを作ってみましょう！

`src/components/ui/Button.tsx`:

```typescript
type ButtonProps = {
  variant?: 'primary' | 'secondary' | 'danger';
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
};

export const Button = ({
  variant = 'primary',
  children,
  onClick,
  type = 'button',
  disabled = false,
}: ButtonProps) => {
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 rounded ${variantClasses[variant]} ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      {children}
    </button>
  );
};
```

**使い方**:

```typescript
import { Button } from '@/components/ui';

<Button variant="primary" type="submit">作成</Button>
<Button variant="secondary" onClick={handleCancel}>キャンセル</Button>
<Button variant="danger" onClick={handleDelete}>削除</Button>
```

**良かったこと**:

- ボタンのスタイルが統一された
- コードが短くなった
- 色を変えたいときは`variant`を変えるだけ

**意図**: まずはシンプルに実装し、共通化が必要になったら共通化する。段階的に改善していく。

## 8. ユーザー情報を複数のコンポーネントで使いたい

### 8.1 まずは普通のuseStateで管理してみる

まずは、1つのコンポーネントでユーザー情報を管理してみましょう。

`src/app/mypage/page.tsx`:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/libs/api-client';

type User = {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
};

export default function MyPage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const me = await apiClient<User>('/me');
        setUser(me);
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    void fetchUser();
  }, []);

  if (isLoading) {
    return <div>読み込み中...</div>;
  }

  return (
    <div>
      <h1>マイページ</h1>
      <p>名前: {user?.name}</p>
      <p>メール: {user?.email}</p>
    </div>
  );
}
```

**やってみよう**: このコードでマイページを表示してみましょう！

### 8.2 他のコンポーネントでもユーザー情報が必要になった

次に、ヘッダーコンポーネントでもユーザー情報を表示したいとします。

`src/components/layout/Header.tsx`:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/libs/api-client';

type User = {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
};

export const Header = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const me = await apiClient<User>('/me');
        setUser(me);
      } catch {
        setUser(null);
      }
    };
    void fetchUser();
  }, []);

  return (
    <header>
      <div>ロゴ</div>
      {user && <div>こんにちは、{user.name}さん</div>}
    </header>
  );
};
```

**気づいたこと**:

- 同じAPI（`/me`）を複数のコンポーネントで呼び出している
- 同じ状態（`user`）を複数のコンポーネントで管理している
- 無駄なAPI呼び出しが発生している

### 8.3 Contextを使って共通化してみよう！

同じ状態を複数のコンポーネントで使う必要があるので、Contextを使って共通化してみましょう！

`src/contexts/UserContext.tsx`:

```typescript
'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '@/libs/api-client';

type User = {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
};

type UserContextType = {
  user: User | null;
  isLoading: boolean;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const me = await apiClient<User>('/me');
        setUser(me);
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    void fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, isLoading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
```

**使い方**:

```typescript
// ヘッダーコンポーネント
import { useUser } from '@/contexts/UserContext';

export const Header = () => {
  const { user } = useUser();
  return <div>こんにちは、{user?.name}さん</div>;
};

// マイページコンポーネント
import { useUser } from '@/contexts/UserContext';

export default function MyPage() {
  const { user, isLoading } = useUser();
  if (isLoading) return <div>読み込み中...</div>;
  return <div>名前: {user?.name}</div>;
}
```

**良かったこと**:

- API呼び出しが1回だけになった
- ユーザー情報が1箇所で管理されるようになった
- どのコンポーネントからでも`useUser()`でユーザー情報にアクセスできる

**意図**: まずはシンプルに実装し、共通化が必要になったら共通化する。段階的に改善していく。

## 9. 認証フックの実装

### 9.1 useAuth フック

`src/hooks/useAuth.ts`:

```typescript
import { useCallback, useMemo } from 'react';
import { useUser } from '@/contexts/UserContext';
import type { UserRole } from '@/types/user';

const roleHierarchy: Record<UserRole, number> = {
  user: 1,
  admin: 2,
};

export const useAuth = () => {
  const { user } = useUser();

  const hasRole = useCallback(
    (requiredRole: UserRole): boolean => {
      if (!user) return false;
      return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
    },
    [user],
  );

  const isAdmin = useCallback((): boolean => hasRole('admin'), [hasRole]);
  const isUser = useCallback((): boolean => hasRole('user'), [hasRole]);

  return useMemo(
    () => ({
      user,
      hasRole,
      isAdmin,
      isUser,
    }),
    [user, hasRole, isAdmin, isUser],
  );
};
```

**解説**: 権限チェックを行うカスタムフックを実装します。

**なぜカスタムフックを作るか**: 権限チェックのロジックをフックに集約することで、コンポーネントからロジックを分離できます。これにより、コンポーネントがシンプルになり、権限チェックロジックの再利用が容易になります。

**なぜ階層構造を使うか**: 権限を階層構造（user < admin）で管理することで、上位権限は下位権限の機能も利用できるようになります。これにより、権限チェックのロジックが簡潔になります。

**なぜuseMemoとuseCallbackを使うか**: メモ化により、不要な再計算と再レンダリングを防ぎます。これにより、パフォーマンスが向上します。

**意図**: 権限チェックロジックを再利用可能にし、パフォーマンスと保守性を向上させる。

## 10. ルートレイアウトの実装

### 10.1 layout.tsx の設定

`src/app/layout.tsx`:

```typescript
import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/providers/Providers';

export const metadata: Metadata = {
  title: 'Sample App',
  description: 'Sample App',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased flex flex-col min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

**解説**: ルートレイアウトでProvidersを設定し、グローバルな状態管理を有効化します。

**なぜルートレイアウトで設定するか**: ルートレイアウトでProvidersを設定することで、アプリケーション全体でContextが利用可能になります。これにより、どのページでもユーザー情報やパンくずリストにアクセスできます。

**なぜServer Componentを使うか**: ルートレイアウトはServer Componentとして実装することで、初期レンダリング時のパフォーマンスが向上します。メタデータの設定もServer Componentで行うことが推奨されます。

**意図**: アプリケーション全体で一貫した状態管理とレイアウトを提供する。

### 10.2 Providers の実装

`src/components/providers/Providers.tsx`:

```typescript
'use client';

import { Toaster } from 'react-hot-toast';
import { UserProvider } from '@/contexts/UserContext';
import { BreadcrumbProvider } from '@/contexts/BreadcrumbContext';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

type ProvidersProps = {
  children: React.ReactNode;
};

export const Providers = ({ children }: ProvidersProps) => {
  return (
    <UserProvider>
      <BreadcrumbProvider>
        <Toaster position="top-right" />
        <Header />
        <main className="flex-1 min-h-0 flex flex-col">{children}</main>
        <Footer />
      </BreadcrumbProvider>
    </UserProvider>
  );
};
```

**解説**: すべてのProviderを統合し、レイアウトコンポーネントも含めます。

**なぜProviderを統合するか**: 複数のProviderを1つのコンポーネントにまとめることで、ルートレイアウトが簡潔になります。また、Providerの順序を管理しやすくなります。

**なぜClient Componentにするか**: ContextやuseEffectを使用するため、`'use client'`ディレクティブが必要です。Server ComponentとClient Componentを適切に使い分けることで、パフォーマンスと機能性のバランスを取ります。

**意図**: Providerの管理を簡素化し、アプリケーション全体の状態管理を統合する。

## 11. データ取得を改善してみよう

### 11.1 まずは普通のuseStateとuseEffectでデータ取得してみる

まずは、普通の`useState`と`useEffect`でデータを取得してみましょう。

`src/features/user-management/hooks/useUserList.ts`:

```typescript
import { useSearchParams } from 'next/navigation';
import { apiClient } from '@/libs/api-client';
import { useEffect, useState } from 'react';
import type { UserResponseDto } from '@/types/user';

export const useUserList = () => {
  const searchParams = useSearchParams();
  const [users, setUsers] = useState<UserResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const search = searchParams.get('search') || '';
        const queryString = new URLSearchParams({ search }).toString();
        const data = await apiClient<{ users: UserResponseDto[] }>(
          `/users?${queryString}`,
        );
        setUsers(data.users);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error('エラーが発生しました'),
        );
      } finally {
        setIsLoading(false);
      }
    };
    void fetchUsers();
  }, [searchParams]);

  return { users, isLoading, error };
};
```

**やってみよう**: このコードでユーザー一覧を取得してみましょう！

### 11.2 複数のコンポーネントで同じようなコードを書いていることに気づく

複数のコンポーネントで同じようなデータ取得コードを書いていることに気づきます。

```typescript
// useUserList
const [users, setUsers] = useState([]);
const [isLoading, setIsLoading] = useState(true);
useEffect(() => {
  /* データ取得 */
}, [searchParams]);

// useCompanyList
const [companies, setCompanies] = useState([]);
const [isLoading, setIsLoading] = useState(true);
useEffect(() => {
  /* データ取得 */
}, [searchParams]);
```

**気づいたこと**:

- 同じようなローディング状態管理が複数箇所にある
- キャッシュ機能がない（同じデータを何度も取得してしまう）
- エラーハンドリングが毎回同じ

### 11.3 SWRを使って共通化してみよう！

同じようなデータ取得コードが複数箇所にあるので、SWRを使って共通化してみましょう！

まずは、SWRクライアントを設定します：

`src/libs/swr-client.ts`:

```typescript
import useSWR from 'swr';
import { apiClient } from './api-client';

export const useSWRData = <T>(key: string | null) => {
  return useSWR<T>(
    key,
    async (url: string) => {
      return apiClient<T>(url);
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    },
  );
};
```

**使い方**:

```typescript
import { useSearchParams } from 'next/navigation';
import { useSWRData } from '@/libs/swr-client';
import type { UserResponseDto } from '@/types/user';

export const useUserList = () => {
  const searchParams = useSearchParams();
  const search = searchParams.get('search') || '';
  const queryString = new URLSearchParams({ search }).toString();
  const key = `/users?${queryString}`;

  const { data, isLoading, error } = useSWRData<{ users: UserResponseDto[] }>(
    key,
  );

  return {
    users: data?.users || [],
    isLoading,
    error,
  };
};
```

**良かったこと**:

- ローディング状態管理が自動化された
- キャッシュ機能が自動的に有効になった（同じデータを再取得しない）
- エラーハンドリングが統一された
- コードが短くなった

**さらに改善**: 複数の画面で同じデータを使う場合、SWRのキャッシュにより自動的にデータが共有されます。

**意図**: まずはシンプルに実装し、共通化が必要になったら共通化する。段階的に改善していく。

### 11.2 コンポーネントの実装

`src/features/user-management/components/list/UserManagement.tsx`:

```typescript
'use client';

import { useRouter } from 'next/navigation';
import { useUserList } from '../../hooks/useUserList';
import { UserSearchForm } from './UserSearchForm';
import { Table } from '@/components/ui';

export const UserManagement = () => {
  const router = useRouter();
  const { users, isLoading } = useUserList();

  const handleSearch = (data: SearchFormData) => {
    router.push(`/admin/user-management?search=${data.search}`);
  };

  const handleReset = () => {
    router.push('/admin/user-management');
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div>
      <UserSearchForm onSearch={handleSearch} onReset={handleReset} />
      <Table
        columns={[
          { key: 'name', label: '名前' },
          { key: 'email', label: 'メール' },
        ]}
        data={users}
      />
    </div>
  );
};
```

**解説**: 表示ロジックのみを担当するコンポーネントを実装します。ロジックはカスタムフックに委譲します。

**なぜロジックを分離するか**: コンポーネントからロジックを分離することで、コンポーネントがシンプルになり、可読性が向上します。また、ロジックの再利用が容易になり、テストも書きやすくなります。

**なぜrouter.pushでURLを更新するか**: 直接APIを呼び出すのではなく、URLを更新することで、URLパラメータの変更が検知され、自動的にデータが再取得されます。これにより、状態管理が簡潔になります。

**意図**: ロジックと表示を分離し、保守性とテスト容易性を向上させる。

## 12. 権限チェックの実装

### 12.1 layout での権限チェック

`src/app/admin/layout.tsx`:

```typescript
import { redirect } from 'next/navigation';
import { apiClient } from '@/libs/api-client';

type MeResponse = {
  id: string;
  role: 'user' | 'admin';
};

export default async function AdminLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  try {
    const me = await apiClient<MeResponse>('/me');
    if (me.role !== 'admin') {
      redirect('/unauthorized');
    }
  } catch {
    redirect('/unauthorized');
  }

  return <>{children}</>;
}
```

**解説**: Server Componentで権限チェックを行い、権限がない場合はリダイレクトします。

**なぜServer Componentで権限チェックするか**: Server Componentで権限チェックを行うことで、権限がないユーザーはクライアント側のJavaScriptが実行される前にリダイレクトされます。これにより、セキュリティが向上し、パフォーマンスも向上します。

**なぜlayoutで実装するか**: layoutで権限チェックを行うことで、その配下のすべてのページに権限チェックが適用されます。これにより、各ページで個別に権限チェックを行う必要がなくなります。

**意図**: セキュリティを強化し、権限チェックの実装を簡素化する。

## 13. 環境変数の設定

`.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

**解説**: バックエンドAPIのベースURLを設定します。`NEXT_PUBLIC_` プレフィックスが必要です。

**なぜ環境変数を使うか**: 環境ごと（開発、ステージング、本番）に異なるAPI URLを簡単に切り替えられます。コードに直接URLを書くと、環境ごとにビルドが必要になり、柔軟性が失われます。

**なぜNEXT*PUBLIC*プレフィックスが必要か**: Next.jsでは、クライアント側で使用する環境変数には`NEXT_PUBLIC_`プレフィックスが必要です。これにより、サーバー側とクライアント側で使用する環境変数を明確に区別できます。

**意図**: 環境に依存しない設定管理を行い、デプロイ時の柔軟性を確保する。

## 14. 開発サーバーの起動

```bash
npm run dev
```

**解説**: 開発モードでサーバーを起動します。`http://localhost:3000` でアクセスできます。

## まとめ

このガイドラインに従って、フロントエンドアプリケーションを0から構築できます。各ステップで実装する内容とその理由を理解することで、プロジェクトの構造を把握しやすくなります。

詳細な実装パターンについては、[FRONTEND_EXPLANATION.md](../explanations/FRONTEND_EXPLANATION.md) を参照してください。
