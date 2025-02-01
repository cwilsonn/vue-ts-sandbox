<template>
  <component :is="as" :class="cardClasses">
    <slot v-if="image" name="image" v-bind="{ image }">
      <img :src="image.src" :alt="image.alt" />
    </slot>
    <header class="flex justify-between gap-2 mb-2">
      <slot name="title" v-bind="{ title }">
        <h3 class="font-bold text-xl">{{ title }}</h3>
      </slot>
      <div v-if="slots['top-actions']">
        <slot name="top-actions"></slot>
      </div>
    </header>
    <slot name="content" v-bind="{ description }">
      <p>{{ description }}</p>
    </slot>
  </component>
</template>

<script lang="ts">
export type CardImgProps = {
  src: string;
  alt: string;
};

export const cardBorderColors = {
  primary: 'border-blue-500',
  secondary: 'border-gray-500',
  danger: 'border-red-500',
  warning: 'border-yellow-500',
  success: 'border-green-500',
  info: 'border-blue-500',
  light: 'border-gray-200',
  dark: 'border-gray-800',
} as const;

export type CardBorderColor = keyof typeof cardBorderColors;

export type CardBaseProps = {
  as?: string;
  title?: string;
  description?: string;
  image?: CardImgProps;
  compact?: boolean;
  bordered?: boolean;
  borderColor?: CardBorderColor;
  shadow?: true | 'lg' | 'md' | 'sm' | false;
  rounded?: true | 'lg' | 'md' | 'sm' | false;
};

export type CardBaseSlots = {
  'top-actions': {};
  title: {};
  content: {};
  image: { image: CardImgProps };
}
</script>

<script setup lang="ts">
import { computed } from 'vue';

const {
  as = 'div',
  title,
  description,
  image,
  compact = false,
  bordered = false,
  borderColor = 'light',
  shadow = true,
  rounded = true,
} = defineProps<CardBaseProps>();

const slots = defineSlots<CardBaseSlots>();

const cardClasses = computed(() => ({
  card: true,
  'p-4': !compact,
  'p-2': compact,
  // Border
  border: bordered,
  [cardBorderColors[borderColor]]: bordered,
  // Shadow
  'shadow-lg': shadow === 'lg',
  'shadow-md': ['md', true].includes(shadow),
  'shadow-sm': shadow === 'sm',
  'shadow-none': shadow === false,
  // Rounded
  'rounded-lg': rounded === 'lg',
  'rounded-md': ['md', true].includes(rounded),
  'rounded-sm': rounded === 'sm',
  'rounded-none': rounded === false,
}));
</script>
