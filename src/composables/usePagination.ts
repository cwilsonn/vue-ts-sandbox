import { type Ref, computed } from 'vue';
import { slice as _slice } from 'lodash';

export type PaginationConfig = {
  page: number;
  perPage: number;
};

export function usePagination<T>(
  data: Ref<T[]>,
  config: Ref<PaginationConfig>
) {
  const paginatedData = computed<T[]>(() =>
    _slice(
      data.value,
      (config.value.page - 1) * config.value.perPage,
      config.value.page * config.value.perPage
    )
  );

  return {
    paginatedData,
  };
}
