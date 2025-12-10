'use client';

import { useId } from 'react';
import {
  Controller,
  type Control,
  type FieldValues,
  type FieldPath,
  type RegisterOptions,
} from 'react-hook-form';
import { Textarea } from '../ui';

type TextareaFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  label?: string;
  rules?: RegisterOptions<T>;
  placeholder?: string;
  rows?: number;
};

export const TextareaField = <T extends FieldValues>({
  control,
  name,
  label,
  rules,
  placeholder,
  rows,
}: TextareaFieldProps<T>) => {
  const id = useId();

  // 必須項目かどうかを判定（rulesにrequiredがある場合）
  const isRequired =
    rules &&
    typeof rules === 'object' &&
    'required' in rules &&
    (rules.required === true || typeof rules.required === 'string');

  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field, fieldState: { error } }) => {
        const errorMessage =
          typeof error?.message === 'string' ? error.message : undefined;

        return (
          <Textarea
            id={id}
            {...field}
            value={field.value ?? ''}
            label={label}
            placeholder={placeholder}
            error={errorMessage}
            rows={rows}
            required={isRequired}
          />
        );
      }}
    />
  );
};
