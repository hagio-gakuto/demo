'use client';

import { useForm } from 'react-hook-form';
import { Button, SearchIcon, ResetIcon } from '@/components/ui';
import { TextField, SelectField } from '@/components/form';
import { roleOptions, genderOptions } from '../../constants/user.constants';
import type { UserRole, Gender } from '@/types/user';

type UserSearchFormData = {
  id: string;
  search: string;
  role: UserRole | '';
  gender: Gender | '';
};

type UserSearchFormProps = {
  onSearch: (data: UserSearchFormData) => void;
  onReset: () => void;
  searchParams: UserSearchFormData;
};

export const UserSearchForm = ({
  onSearch,
  onReset,
  searchParams,
}: UserSearchFormProps) => {
  const methods = useForm<UserSearchFormData>({
    defaultValues: searchParams,
    mode: 'onBlur',
  });

  const handleSubmit = methods.handleSubmit((data) => {
    onSearch(data);
  });

  const handleReset = () => {
    // フォーム側の見た目をリセットする必要はありません
    // UserManagementコンポーネントで key={JSON.stringify(searchParams)} により
    // searchParamsが変わるたびに再マウントされるため、useFormのdefaultValuesが再評価されます
    // URLをリセットする処理だけ呼ぶ
    onReset();
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <div className="flex gap-4 items-end flex-wrap">
        <div className="w-full sm:w-64 md:w-80">
          <TextField
            control={methods.control}
            name="id"
            label="ID"
            placeholder="ID（カンマ/スペース区切り可）"
          />
        </div>
        <div className="w-full sm:w-80 md:w-96">
          <TextField
            control={methods.control}
            name="search"
            label="検索"
            placeholder="メールアドレス、名前で検索"
          />
        </div>
        <div className="w-full sm:w-40 md:w-48 z-10">
          <SelectField
            control={methods.control}
            name="role"
            label="権限"
            options={roleOptions}
          />
        </div>
        <div className="w-full sm:w-40 md:w-48">
          <SelectField
            control={methods.control}
            name="gender"
            label="性別"
            options={genderOptions}
          />
        </div>
        <div className="w-full sm:w-auto flex gap-2">
          <Button
            type="submit"
            icon={<SearchIcon />}
            className="flex-1 sm:flex-none"
          >
            検索
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            icon={<ResetIcon />}
            className="flex-1 sm:flex-none"
          >
            リセット
          </Button>
        </div>
      </div>
    </form>
  );
};
