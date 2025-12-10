# フロントエンド実装説明書

## 1. 設計思想

このフロントエンドアプリケーションは、以下の設計思想に基づいて構築されています。

### 1.1 機能の独立性（Feature-based Architecture）

**思想**: 機能ごとにコードを完全に分離し、各機能が独立して動作するように設計する。

- 各機能は`features/{feature-name}/`配下に配置され、`components/`、`hooks/`、`constants/`を含む
- 機能間の依存関係を最小限に抑え、変更の影響範囲を明確にする
- チーム開発時にコンフリクトが発生しにくく、機能の追加・削除が容易

**実装例**:

```
features/user-management/
├── components/          # この機能専用のコンポーネント
├── hooks/               # この機能専用のロジック
└── constants/           # この機能専用の定数
```

### 1.2 URL駆動の状態管理（URL-Driven State Management）

**思想**: 検索条件やページネーションなどの状態は、URLパラメータで管理する。これにより、状態の一貫性を保ち、デバッグを容易にする。

- **状態はURLに反映される**: 検索条件、ページ番号などはすべてURLパラメータで管理
- **URLを変更することで状態を更新**: `useState`で状態を管理せず、`router.push`でURLを更新
- **Effectの連鎖を避ける**: URLパラメータの変更を検知してデータ取得を行う一方向のデータフロー

**なぜこの思想か**:

- ブラウザの戻る/進むボタンで状態が復元される
- URLを共有すると検索条件も共有される
- デバッグ時にURLを見るだけで状態が分かる
- サーバーサイドレンダリング（SSR）と相性が良い

### 1.3 ロジックと表示の分離（Separation of Concerns）

**思想**: コンポーネントは表示ロジックのみを担当し、ビジネスロジックやデータ取得処理はカスタムフックに集約する。

- **コンポーネント**: 表示のみ（JSXの記述）
- **カスタムフック**: ビジネスロジック、データ取得、状態管理
- **共通コンポーネント**: UIの見た目のみ（ロジックを含まない）

**なぜこの思想か**:

- コンポーネントがシンプルになり、可読性が向上
- ロジックの再利用が容易
- テストが書きやすい（ロジックと表示を分けてテスト可能）

### 1.4 必要以上に共通化しない（YAGNI原則）

**思想**: 全画面共通のUIや、同一画面内で同一のUIのみを共通化する。特定画面のUIや機能が異なるUIは共通化しない。

- **共通化する**: Button、Input、Table、Dialogなど、見た目と動作が完全に同一のUI
- **共通化しない**: 特定機能専用のUI、見た目は似ているが動作が異なるUI

**なぜこの思想か**:

- 過度な共通化は、後から機能を追加する際に制約となる
- 機能ごとに独立して進化できる
- コードの可読性が向上（「この機能はこのファイルを見れば分かる」）

---

## 2. 技術スタック

- **Next.js 16** (App Router): ルーティング、SSR/SSG
- **React 19**: UIライブラリ
- **TypeScript 5**: 型安全性
- **Tailwind CSS 4**: スタイリング
- **React Hook Form 7.66.1**: フォーム管理
- **react-hot-toast 2.6.0**: トースト通知

---

## 3. ディレクトリ構成と配置ルール

```
src/
├── app/                    # ルーティング関連のみ（URL構造）
│   ├── admin/             # 管理者権限が必要なページ
│   │   ├── layout.tsx     # 権限チェックを行うServer Component
│   │   └── user-management/
│   │       └── page.tsx   # Next.jsのページコンポーネント
│   ├── mypage/            # マイページ
│   │   └── page.tsx
│   ├── unauthorized/      # 権限エラーページ
│   │   └── page.tsx
│   ├── layout.tsx         # ルートレイアウト
│   ├── page.tsx           # トップページ（ダッシュボード）
│   ├── error.tsx          # グローバルエラーバウンダリー
│   └── not-found.tsx      # 404エラーページ
│
├── components/            # 共通コンポーネント
│   ├── layout/            # レイアウトコンポーネント（Header, Footer, Breadcrumb）
│   ├── ui/                # UIコンポーネント（Button, Input, Select, Table, Dialog等）
│   ├── form/              # フォームコンポーネント（TextField, SelectField等）
│   ├── features/          # 機能共通コンポーネント（検索条件保存等）
│   └── providers/         # プロバイダー（Providers）
│
├── features/               # 機能ごとのドメインロジック
│   ├── dashboard/         # ダッシュボード
│   ├── user-management/   # ユーザー管理
│   └── mypage/           # マイページ
│
├── contexts/              # React Context（UserContext, BreadcrumbContext）
├── hooks/                 # グローバルフック（useAuth, usePageTitle）
├── libs/                  # ライブラリ設定（api-client.ts）
├── types/                 # アプリケーション全体で共有する型定義
└── constants/             # アプリケーション全体で共有する定数
```

