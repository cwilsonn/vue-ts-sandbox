<template>
  <nav
    aria-label="Pagination"
    class="flex items-center justify-between flex-row-reverse space-x-2"
  >
    <ul class="flex">
      <li v-if="includeFirstLast">
        <ButtonBase
          @click="currentPage = 1"
          :disabled="currentPage === 1"
          :rounded="false"
          size="sm"
          class="rounded-l"
          v-bind="buttonProps"
          title="First page"
        >
          <span class="sr-only">First page</span>
          <slot name="first"> &laquo; </slot>
        </ButtonBase>
      </li>
      <li v-if="includePrevNext">
        <ButtonBase
          @click="currentPage -= 1"
          :disabled="currentPage === 1"
          :rounded="false"
          size="sm"
          v-bind="buttonProps"
          title="Previous page"
        >
          <span class="sr-only">Previous page</span>
          <slot name="prev"> &lsaquo; </slot>
        </ButtonBase>
      </li>
      <li v-for="button in pagesWindow" :key="button">
        <ButtonBase
          @click="currentPage = button"
          :rounded="false"
          size="sm"
          :active="currentPage === button"
          v-bind="buttonProps"
        >
          {{ button }}
        </ButtonBase>
      </li>
      <li v-if="includePrevNext">
        <ButtonBase
          @click="currentPage += 1"
          :disabled="currentPage === totalPages"
          :rounded="false"
          size="sm"
          v-bind="buttonProps"
          title="Next page"
        >
          <span class="sr-only">Next page</span>
          <slot name="next"> &rsaquo; </slot>
        </ButtonBase>
      </li>
      <li v-if="includeFirstLast">
        <ButtonBase
          @click="currentPage = totalPages"
          :disabled="currentPage === totalPages"
          :rounded="false"
          size="sm"
          class="rounded-r"
          v-bind="buttonProps"
          title="Last page"
        >
          <span class="sr-only">Last page</span>
          <slot name="last"> &raquo; </slot>
        </ButtonBase>
      </li>
    </ul>
    <label v-if="dynamicPerPage" for="pagination">
      Per page:
      <select
        v-model="perPage"
        id="pagination"
        class="border border-gray-300 rounded-md"
      >
        <option
          v-for="option in [5, 10, 25, 50, 75, 100]"
          :key="option"
          :value="option"
        >
          {{ option }}
        </option>
      </select>
    </label>
  </nav>
</template>

<script lang="ts">
import { type ButtonBaseProps } from '../atoms/ButtonBase.vue';

export type PaginationBaseProps = {
  total: number;
  dynamicPerPage?: boolean; // If true, a select input will be shown to allow the user to change the number of items per page.
  maxButtons?: number;
  includeFirstLast?: boolean;
  includePrevNext?: boolean;
  buttonProps?: Pick<ButtonBaseProps, 'color' | 'size'>;
};
</script>

<script setup lang="ts">
import { computed } from 'vue';

import ButtonBase from '../atoms/ButtonBase.vue';

const {
  total,
  dynamicPerPage = false,
  maxButtons = 5,
  includeFirstLast = true,
  includePrevNext = true,
  buttonProps,
} = defineProps<PaginationBaseProps>();

const currentPage = defineModel<number>('modelValue', {
  type: Number,
  default: 1,
});
const perPage = defineModel('perPage', { type: Number, default: 10 });

const totalPages = computed(() => Math.ceil(total / perPage.value));

const pagesWindow = computed(() => {
  const windowSize = Math.min(totalPages.value, maxButtons);
  const halfWindow = Math.floor(windowSize / 2);
  let start = Math.max(currentPage.value - halfWindow, 1);
  let end = start + windowSize - 1;

  if (end > totalPages.value) {
    end = totalPages.value;
    start = Math.max(end - windowSize + 1, 1);
  }

  return Array.from({ length: windowSize }, (_, i) => start + i);
});
</script>
