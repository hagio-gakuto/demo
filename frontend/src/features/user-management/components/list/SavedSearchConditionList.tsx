'use client';

import { Button } from '@/components/ui';
import type { SearchConditionResponseDto } from '@/types/search-condition';

type SavedSearchConditionListProps = {
  conditions: SearchConditionResponseDto[];
  onApply: (condition: SearchConditionResponseDto) => void;
  onDelete: (id: string) => void;
  isLoading?: boolean;
};

export const SavedSearchConditionList = ({
  conditions,
  onApply,
  onDelete,
  isLoading = false,
}: SavedSearchConditionListProps) => {
  if (isLoading) {
    return <div className="text-sm text-gray-500">読み込み中...</div>;
  }

  if (conditions.length === 0) {
    return (
      <div className="text-sm text-gray-500">
        保存された検索条件はありません
      </div>
    );
  }

  return (
    <div className="flex gap-2 items-center flex-wrap">
      {conditions.map((condition) => (
        <div
          key={condition.id}
          className="flex items-center gap-2 p-2 bg-gray-50 rounded hover:bg-gray-100"
        >
          <span className="text-sm font-medium">{condition.name}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onApply(condition)}
          >
            適用
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(condition.id)}
          >
            削除
          </Button>
        </div>
      ))}
    </div>
  );
};