### 配置ルール

- **`app/`**: ルーティングのみ。ビジネスロジックは書かない
- **`components/`**: 全画面で使用される共通コンポーネントのみ
- **`features/`**: 機能ごとに完全に分離。機能固有のコンポーネント、フック、型はここに配置
- **`types/`**: アプリケーション全体で共有する型のみ（User等）
- **`constants/`**: アプリケーション全体で共有する定数（navigation-links等）

---

## 4. コーディング時の具体的な指針

### 4.1 コンポーネントの書き方

#### ✅ 必ず守ること

1. **Named Exportを使用する**（`export default`は禁止）

```tsx
// ✅ OK
export const UserManagement = () => {
  return <div>...</div>;
};

// ❌ NG
export default UserManagement;
```

2. **アロー関数を使用する**

```tsx
// ✅ OK
const handleClick = () => {
  // ...
};

// ❌ NG
function handleClick() {
  // ...
}
```

3. **1ファイル1コンポーネント**

```tsx
// ✅ OK: UserManagement.tsx
export const UserManagement = () => { ... };

// ❌ NG: UserManagement.tsx
const UserSearchForm = () => { ... };
export const UserManagement = () => { ... };
```

4. **インポートは`@/`エイリアスを使用**

```tsx
// ✅ OK
import { Button } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';

// ❌ NG
import { Button } from '../../../components/ui';
```

### 4.2 API送信の書き方

#### ✅ 必ず`apiClient`を使う

```tsx
import { apiClient } from '@/libs/api-client';
import type { UserResponseDto } from '@/types/user';

// GETリクエスト
const fetchUsers = async () => {
  const users = await apiClient<UserResponseDto[]>('/users');
  return users;
};

// POSTリクエスト
const createUser = async (data: CreateUserRequestDto) => {
  const user = await apiClient<UserResponseDto>('/users', {
    method: 'POST',
    body: data,
  });
  return user;
};
```

#### ✅ エラーハンドリング

```tsx
import { ApiClientError } from '@/libs/api-client';
import { extractErrorMessage } from '@/libs/error-handler';
import { toast } from 'react-hot-toast';

try {
  await apiClient('/users', { method: 'POST', body: data });
  toast.success('作成しました');
} catch (err) {
  if (err instanceof ApiClientError && err.details) {
    // サーバーサイドのバリデーションエラー（フィールド固有）
    err.details.forEach((detail) => {
      setError(detail.path[0] as keyof FormData, {
        type: 'server',
        message: detail.message,
      });
    });
  } else if (err instanceof ApiClientError) {
    // 一般的なAPIエラー
    toast.error(err.message);
  } else {
    const message = extractErrorMessage(err, '処理に失敗しました');
    toast.error(message);
  }
}
```

### 4.3 フォーム管理の書き方

#### ✅ 必ずこのパターンを使う

```tsx
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui';
import { TextField, SelectField } from '@/components/form';
import { apiClient } from '@/libs/api-client';
import { toast } from 'react-hot-toast';

type FormData = {
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
};

export const CreateUserForm = () => {
  const methods = useForm<FormData>({
    defaultValues: {
      email: '',
      role: 'user',
      firstName: '',
      lastName: '',
    },
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });

  const handleSubmit = methods.handleSubmit(async (data) => {
    try {
      await apiClient('/users', { method: 'POST', body: data });
      toast.success('作成しました');
      methods.reset();
    } catch (err) {
      // エラーハンドリング
    }
  });

  return (
    <form onSubmit={handleSubmit} noValidate>
      <TextField
        control={methods.control}
        name="email"
        label="メールアドレス"
        rules={{ required: 'メールアドレスは必須です' }}
      />
      <SelectField
        control={methods.control}
        name="role"
        label="権限"
        options={roleOptions}
        rules={{ required: '権限は必須です' }}
      />
      <Button type="submit">送信</Button>
    </form>
  );
};
```

