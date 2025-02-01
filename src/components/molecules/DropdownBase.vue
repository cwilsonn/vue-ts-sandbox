<template>
  <div
    :id="id"
    ref="root"
    class="dropdown relative inline-block"
    v-on-click-outside="handleClickOutside"
  >
    <ButtonBase
      v-if="!split"
      class="gap-x-1"
      v-bind="buttonProps"
      @click="toggleDropdown"
      :aria-expanded="open"
      :aria-controls="`${id}-menu`"
      role="button"
    >
      <slot name="button-text"></slot>
      <Icon :icon="dropdownIcon" />
    </ButtonBase>
    <div v-else :class="`flex items-center divide-x ${dropdownDividerColor}`">
      <ButtonBase
        class="rounded-l-md"
        :rounded="false"
        v-bind="buttonProps"
        @click="emit('action:click', $event)"
        role="button"
      >
        <slot name="button-text"></slot>
      </ButtonBase>
      <ButtonBase
        class="rounded-r-md self-stretch"
        :rounded="false"
        v-bind="buttonProps"
        @click="toggleDropdown"
        :aria-expanded="open"
        :aria-controls="`${id}-menu`"
        role="button"
      >
        <Icon :icon="dropdownIcon" />
      </ButtonBase>
    </div>
    <div
      v-if="open"
      ref="menu"
      class="dropdown_menu absolute bg-white shadow-lg py-2"
      :style="dropdownStyle"
      @click="handleMenuClickBubbleUp"
      :id="`${id}-menu`"
      role="menu"
      tabindex="-1"
    >
      <ul
        class="list-none bg-white py-2 min-w-48 border border-gray-300 rounded divide-y divide-gray-300"
      >
        <slot name="menu"></slot>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import { type ButtonBaseProps } from '../atoms/ButtonBase.vue';

export type DropdownBaseProps = {
  id: string;
  openIcon?: string;
  closeIcon?: string;
  direction?: 'auto' | 'up-left' | 'up-right' | 'down-left' | 'down-right';
  split?: boolean;
  buttonProps?: ButtonBaseProps;
  closeOnClickOutside?: boolean;
  closeOnItemClick?: boolean;
};
</script>

<script setup lang="ts">
import { computed, onMounted, useTemplateRef } from 'vue';
import { vOnClickOutside } from '@vueuse/components';
import { Icon } from '@iconify/vue';

import ButtonBase from '../atoms/ButtonBase.vue';

const {
  id,
  openIcon = 'tabler:caret-down-filled',
  closeIcon = 'tabler:caret-up-filled',
  direction = 'down-right',
  split = false,
  buttonProps = {},
  closeOnClickOutside = true,
  closeOnItemClick = true,
} = defineProps<DropdownBaseProps>();

const open = defineModel('open', { type: Boolean });

const emit = defineEmits({ 'action:click': (e: MouseEvent) => true });

const toggleDropdown = () => {
  console.log(`toggling dropdown from ${open.value} to ${!open.value}`);
  open.value = !open.value;
};
const closeDropdown = () => {
  console.log('closing dropdown');
  open.value = false;
};
const openDropdown = () => {
  console.log('opening dropdown');
  open.value = true;
};

defineExpose({ toggleDropdown, closeDropdown, openDropdown });

const rootRef = useTemplateRef<HTMLElement>('root');
const menuRef = useTemplateRef<HTMLElement>('menu');

const handleClickOutside = () => {
  if (closeOnClickOutside) {
    closeDropdown();
  }
};

const handleMenuClickBubbleUp = (e: MouseEvent) => {
  if (closeOnItemClick) {
    closeDropdown();
  }
  e.stopPropagation();
};

const dropdownIcon = computed(() => (open.value ? closeIcon : openIcon));

const dropdownDividerColorMap = {
  primary: 'divide-blue-300',
  secondary: 'divide-gray-300',
  danger: 'divide-red-300',
  warning: 'divide-yellow-300',
  success: 'divide-green-300',
  info: 'divide-blue-300',
  light: 'divide-gray-300',
  dark: 'divide-gray-500',
};

const dropdownDividerColor = computed(() => {
  if (!buttonProps.color) return dropdownDividerColorMap.light;
  return dropdownDividerColorMap[buttonProps.color];
});

const computedDropdownDirection = computed(() => {
  if (direction !== 'auto') {
    return direction;
  }

  const dropdown = rootRef.value;
  const dropdownMenu = menuRef.value;

  if (!dropdown || !dropdownMenu) {
    return 'down-right';
  }

  const dropdownRect = dropdown.getBoundingClientRect();

  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;

  const dropdownTop = dropdownRect.top;
  const dropdownBottom = windowHeight - dropdownRect.bottom;
  const dropdownLeft = dropdownRect.left;
  const dropdownRight = windowWidth - dropdownRect.right;

  const isTop = dropdownTop > dropdownBottom;
  const isLeft = dropdownLeft > dropdownRight;

  if (isTop && isLeft) {
    return 'up-left';
  } else if (isTop && !isLeft) {
    return 'up-right';
  } else if (!isTop && isLeft) {
    return 'down-left';
  } else {
    return 'down-right';
  }
});

const dropdownStyle = computed(() => {
  return {
    top: computedDropdownDirection.value.includes('up') ? 'auto' : '100%',
    bottom: computedDropdownDirection.value.includes('down') ? 'auto' : '100%',
    left: computedDropdownDirection.value.includes('left') ? '0' : 'auto',
    right: computedDropdownDirection.value.includes('right') ? '0' : 'auto',
  };
});

onMounted(() => {
  if (open.value === null || open.value === undefined) {
    open.value = false;
  }

  if (open.value) {
    openDropdown();
  }
});
</script>
