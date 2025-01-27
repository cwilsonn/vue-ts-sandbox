<template>
  <component v-bind="computedProps">
    <slot>
      <span v-if="loading" class="flex items-center gap-2">
        <Icon icon="svg-spinners:180-ring-with-bg" />
        Loading...
      </span>
      <span v-else>
        <slot></slot>
      </span>
    </slot>
  </component>
</template>

<script lang="ts">
import { type RouteLocationRaw } from 'vue-router';
import { twMerge } from 'tailwind-merge';

export const buttonColors = {
  primary: 'bg-blue-500 text-white',
  secondary: 'bg-gray-500 text-white',
  danger: 'bg-red-500 text-white',
  warning: 'bg-yellow-500 text-white',
  success: 'bg-green-500 text-white',
  info: 'bg-blue-500 text-white',
  light: 'bg-gray-200 text-gray-800',
  dark: 'bg-gray-800 text-white',
} as const;

export type ButtonColor = keyof typeof buttonColors;

export const buttonHoverColors = {
  primary: 'hover:bg-blue-600',
  secondary: 'hover:bg-gray-600',
  danger: 'hover:bg-red-600',
  warning: 'hover:bg-yellow-600',
  success: 'hover:bg-green-600',
  info: 'hover:bg-blue-600',
  light: 'hover:bg-gray-300',
  dark: 'hover:bg-gray-700',
} as const;

export const buttonFocusColors = {
  primary: 'focus:bg-blue-600',
  secondary: 'focus:bg-gray-600',
  danger: 'focus:bg-red-600',
  warning: 'focus:bg-yellow-600',
  success: 'focus:bg-green-600',
  info: 'focus:bg-blue-600',
  light: 'focus:bg-gray-300',
  dark: 'focus:bg-gray-700',
} as const;

export const buttonActiveColors = {
  primary: 'bg-blue-600',
  secondary: 'bg-gray-600',
  danger: 'bg-red-600',
  warning: 'bg-yellow-600',
  success: 'bg-green-600',
  info: 'bg-blue-600',
  light: 'bg-gray-300',
  dark: 'bg-gray-700',
} as const;

export const buttonDisabledColors = {
  primary: 'bg-blue-200 text-blue-500',
  secondary: 'bg-gray-200 text-gray-500',
  danger: 'bg-red-200 text-red-500',
  warning: 'bg-yellow-200 text-yellow-500',
  success: 'bg-green-200 text-green-500',
  info: 'bg-blue-200 text-blue-500',
  light: 'bg-gray-200 text-gray-500',
  dark: 'bg-gray-200 text-gray-500',
} as const;

export const buttonSizes = {
  sm: 'px-2 py-1 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
} as const;

export type ButtonSize = keyof typeof buttonSizes;

export type ButtonBaseProps = {
  color?: keyof typeof buttonColors;
  size?: keyof typeof buttonSizes;
  rounded?: boolean;
  block?: boolean;
  disabled?: boolean;
  loading?: boolean;
  active?: boolean;
  to?: RouteLocationRaw | string;
};
</script>

<script setup lang="ts">
import { computed } from 'vue';
import { Icon } from '@iconify/vue';

const {
  color = 'light',
  size = 'md',
  rounded = true,
  block = false,
  disabled = false,
  loading = false,
  active = false,
  to,
} = defineProps<ButtonBaseProps>();

const classes = computed(() => {
  return twMerge([
    rounded ? 'rounded-md' : '',
    'transition',
    'duration-300',
    'ease-in-out',
    'flex',
    'items-center',
    'justify-center',
    buttonColors[color],
    !disabled && !loading ? buttonHoverColors[color] : '',
    !disabled && !loading ? buttonFocusColors[color] : '',
    (disabled || loading)
      ? `cursor-not-allowed hover:cursor-not-allowed ${buttonDisabledColors[color]}`
      : 'hover:cursor-pointer',
    active && !disabled && !loading ? buttonActiveColors[color] : '',
    buttonSizes[size],
    block ? 'w-full' : '',
  ]);
});

const component = to ? 'router-link' : 'button';

const computedProps = computed(() => ({
  class: classes.value,
  disabled: disabled || loading,
  to,
}));
</script>