### 4.4 データ取得の書き方

#### ✅ URLパラメータから直接取得

```tsx
// features/user-management/hooks/useUserList.ts
import { useSearchParams } from 'next/navigation';
import { apiClient } from '@/libs/api-client';
import { useCallback, useEffect, useState } from 'react';

export const useUserList = () => {
  const searchParams = useSearchParams();
  const [users, setUsers] = useState<UserResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ OK: URLパラメータから直接値を取得
  const getSearchParams = useCallback(() => {
    return {
      id: searchParams.get('id') || '',
      search: searchParams.get('search') || '',
      page: Number(searchParams.get('page')) || 1,
      pageSize: Number(searchParams.get('pageSize')) || 10,
    };
  }, [searchParams]);

  // ✅ OK: URLパラメータの変更を検知してデータ取得
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const params = getSearchParams();
        const queryString = new URLSearchParams({
          ...params,
          page: String(params.page),
          pageSize: String(params.pageSize),
        }).toString();
        const data = await apiClient<UserListResponseDto>(
          `/users/search/detail?${queryString}`,
        );
        setUsers(data.users);
      } catch (err) {
        // エラーハンドリング
      } finally {
        setIsLoading(false);
      }
    };
    void fetchUsers();
  }, [getSearchParams]);

  return { users, isLoading };
};
```

#### ✅ URLを更新してデータ取得

```tsx
import { useRouter } from 'next/navigation';

const router = useRouter();

const handleSearch = (data: SearchFormData) => {
  // ✅ OK: URLのみを変更（状態は直接更新しない）
  router.push(`/admin/user-management?search=${data.search}`);
};

const handleReset = () => {
  // ✅ OK: URLのみを変更
  router.push('/admin/user-management');
};
```

#### ❌ 使ってはいけないこと

```tsx
// ❌ NG: useStateで状態管理
const [searchParams, setSearchParams] = useState({ id: '', search: '' });

// ❌ NG: 直接APIを叩く（URLを更新しない）
const handleSearch = async (data: FormData) => {
  const users = await apiClient(`/users?search=${data.search}`);
  setUsers(users);
};
```

### 4.5 権限チェックの書き方

#### ✅ layoutでの権限チェック（Server Component）

```tsx
// app/admin/layout.tsx
import { redirect } from 'next/navigation';
import { apiClient } from '@/libs/api-client';

type MeResponse = {
  id: string;
  name: string;
  email: string;
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

#### ✅ コンポーネント内での権限チェック

```tsx
import { useAuth } from '@/hooks/useAuth';

export const MyComponent = () => {
  const { hasRole } = useAuth();

  if (!hasRole('admin')) {
    return null;
  }

  return <div>管理者のみ表示</div>;
};
```

### 4.6 グローバル状態管理の書き方

#### ✅ React Contextを使用

グローバル状態は**React Context**で管理します。主に以下の2つのContextがあります：

1. **`UserContext`**: ログインユーザー情報の管理
2. **`BreadcrumbContext`**: パンくずリストの管理

```tsx
// contexts/UserContext.tsx
'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '@/types/user';
import { apiClient } from '@/libs/api-client';

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const me = await apiClient<MeResponse>('/me');
        setUser({
          id: me.id,
          name: `${me.lastName} ${me.firstName}`,
          email: me.email,
          role: me.role,
        });
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    void fetchMe();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, isLoading }}>
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

### 4.7 認証フックの書き方

#### ✅ `useAuth`フックを使用

```tsx
// hooks/useAuth.ts
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

---

## 5. 主要なコンポーネントと使い方

### 5.1 フォームコンポーネント

フォームコンポーネントは、`react-hook-form`の`Controller`を使用して実装されており、バリデーション、エラー表示、ラベル表示が自動的に処理されます。

#### ✅ `TextField` - テキスト入力フィールド

```tsx
import { useForm } from 'react-hook-form';
import { TextField } from '@/components/form';

