import { type ComputedRef, type Ref } from 'vue';
import { z, ZodSchema } from 'zod';

export const FormItemTypes = {
  // Native input types
  text: 'text',
  number: 'number',
  email: 'email',
  password: 'password',
  textarea: 'textarea',
  select: 'select',
  radio: 'radio',
  checkbox: 'checkbox',
  switch: 'switch',
  date: 'date',
  time: 'time',
  datetime: 'datetime',
  file: 'file',
  hidden: 'hidden',
  color: 'color',
  range: 'range',
  search: 'search',
  tel: 'tel',
  url: 'url',
  week: 'week',
  month: 'month',
  datetimeLocal: 'datetime-local',

  // Advanced input types
  autocomplete: 'autocomplete',
  richText: 'rich-text',
  combobox: 'combobox',
  markdown: 'markdown',
  rating: 'rating',
  slider: 'slider',
  toggle: 'toggle',
  tags: 'tags',
} as const;

export type FormItemType = keyof typeof FormItemTypes;

export type FormItemOptionBase = {
  value: string | number;
  label: string;
  disabled?: boolean;
};

export type FormItemOptionSelectGroup = {
  label: string;
  options: FormItemOptionBase[];
};

export type FormItemOptionSelect = {
  options: (FormItemOptionBase | FormItemOptionSelectGroup)[];
}

export type FormItemOption = FormItemOptionBase | FormItemOptionSelectGroup;

export type FormItemConfigBase<T> = {
  key: string;
  id?: string;
  label?: string | false;
  type: FormItemType;
  disabled?: boolean;
  readonly?: boolean;
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  options?: FormItemOption[];
  validation?: ZodSchema<any>;
  errors?: string[],
  value?: T;
};

export type FormField<T> = {
  value: Ref<T>;
  errors: Ref<string[]>;
  validation?: ZodSchema<any>;
  validate?: () => boolean;
  isValid?: ComputedRef<boolean>;
};

export type FormValues<T> = {
  [K in keyof T]: T[K];
}

export type FormErrors<T> = {
  [K in keyof T]: Ref<string[]>;
};
