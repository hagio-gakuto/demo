'use client';

import { useId } from 'react';
import {
  Controller,
  type Control,
  type FieldValues,
  type FieldPath,
  type RegisterOptions,
} from 'react-hook-form';
import { MultiSelect, type MultiSelectOption } from '../ui';

type MultiSelectFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  label?: string;
  rules?: RegisterOptions<T>;
  options: MultiSelectOption[];
  disabled?: boolean;
};

export const MultiSelectField = <T extends FieldValues>({
  control,
  name,
  label,
  rules,
  options,
  disabled,
}: MultiSelectFieldProps<T>) => {
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
      render={({ field: { value, onChange }, fieldState: { error } }) => {
        const errorMessage =
          typeof error?.message === 'string' ? error.message : undefined;

        const handleChange = (newValue: string[]) => {
          onChange(newValue);
        };

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

            <MultiSelect
              id={id}
              name={name}
              options={options}
              error={!!errorMessage}
              disabled={disabled}
              value={(value as string[]) || []}
              onChange={handleChange}
              required={isRequired}
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