type FormData = {
  name: string;
  email: string;
};

const methods = useForm<FormData>({
  defaultValues: { name: '', email: '' },
});

<TextField
  control={methods.control}
  name="name"
  label="名前"
  placeholder="名前を入力"
  rules={{ required: '名前は必須です' }}
/>

<TextField
  control={methods.control}
  name="email"
  label="メールアドレス"
  type="email"
  placeholder="user@example.com"
  rules={{
    required: 'メールアドレスは必須です',
    pattern: {
      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: '有効なメールアドレスを入力してください',
    },
  }}
/>
```

**ポイント**:

- `control`プロパティで`methods.control`を渡す
- `FormProvider`でラップしている場合は、`control`を省略可能（自動的に取得）
- `rules`プロパティでバリデーションルールを指定
- エラーメッセージは自動的に表示される

#### ✅ `SelectField` - セレクトボックス

```tsx
import { useForm } from 'react-hook-form';
import { SelectField } from '@/components/form';

type FormData = {
  role: 'user' | 'admin';
};

const methods = useForm<FormData>();

const roleOptions = [
  { value: 'user', label: 'ユーザー' },
  { value: 'admin', label: '管理者' },
];

<SelectField
  control={methods.control}
  name="role"
  label="権限"
  options={roleOptions}
  rules={{ required: '権限は必須です' }}
/>;
```

**ポイント**:

- `options`プロパティで選択肢を指定（`{ value: string, label: string }[]`形式）
- 空の選択肢を追加する場合は、`options`配列の先頭に`{ value: '', label: '選択してください' }`を追加

#### ✅ `TextareaField` - テキストエリア

```tsx
import { useForm } from 'react-hook-form';
import { TextareaField } from '@/components/form';

type FormData = {
  description: string;
};

const methods = useForm<FormData>();

<TextareaField
  control={methods.control}
  name="description"
  label="説明"
  placeholder="説明を入力"
  rows={5}
  rules={{
    required: '説明は必須です',
    maxLength: {
      value: 1000,
      message: '説明は1000文字以内で入力してください',
    },
  }}
/>;
```

#### ✅ `DateTimeField` - 日時入力フィールド

```tsx
import { useForm } from 'react-hook-form';
import { DateTimeField } from '@/components/form';

type FormData = {
  startDateTime: string;
};

const methods = useForm<FormData>();

<DateTimeField
  control={methods.control}
  name="startDateTime"
  label="開始日時"
  rules={{ required: '開始日時は必須です' }}
/>;
```

#### ✅ `TimeField` - 時間入力フィールド

```tsx
import { useForm } from 'react-hook-form';
import { TimeField } from '@/components/form';

type FormData = {
  startTime: string;
};

const methods = useForm<FormData>();

<TimeField
  control={methods.control}
  name="startTime"
  label="開始時間"
  rules={{ required: '開始時間は必須です' }}
/>;
```

#### ✅ `MultiSelectField` - 複数選択フィールド

```tsx
import { useForm } from 'react-hook-form';
import { MultiSelectField } from '@/components/form';

type FormData = {
  tags: string[];
};

const methods = useForm<FormData>({
  defaultValues: { tags: [] },
});

const tagOptions = [
  { value: 'tag1', label: 'タグ1' },
  { value: 'tag2', label: 'タグ2' },
  { value: 'tag3', label: 'タグ3' },
];

<MultiSelectField
  control={methods.control}
  name="tags"
  label="タグ"
  options={tagOptions}
  rules={{ required: 'タグは必須です' }}
/>;
```

#### ✅ `Form` - フォームラッパーコンポーネント

`FormProvider`と`form`要素を自動的に提供するコンポーネントです。

```tsx
import { Form } from '@/components/form';
import { TextField, SelectField } from '@/components/form';

type FormData = {
  name: string;
  role: string;
};

<Form
  defaultValues={{ name: '', role: '' }}
  onSubmit={async (data) => {
    await apiClient('/users', { method: 'POST', body: data });
    toast.success('作成しました');
  }}
