<template>
  <table class="w-full table-fixed">
    <caption>
      <slot name="caption"></slot>
    </caption>
    <thead>
      <tr :class="{ 'border-b border-gray-300': border }">
        <th v-for="field in fields" :key="field.key" class="text-start font-semibold px-2 py-2">
          <slot :name="`header-${field.key}`" v-bind="{ field }">
            <slot name="header" v-bind="{ field }">
              {{ field.label }}
            </slot>
          </slot>
        </th>
      </tr>
    </thead>
    <tbody>
      <template v-if="data?.length" v-for="row, rowIndex in data" :key="row[idKey]">
        <slot name="row" v-bind="{ row, rowIndex }">
          <tr v-if="!$slots.row" :class="{
            'bg-gray-100': striped && rowIndex % 2 === 0,
            'hover:bg-gray-200 transition-colors': hover,
            'border-b border-gray-300': border,
          }">
            <td v-for="field in fields" :key="field.key" class="px-2 py-2">
              <slot :name="`cell-${field.key}`" v-bind="{ ...getCellProps(row, field) }">
                <slot name="cell" v-bind="{ ...getCellProps(row, field) }">
                  {{ field.formatter ? field.formatter(_get(row, field.key)) : _get(row, field.key) }}
                </slot>
              </slot>
            </td>
          </tr>
        </slot>
        <slot v-if="isRowDetailVisible(row)" name="details" v-bind="{ row, rowIndex }">
          <tr :class="{
            'bg-gray-100': striped && rowIndex % 2 === 0,
            'hover:bg-gray-150 transition-colors': hover,
            'border-b border-gray-300': border,
          }">
            <td :colspan="fields.length" class="px-2 py-2">
              <pre>{{ JSON.stringify(row, null, 2) }}</pre>
            </td>
          </tr>
        </slot>
      </template>
      <tr v-else>
        <td :colspan="fields.length" class="text-center py-4 text-gray-500">
          <slot name="empty">No data available</slot>
        </td>
      </tr>
    </tbody>
    <tfoot>
      <slot name="footer"></slot>
    </tfoot>
  </table>
</template>

<script setup lang="ts" generic="T">
import { get as _get } from 'lodash';
import { type Path } from '../../types/path';
import { useSelectable } from '../../composables/useSelectable';

export type InternalFieldKeys = `_selected` | `_actions` | `_${string}`;

export type TableFieldConfig<T> = {
  key: Path<T> | InternalFieldKeys;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  searchable?: boolean;
  formatter?: (value: any) => string;
};

export type TableFieldsConfig<T> = TableFieldConfig<T>[];

export type BaseTableProps<T> = {
  fields: TableFieldsConfig<T>;
  idKey: keyof T;
  striped?: boolean;
  hover?: boolean;
  border?: true | false;
};

export type BaseTableSlots<T> = {
  caption: {};
  header: { field: TableFieldConfig<T> };
  row: { row: T; rowIndex: number };
  cell: { row: T; field: TableFieldConfig<T>; value: any; formattedValue: string };
  details: { row: T; rowIndex: number };
  empty: {};
  footer: {};
} & {
  [K in `header-${string}`]: { field: TableFieldConfig<T> };
} & {
  [K in `row-${string}`]: { row: T; rowIndex: number };
} & {
  [K in `cell-${string}`]: { row: T; field: TableFieldConfig<T>; value: any; formattedValue: string };
} & {
  [K in `details-${string}`]: { row: T; rowIndex: number };
}

const slots = defineSlots<BaseTableSlots<T>>();

const {
  fields = [],
  idKey,
  striped = true,
  hover = true,
  border = true,
} = defineProps<BaseTableProps<T>>();

const data = defineModel<T[]>('data', { type: Array, required: true });

const getCellProps = (row: T, field: TableFieldConfig<T>) => ({
  row,
  field,
  value: _get(row, field.key),
  formattedValue: field.formatter
    ? field.formatter(_get(row, field.key))
    : _get(row, field.key),
});

const {
  isSelected: isRowDetailVisible,
  toggle: toggleRowDetails
} = useSelectable<T>(data, { idKey });

defineExpose({ isRowDetailVisible, toggleRowDetails });
</script>