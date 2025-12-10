'use client';

import { useId } from 'react';
import {
  Controller,
  type Control,
  type FieldValues,
  type FieldPath,
  type RegisterOptions,
} from 'react-hook-form';
import { Input } from '../ui';

type DateTimeFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  label?: string;
  rules?: RegisterOptions<T>;
  placeholder?: string;
  className?: string;
};

export const DateTimeField = <T extends FieldValues>({
  control,
  name,
  label,
  rules,
  placeholder,
  className,
}: DateTimeFieldProps<T>) => {
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
          <div className="flex flex-col gap-1 w-full">
            {label && (
              <label
                htmlFor={id}
                className="font-medium text-sm text-gray-700 cursor-pointer"
              >
                {label}
                {isRequired && <span className="text-red-500 ml-1">*</span>}
              </label>
            )}

            <Input
              id={id}
              type="datetime-local"
              {...field}
              value={field.value ?? ''}
              placeholder={placeholder}
              error={!!errorMessage}
              className={className}
            />

            {errorMessage && (
              <p className="text-red-500 text-xs" role="alert">
                {errorMessage}
              </p>
            )}
          </div>
        );
      }}
    />
  );
};
