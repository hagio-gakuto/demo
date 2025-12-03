/**
 * バリデーションメッセージの定数定義
 */

/**
 * 必須フィールドのエラーメッセージを生成する関数
 * @param fieldName フィールド名（例: 'ユーザーID', '部署名'）
 * @returns エラーメッセージ（例: 'ユーザーIDは必須です'）
 */
export const REQUIRED_FIELD = (fieldName: string): string =>
  `${fieldName}は必須です`;

export const INVALID = {
  RECRUIT_YEAR_ID: '年度IDは正の整数である必要があります',
  PAGE: 'pageは1以上の整数である必要があります',
  PAGE_SIZE: 'pageSizeは1以上の整数である必要があります',
  ROLE: '権限はuser、admin、masterのいずれかである必要があります',
  EMAIL_FORMAT: 'メールアドレスの形式が正しくありません',
  URL_FORMAT: 'WEBサイトURLの形式が正しくありません',
  THEME_COLOR: 'テーマカラーは#RRGGBB形式で入力してください',
} as const;

export const MIN_LENGTH = {
  USERS: 'ユーザーは1件以上必要です',
  INTERVIEWERS: '面接官が1件以上必要です',
  EVENTS: 'イベントは1件以上必要です',
} as const;

/**
 * 形式不正のエラーメッセージを生成する関数
 * @param fieldName フィールド名（例: 'メールアドレス', 'URL'）
 * @returns エラーメッセージ（例: 'メールアドレスの形式が正しくありません'）
 */
export const INVALID_FORMAT = (fieldName: string): string =>
  `${fieldName}の形式が正しくありません`;
