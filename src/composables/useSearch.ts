import { type ComputedRef, type Ref, computed } from 'vue';
import { filter as _filter, get as _get } from 'lodash';
import { type Path } from '../types/path';

export type SearchConfig<T> = {
  query: string;
  queryKeys: Path<T>[];
};

export function useSearch<T>(data: Ref<T[]>, config: Ref<SearchConfig<T>> | ComputedRef<SearchConfig<T>>) {
  const searchedData = computed<T[]>(() =>
    _filter(data.value, (item) =>
      config.value.queryKeys.some((key) => {
        const value = _get(item, key);
        // TODO: Research if using JSON.stringify is the best way to 
        // compare values of different types.
        return JSON.stringify(value).toLowerCase()
          .includes(config.value.query.toLowerCase());
      })));

  return { searchedData };
}