>
  <TextField name="name" label="名前" rules={{ required: '名前は必須です' }} />
  <SelectField
    name="role"
    label="権限"
    options={roleOptions}
    rules={{ required: '権限は必須です' }}
  />
  <Button type="submit">送信</Button>
</Form>;
```

**ポイント**:

- `FormProvider`でラップされているため、各Fieldコンポーネントで`control`を省略可能
- `defaultValues`が変更されると自動的にフォームがリセットされる

#### ✅ `FormError` - フォーム全体のエラー表示

```tsx
import { FormError } from '@/components/form';

<FormError error={error} />;
```

**ポイント**:

- APIから返されたフォーム全体のエラーメッセージを表示
- フィールド固有のエラーは各Fieldコンポーネントが自動的に表示

#### ✅ `FormFooter` - フォームフッター

```tsx
import { FormFooter } from '@/components/form';
import { Button, CancelIcon, SaveIcon } from '@/components/ui';

<FormFooter
  onCancel={handleCancel}
  onSubmit={handleSubmit}
  submitLabel="保存"
  cancelLabel="キャンセル"
  isSubmitting={isSubmitting}
/>;
```

**ポイント**:

- 保存・キャンセルボタンを自動的に配置
- アイコンも自動的に付与される

#### ✅ `HelpTooltip` - ヘルプツールチップ

```tsx
import { HelpTooltip } from '@/components/form';

<HelpTooltip message="このフィールドの説明を表示します" />;
```

### 5.2 CSV関連コンポーネント

#### ✅ `CsvExportButton` - CSV出力ボタン

```tsx
import { CsvExportButton } from '@/components/ui';

<CsvExportButton
  onExport={async () => {
    const users = await apiClient<UserResponseDto[]>('/users/export');
    const csvData = users.map((user) => ({
      ID: user.id,
      メールアドレス: user.email,
      姓: user.lastName,
      名: user.firstName,
    }));
    const csvContent = convertToCSV({
      data: csvData,
      headers: [
        { key: 'ID', label: 'ID' },
        { key: 'メールアドレス', label: 'メールアドレス' },
        { key: '姓', label: '姓' },
        { key: '名', label: '名' },
      ],
    });
    downloadCSV({ csvContent, filename: 'users.csv' });
  }}
>
  CSV出力
</CsvExportButton>;
```

**ポイント**:

- クリック時に`onExport`コールバックが実行される
- ローディング状態が自動的に管理される

#### ✅ `CsvUploadButton` - CSVアップロードボタン

```tsx
import { CsvUploadButton } from '@/components/ui';
import { parseCSV } from '@/libs/csv-parse';

<CsvUploadButton
  onUpload={async (file) => {
    const data = await parseCSV(file);
    // CSVデータを処理
    await apiClient('/users/bulk', {
      method: 'POST',
      body: { users: data },
    });
    toast.success('CSVアップロードが完了しました');
  }}
>
  CSVアップロード
</CsvUploadButton>;
```

**ポイント**:

- ファイル選択ダイアログを自動的に開く
- アップロード中のローディング状態が自動的に管理される

#### ✅ CSVユーティリティ関数

```tsx
import { convertToCSV, downloadCSV } from '@/libs/csv-utils';
import { parseCSV } from '@/libs/csv-parse';

// CSVデータを文字列に変換
const csvContent = convertToCSV({
  data: [
    { id: '1', name: 'ユーザー1' },
    { id: '2', name: 'ユーザー2' },
  ],
  headers: [
    { key: 'id', label: 'ID' },
    { key: 'name', label: '名前' },
  ],
});

// CSVファイルをダウンロード
downloadCSV({
  csvContent,
  filename: 'users.csv',
});

// CSVファイルを解析
const file = event.target.files[0];
const data = await parseCSV(file);
// data: [{ id: '1', name: 'ユーザー1' }, ...]
```

### 5.3 ナビゲーション・サイドバーコンポーネント

#### ✅ `NavigationMenu` - ナビゲーションメニュー（デスクトップ用）

権限別にリンクを表示するドロップダウンメニューです。

```tsx
import { NavigationMenu } from '@/components/layout';

