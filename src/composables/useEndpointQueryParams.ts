import { computed, watch, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQueryParams } from './useQueryParams';

export function useEndpointQueryParams(params: any, namespace?: string) {
  const { parseQuery } = useQueryParams();
  const router = useRouter();
  const route = useRoute();

  const reactiveParams = reactive(params);

  const endpointParams = computed(() => ({
    query: reactiveParams.search.query,
    queryKeys: reactiveParams.search.searchKeys,
    filter: reactiveParams.filter,
    sort: reactiveParams.sort,
    page: reactiveParams.pagination.page,
    perPage: reactiveParams.pagination.perPage,
  }));

  watch(endpointParams, (newParams) => {
    let newQuery: Record<string, any> = route.query;

    if (namespace) {
      newQuery[namespace] = newParams;
    } else {
      newQuery = newParams;
    }

    router.push({
      query: {
        ...newQuery,
      },
    });
  }, { deep: true });

  return {
    endpointParams,
  };
}
