'use client';

import { useState, useEffect } from 'react';
import {
  Title,
  PageContainer,
  Button,
  Loading,
  CsvExportButton,
  PlusIcon,
  BulkIcon,
  BookmarkIcon,
} from '@/components/ui';
import { SaveSearchConditionButton } from '@/components/features';
import { useUserManagement } from '../../hooks/useUserManagement';
import { useSearchCondition } from '../../hooks/useSearchCondition';
import { errorMessages } from '@/constants/error-messages';
import { UserSearchForm } from './UserSearchForm';
import { FormError } from '@/components/form';
import { UserTable } from './UserTable';
import { UserManagementDialogs } from '../dialogs/UserManagementDialogs';

export const UserManagement = () => {
  const {
    users,
    total,
    page,
    isLoading,
    error,
    setError,
    handleSearch,
    handleReset,
    setPage,
    searchParams,
    handleExportCSV,
    handleDownloadTemplateCSV,
    handleDownloadEditTemplateCSV,
    handleUploadCSV,
    fetchUsers,
  } = useUserManagement();

  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [isSaveConditionDialogOpen, setIsSaveConditionDialogOpen] =
    useState(false);
  const [isSearchConditionListDialogOpen, setIsSearchConditionListDialogOpen] =
    useState(false);

  const {
    filteredConditions,
    isLoading: isSearchConditionLoading,
    fetchSavedConditions,
    searchConditions,
    saveCondition,
    deleteCondition,
    applyCondition,
  } = useSearchCondition();

  useEffect(() => {
    void fetchSavedConditions();
  }, [fetchSavedConditions]);

  const hasSearchConditions =
    !!searchParams.id ||
    !!searchParams.search ||
    !!searchParams.role ||
    !!searchParams.gender;

  if (isLoading) {
    return (
      <PageContainer>
        <Title>ユーザー管理</Title>
        <Loading />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="flex justify-between items-center">
        <Title>ユーザー管理</Title>
        <div className="flex gap-2">
          <Button
            variant="primary"
            onClick={() => setIsBulkDialogOpen(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white shadow-md"
            icon={<BulkIcon />}
          >
            一括処理
          </Button>
          <Button
            variant="primary"
            onClick={() => setIsCreateDialogOpen(true)}
            icon={<PlusIcon />}
          >
            新規登録
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
        <UserSearchForm
          onSearch={handleSearch}
          onReset={handleReset}
          searchParams={searchParams}
        />

        <div className="flex justify-between items-center flex-wrap gap-4">
          <div className="flex gap-2 items-center flex-wrap">
            <SaveSearchConditionButton
              onClick={() => setIsSaveConditionDialogOpen(true)}
              disabled={!hasSearchConditions}
            />
            <Button
              variant="outline"
              onClick={() => setIsSearchConditionListDialogOpen(true)}
              icon={<BookmarkIcon />}
            >
              検索条件一覧
            </Button>
          </div>
          <div className="flex gap-2">
            <CsvExportButton
              onExport={async () => {
                try {
                  await handleExportCSV();
                } catch (err) {
                  setError(
                    err instanceof Error
                      ? err.message
                      : errorMessages.csvExportFailed,
                  );
                }
              }}
              variant="outline"
            >
              CSV出力
            </CsvExportButton>
          </div>
        </div>

        <FormError error={error} />

        <UserTable
          users={users}
          total={total}
          page={page}
          onPageChange={setPage}
          onRowClick={setEditingUserId}
        />
      </div>

      <UserManagementDialogs
        isBulkDialogOpen={isBulkDialogOpen}
        onCloseBulkDialog={() => setIsBulkDialogOpen(false)}
        onDownloadTemplateCSV={handleDownloadTemplateCSV}
        onDownloadEditTemplateCSV={handleDownloadEditTemplateCSV}
        onUploadCSV={handleUploadCSV}
        onBulkError={setError}
        isCreateDialogOpen={isCreateDialogOpen}
        onCloseCreateDialog={() => setIsCreateDialogOpen(false)}
        onCreateUserSuccess={async () => {
          setIsCreateDialogOpen(false);
          await fetchUsers();
        }}
        editingUserId={editingUserId}
        onCloseEditDialog={() => setEditingUserId(null)}
        onEditUserSuccess={async () => {
          setEditingUserId(null);
          await fetchUsers();
        }}
        isSaveConditionDialogOpen={isSaveConditionDialogOpen}
        onCloseSaveConditionDialog={() => setIsSaveConditionDialogOpen(false)}
        onSaveCondition={saveCondition}
        isSearchConditionListDialogOpen={isSearchConditionListDialogOpen}
        onCloseSearchConditionListDialog={() =>
          setIsSearchConditionListDialogOpen(false)
        }
        filteredConditions={filteredConditions}
        onDeleteCondition={deleteCondition}
        onSearchConditions={searchConditions}
        onApplyCondition={applyCondition}
        isSearchConditionLoading={isSearchConditionLoading}
      />
    </PageContainer>
  );
};