// Headerコンポーネント内で自動的に使用される
// 権限に応じてリンクが自動的にフィルタリングされる
```

**ポイント**:

- `navigationLinks`定数からリンクを取得
- `useAuth`フックで権限チェックを行い、表示可能なリンクのみを表示
- 権限区分ごとにドロップダウンメニューを表示

#### ✅ `HamburgerMenu` - ハンバーガーメニュー（モバイル用）

モバイル表示用のハンバーガーメニューです。

```tsx
import { HamburgerMenu } from '@/components/layout';

// Headerコンポーネント内で自動的に使用される
// モバイル表示時に表示される
```

**ポイント**:

- モバイル表示時に自動的に表示される
- 権限に応じてリンクが自動的にフィルタリングされる
- メニューを開くと背景のスクロールが無効化される

#### ✅ `NavigationLinks` - ナビゲーションリンク（シンプル版）

シンプルなリンクリストを表示するコンポーネントです。

```tsx
import { NavigationLinks } from '@/components/layout';
import { navigationLinks } from '@/constants/navigation-links';
import { useAuth } from '@/hooks/useAuth';

export const MyComponent = () => {
  const { hasRole } = useAuth();

  // 権限に応じてリンクをフィルタリング
  const visibleLinks = navigationLinks.filter((link) =>
    hasRole(link.requiredRole),
  );

  return <NavigationLinks links={visibleLinks} />;
};
```

#### ✅ `navigationLinks`定数 - ナビゲーションリンクの定義

```tsx
// constants/navigation-links.tsx
import type { NavigationLink } from '@/constants/navigation-links';
import { UserManagementIcon } from '@/components/ui/icons';

export const navigationLinks: NavigationLink[] = [
  {
    href: '/admin/user-management',
    label: 'ユーザー管理',
    description: 'ユーザーの追加・編集を行います',
    requiredRole: 'admin',
    icon: <UserManagementIcon />,
  },
  // 他のリンク...
];

// 権限区分のカテゴリ情報
export const roleCategoryMap: Record<
  UserRole,
  { title: string; description: string }
> = {
  user: {
    title: '一般機能',
    description: '一般ユーザーが利用できる機能',
  },
  admin: {
    title: '管理機能',
    description: '管理者が利用できる機能',
  },
};
```

**ポイント**:

- `requiredRole`で必要な権限を指定
- `icon`でアイコンを指定（オプショナル）
- `description`でリンクの説明を指定（ダッシュボードで使用）

### 5.4 UIコンポーネント

#### ✅ `Button` - ボタン

```tsx
import { Button, SaveIcon, CancelIcon } from '@/components/ui';

<Button variant="primary" onClick={handleClick} icon={<SaveIcon />}>
  保存
</Button>

<Button variant="outline" onClick={handleCancel} icon={<CancelIcon />}>
  キャンセル
</Button>

<Button variant="danger" onClick={handleDelete} isLoading={isDeleting}>
  削除
</Button>
```

**ポイント**:

- `variant`: `primary`、`outline`、`danger`など
- `icon`: アイコンを指定（オプショナル）
- `isLoading`: ローディング状態を表示

#### ✅ `Table` - テーブル

```tsx
import { Table } from '@/components/ui';

<Table
  columns={[
    { key: 'name', label: '名前' },
    { key: 'email', label: 'メール' },
    {
      key: 'status',
      label: 'ステータス',
      render: (value) => (
        <span
          className={value === 'active' ? 'text-green-600' : 'text-gray-600'}
        >
          {value}
        </span>
      ),
    },
  ]}
  data={users}
  emptyMessage="データがありません"
/>;
```

**ポイント**:

- `render`プロパティでカスタムレンダリングが可能
- `emptyMessage`でデータがない場合のメッセージを指定

#### ✅ `Dialog` - モーダルダイアログ

```tsx
import { Dialog, Button } from '@/components/ui';

<Dialog
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="確認"
  size="md" // 'sm' | 'md' | 'lg' | 'xl'
  footer={
    <>
      <Button onClick={() => setIsOpen(false)}>キャンセル</Button>
      <Button onClick={handleConfirm}>確定</Button>
    </>
  }
>
  <p>本当に削除しますか？</p>
