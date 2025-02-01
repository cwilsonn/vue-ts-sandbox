import { type Ref, computed } from 'vue';
import { orderBy as _orderBy } from 'lodash';
import { type Path } from '../types';

export const sortOrderOpts = {
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

export type SortOrder = keyof typeof sortOrderOpts;

export type SortGroup<T> = {
  key: Path<T>;
  order: SortOrder;
};

export type SortConfig<T> =
  | SortGroup<T>[]
  | {
      [K in Path<T>]?: SortOrder;
    };

// Helper function to convert SortConfig to Map
const getSortMap = <T>(config: SortConfig<T>): Map<Path<T>, SortOrder> => {
  if (Array.isArray(config)) {
    return new Map(config.map((sort) => [sort.key, sort.order]));
  } else {
    return new Map(Object.entries(config) as [Path<T>, SortOrder][]);
  }
};

// Helper function to convert Map to SortConfig
const getSortConfigFromMap = <T>(
  sortMap: Map<Path<T>, SortOrder>
): SortConfig<T> => {
  return Array.from(sortMap.entries()).map(([key, order]) => ({ key, order }));
};

export function useSort<T>(data: Ref<T[]>, config: Ref<SortConfig<T>>) {
  const sortMap = computed(() => getSortMap(config.value));

  const sortBys = computed(() => Array.from(sortMap.value.keys()));
  const sortOrders = computed(() => Array.from(sortMap.value.values()));

  const setSortMapEntry = (key: Path<T>, order: SortOrder) => {
    const newSortMap = new Map(sortMap.value);
    newSortMap.set(key, order);
    config.value = getSortConfigFromMap(newSortMap);
  };

  const deleteSortMapEntry = (key: Path<T>) => {
    const newSortMap = new Map(sortMap.value);
    newSortMap.delete(key);
    config.value = getSortConfigFromMap(newSortMap);
  };

  const cycleSortMapEntry = (key: Path<T>) => {
    const currentOrder = sortMap.value.get(key);
    if (currentOrder === undefined) {
      setSortMapEntry(key, sortOrderOpts.asc);
    } else if (currentOrder === sortOrderOpts.asc) {
      setSortMapEntry(key, sortOrderOpts.desc);
    } else {
      deleteSortMapEntry(key);
    }
  };

  const sortedData = computed(() => {
    const keys = Array.from(sortMap.value.keys());
    const orders = Array.from(sortMap.value.values());
    return _orderBy(data.value, keys, orders);
  });

  return {
    sortLabels,
    sortLabelsShort,
    sortIcons,
    sortMap,
    sortBys,
    sortOrders,
    sortedData,
    setSortMapEntry,
    cycleSortMapEntry,
  };
}
