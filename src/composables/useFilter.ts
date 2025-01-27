import { type Ref, computed } from 'vue';
import { get as _get } from 'lodash';
import { type Path } from '../types';

import {
  filter as _filter,
  includes as _includes,
  isEqual as _isEqual,
  lt as _lt,
  lte as _lte,
  gt as _gt,
  gte as _gte,
  negate as _negate
} from 'lodash';

export const filterComparators = {
  eq: 'eq',
  ne: 'ne',
  lt: 'lt',
  lte: 'lte',
  gt: 'gt',
  gte: 'gte',
  in: 'in',
  nin: 'nin',
} as const;

export const filterComparatorLabels = {
  eq: 'Equal',
  ne: 'Not equal',
  lt: 'Less than',
  lte: 'Less than or equal',
  gt: 'Greater than',
  gte: 'Greater than or equal',
  in: 'In',
  nin: 'Not in',
};

export const filterComparatorSymbols = {
  eq: '==',
  ne: '≠',
  lt: '<',
  lte: '≤',
  gt: '>',
  gte: '≥',
  in: '∈',
  nin: '∉',
};

export type FilterComparator = keyof typeof filterComparators;

export type FilterGroup = {
  comparator: FilterComparator;
  value: any;
};

export type FilterConfig<T> = {
  [K in Path<T>]?: FilterGroup;
};

export function useFilter<T>(data: Ref<T[]>, config: Ref<FilterConfig<T>>) {
  const filteredData = computed<T[]>(() =>
    _filter(data.value, (item) =>
      Object.entries(config.value).every(([key, filter]) => {
        const typedFilter = filter as FilterGroup;
        if (typedFilter.value === null || typedFilter.value === '') return true;

        const value = _get(item, key);

        switch (typedFilter.comparator) {
          case 'eq':
            return _isEqual(value, typedFilter.value);
          case 'ne':
            return !_isEqual(value, typedFilter.value);
          case 'lt':
            return _lt(value, typedFilter.value);
          case 'lte':
            return _lte(value, typedFilter.value);
          case 'gt':
            return _gt(value, typedFilter.value);
          case 'gte':
            return _gte(value, typedFilter.value);
          case 'in':
            return Array.isArray(typedFilter.value) && typedFilter.value.includes(value);
          case 'nin':
            return Array.isArray(typedFilter.value) && !typedFilter.value.includes(value);
          default:
            throw new Error(`Unknown comparator: ${typedFilter.comparator}`);
        }
      })));

  return {
    filterComparators,
    filterComparatorLabels,
    filterComparatorSymbols,
    filteredData,
  };
}
