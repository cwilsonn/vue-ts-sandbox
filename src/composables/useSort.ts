import { type Ref, computed } from 'vue';
import { orderBy as _orderBy } from 'lodash';

import { type Path } from '../types';

export const sortOrders = {
  asc: 'asc',
  desc: 'desc',
} as const;

export const sortLabels = {
  asc: 'Ascending',
  desc: 'Descending',
};

export const sortLabelsShort = {
  asc: 'Asc',
  desc: 'Desc',
};

export const sortIcons = {
  asc: 'tabler:caret-up-filled',
  desc: 'tabler:caret-down-filled',
};

export type SortOrder = keyof typeof sortOrders;

export type SortGroup<T> = {
  key: Path<T>;
  order: SortOrder;
};

export type SortConfig<T> = SortGroup<T>[] | {
  [K in Path<T>]?: SortOrder;
};

export function useSort<T>(data: Ref<T[]>, config: Ref<SortConfig<T>>) {
  const sortMap = computed<Map<Path<T>, SortOrder>>(() => getSortMap(config.value));

  const getSortMap = (config: SortConfig<T>): Map<Path<T>, SortOrder> => {
    if (Array.isArray(config)) {
      return new Map(config.map((sort) => [sort.key, sort.order]));
    } else {
      return new Map(Object.entries(config) as [Path<T>, SortOrder][]);
    }
  }

  const setSortMapEntry = (key: Path<T>, order: SortOrder) => {
    const newSortMap = new Map(sortMap.value);
    newSortMap.set(key, order);
    config.value = Array.from(newSortMap.entries()).map(([key, order]) => ({ key, order }));
  };

  const deleteSortMapEntry = (key: Path<T>) => {
    const newSortMap = new Map(sortMap.value);
    newSortMap.delete(key);
    config.value = Array.from(newSortMap.entries()).map(([key, order]) => ({ key, order }));
  };

  const cycleSortMapEntry = (key: Path<T>) => {
    // Need to cycle through 3 states: undefined, asc, desc
    const currentOrder = sortMap.value.get(key);
    currentOrder === undefined
      ? setSortMapEntry(key, sortOrders.asc)
      : currentOrder === sortOrders.asc
        ? setSortMapEntry(key, sortOrders.desc)
        : deleteSortMapEntry(key);
  };

  const sortedData = computed<T[]>(() =>
    _orderBy(
      data.value,
      Array.from(sortMap.value.keys()),
      Array.from(sortMap.value.values()),
    ));

  return {
    sortLabels,
    sortLabelsShort,
    sortIcons,
    sortMap,
    sortedData,
    setSortMapEntry,
    cycleSortMapEntry,
  };
}
