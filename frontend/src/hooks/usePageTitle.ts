import { useEffect } from 'react';

/**
 * ページタイトルを設定するカスタムフック
 * @param title ページタイトル（例: "ユーザー管理"）
 */
export const usePageTitle = (title: string) => {
  useEffect(() => {
    document.title = title ? `Sample App | ${title}` : 'Sample App';
  }, [title]);
};