</Dialog>;
```

**ポイント**:

- `isOpen`で表示/非表示を制御
- `onClose`で閉じる処理を指定
- `footer`でフッターコンテンツを指定（オプショナル）
- ESCキーやバックドロップクリックで自動的に閉じる

---

## 6. 主要なフックと使い方

### 6.1 `useAuth` - 認証・権限チェック

```tsx
import { useAuth } from '@/hooks/useAuth';

const { user, isAdmin, hasRole } = useAuth();

// 権限チェック
if (hasRole('admin')) {
  // 管理者のみ実行
}
```

### 6.2 `useUser` - ユーザー情報

```tsx
import { useUser } from '@/contexts/UserContext';

const { user, isLoading } = useUser();

if (isLoading) {
  return <Loading />;
}

return <div>{user?.name}</div>;
```

---

## 7. 実装時のチェックリスト

新しい機能を実装する際は、以下を確認してください。

### フォーム実装時

- [ ] `useForm`を使用し、各Fieldコンポーネントに`control`を渡しているか
- [ ] `TextField`、`SelectField`などのフォームコンポーネントを使用しているか
- [ ] `mode: 'onSubmit'`と`reValidateMode: 'onChange'`を設定しているか
- [ ] エラーハンドリングで`setError`と`toast`を使用しているか
- [ ] ラベルと入力欄が`htmlFor`と`id`で紐づけられているか（各Fieldコンポーネントで自動的に処理される）

### データ取得実装時

- [ ] URLパラメータから直接値を取得しているか（`useSearchParams`）
- [ ] `useState`で検索条件を管理していないか
- [ ] `router.push`でURLを更新しているか
- [ ] `useEffect`でURLパラメータの変更を検知しているか

### コンポーネント実装時

- [ ] Named Exportを使用しているか
- [ ] アロー関数を使用しているか
- [ ] 1ファイル1コンポーネントか
- [ ] ロジックはカスタムフックに切り出しているか
- [ ] `@/`エイリアスでインポートしているか

### 型定義時

- [ ] `type`文を使用しているか（`interface`は使っていないか）
- [ ] 機能固有の型は`features/{feature}/`に配置しているか
- [ ] 共有型は`types/`に配置しているか

### スタイリング時

- [ ] Tailwind CSSクラスを使用しているか
- [ ] インラインスタイルを使っていないか

---

## 8. よくある間違いと正しい実装

### ❌ 間違い: useStateで検索条件を管理

```tsx
// ❌ NG
const [searchParams, setSearchParams] = useState({ id: '', search: '' });
```

### ✅ 正しい: URLパラメータから直接取得

```tsx
// ✅ OK
const searchParams = useSearchParams();
const id = searchParams.get('id') || '';
```

### ❌ 間違い: 直接APIを叩く

```tsx
// ❌ NG
const handleSearch = async (data: FormData) => {
  const users = await apiClient(`/users?search=${data.search}`);
  setUsers(users);
};
```

### ✅ 正しい: URLを更新してデータ取得

```tsx
// ✅ OK
const handleSearch = (data: FormData) => {
  router.push(`/admin/user-management?search=${data.search}`);
};
```

### ❌ 間違い: ロジックをコンポーネントに直接書く

```tsx
// ❌ NG
export const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const fetchUsers = async () => {
    // データ取得ロジック
  };
  return <div>...</div>;
};
```

### ✅ 正しい: カスタムフックに切り出す

```tsx
// ✅ OK: hooks/useUserList.ts
export const useUserList = () => {
  // データ取得ロジック
  return { users, fetchUsers };
};

// ✅ OK: components/UserManagement.tsx
export const UserManagement = () => {
  const { users } = useUserList();
  return <div>...</div>;
};
```

---

## 9. まとめ

このフロントエンドアプリケーションは、以下の設計思想に基づいて構築されています：

1. **機能の独立性**: 機能ごとにコードを完全に分離
2. **URL駆動の状態管理**: 状態はURLパラメータで管理
3. **ロジックと表示の分離**: コンポーネントは表示のみ、ロジックはフックに集約
4. **必要以上に共通化しない**: 全画面共通のUIのみを共通化

これらの思想に従って実装することで、保守性が高く、スケーラブルなアプリケーションを実現できます。
