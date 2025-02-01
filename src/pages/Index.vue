<template>
  <article class="page">
    <div class="container mx-auto my-8 px-4">
      <header class="d-flex items-start">
        <h1 class="text-4xl font-bold mb-8">Hello, world!</h1>
      </header>
      <!-- #region search form -->
      <form id="search-form" class="my-4">
        <div class="flex space-x-4 items-center">
          <label for="query" class="flex-grow-1">
            <span class="font-semibold text-sm">Search</span>
            <input
              v-model="fields.query.value"
              id="query"
              name="query"
              type="text"
              placeholder="Search..."
              class="w-full p-2 border border-gray-300 rounded"
            />
          </label>
          <label for="country" class="flex-grow-1">
            <span class="font-semibold text-sm">Country</span>
            <select
              v-model="fields['address.country'].value"
              id="country"
              name="country"
              class="p-2 border border-gray-300 rounded w-full"
            >
              <option value="">All countries</option>
              <option
                v-for="country in countryOptions"
                :key="country"
                :value="country"
              >
                {{ country }}
              </option>
            </select>
          </label>
          <label for="active" class="flex-grow-1">
            <span class="font-semibold text-sm">Active</span>
            <select
              v-model="fields.active.value"
              id="active"
              name="active"
              class="p-2 border border-gray-300 rounded w-full"
            >
              <option value="">All</option>
              <option :value="true">Active</option>
              <option :value="false">Inactive</option>
            </select>
          </label>
        </div>
      </form>
      <hr class="my-4 text-stone-200" />
      <!-- #endregion -->
      <!-- #region top pagination -->
      <PaginationBase
        v-bind="paginationProps"
        v-model="paginationState.page"
        v-model:per-page="paginationState.perPage"
      />
      <!-- #endregion -->
      <!-- #region results count indicator -->
      <p class="my-2 text-gray-500 text-sm">
        <template v-if="paginatedData.length === 1">
          Showing the only result
        </template>
        <template v-else-if="paginatedData.length === filteredData.length">
          Showing all {{ filteredData.length }} results
        </template>
        <template v-else-if="paginatedData.length > 0">
          Showing
          {{ (paginationState.page - 1) * paginationState.perPage + 1 }}-{{
            Math.min(
              paginationState.page * paginationState.perPage,
              filteredData.length
            )
          }}
          of {{ filteredData.length }} results
        </template>
      </p>
      <!-- #endregion -->
      <!-- #region table -->
      <TableBase
        ref="tableRef"
        :data="paginatedData"
        :fields="tableProps.fields"
        :idKey="tableProps.idKey"
        class="mb-4"
      >
        <template
          #header="{ field }: { field: TableFieldConfig<MockDataRecord> }"
        >
          <div class="flex">
            {{ field.label }}
            <button
              v-if="field.sortable"
              @click="cycleSortMapEntry(field.key)"
              class="flex items-center space-x-1 appearance-none cursor-pointer"
              :title="`Sort by ${field.label} ${
                sortMap.has(field.key)
                  ? sortMap.get(field.key) === 'asc'
                    ? 'descending'
                    : 'ascending'
                  : 'ascending'
              }`"
            >
              <Icon
                :icon="
                  sortMap.has(field.key)
                    ? sortIcons[sortMap.get(field.key) as SortOrder]
                    : 'tabler:caret-up-down'
                "
              />
            </button>
          </div>
        </template>
        <template #header-_selected>
          <label
            for="all_filtered_data_selected"
            class="flex items-center space-x-1"
          >
            <input
              id="all_filtered_data_selected"
              name="all_filtered_data_selected"
              type="checkbox"
              :checked="allFilteredDataSelected"
              @change="
                allFilteredDataSelected
                  ? handleDeselectAllFilteredData()
                  : selectAllFilteredData()
              "
            />
          </label>
        </template>
        <template #cell-_selected="{ row }: { row: MockDataRecord }">
          <label
            :for="`selected-${row.id}`"
            class="flex items-center space-x-1"
          >
            <input
              :id="`selected-${row.id}`"
              :name="`selected-${row.id}`"
              type="checkbox"
              :checked="isFilteredDataSelected(row)"
              @change="toggleFilteredData(row)"
            />
          </label>
        </template>
        <template #cell-active="{ value }">
          <Icon
            :icon="value ? 'tabler:circle-check' : 'tabler:circle-x'"
            :class="value ? 'text-green-500' : 'text-red-500'"
          />
        </template>
        <template #cell-_actions="{ row }: { row: MockDataRecord }">
          <ButtonBase
            @click="tableRef?.toggleRowDetails(row)"
            :active="tableRef?.isRowDetailVisible(row.id)"
            size="sm"
            class="space-x-1"
          >
            <Icon
              :icon="
                tableRef?.isRowDetailVisible(row)
                  ? 'tabler:eye-off'
                  : 'tabler:eye'
              "
            />
            <span>
              {{ tableRef?.isRowDetailVisible(row) ? 'Hide' : 'Show' }}
            </span>
          </ButtonBase> </template
        >"
      </TableBase>
      <!-- #endregion -->
      <!-- #region bottom pagination -->
      <PaginationBase
        v-bind="paginationProps"
        v-model="paginationState.page"
        v-model:per-page="paginationState.perPage"
      />
      <!-- #endregion -->
    </div>
  </article>
</template>

<script setup lang="ts">
import { ref, computed, useTemplateRef } from 'vue';
import { type ComponentExposed } from 'vue-component-type-helpers';
import { Icon } from '@iconify/vue';
import { z } from 'zod';

import { type FormField } from '../types/forms';
import { useFormField } from '../composables/useFormField';
import { useForm } from '../composables/useForm';
import {
  usePagination,
  type PaginationConfig,
} from '../composables/usePagination';
import {
  useSort,
  type SortConfig,
  type SortOrder,
} from '../composables/useSort';
import { useFilter, type FilterConfig } from '../composables/useFilter';
import { useSearch, type SearchConfig } from '../composables/useSearch';
import { useSelectable } from '../composables/useSelectable';
import { useEndpointQueryParams } from '../composables/useEndpointQueryParams';

import ButtonBase from '../components/atoms/ButtonBase.vue';
import CardBase from '../components/molecules/CardBase.vue';
import DropdownBase from '../components/molecules/DropdownBase.vue';
import TableBase, {
  type TableBaseProps,
  type TableFieldConfig,
} from '../components/organisms/TableBase.vue';
import PaginationBase, {
  type PaginationBaseProps,
} from '../components/organisms/PaginationBase.vue';

// #region Data
type MockDataRecord = {
  id: number;
  name: string;
  active: true | false | null;
  age: number;
  tags: string[];
  address: { city: string; country: string };
};

const mockData = ref<MockDataRecord[]>([
  {
    id: 1,
    name: 'John Doe',
    active: true,
    age: 28,
    tags: ['developer', 'Vue.js', 'JavaScript'],
    address: { city: 'New York', country: 'USA' },
  },
  {
    id: 2,
    name: 'Jane Smith',
    active: false,
    age: 34,
    tags: ['designer', 'Figma', 'UX/UI'],
    address: { city: 'San Francisco', country: 'USA' },
  },
  {
    id: 3,
    name: 'Michael Lee',
    active: true,
    age: 22,
    tags: ['backend', 'Node.js', 'PostgreSQL'],
    address: { city: 'Los Angeles', country: 'USA' },
  },
  {
    id: 4,
    name: 'Emily Johnson',
    active: true,
    age: 40,
    tags: ['frontend', 'React', 'CSS'],
    address: { city: 'London', country: 'UK' },
  },
  {
    id: 5,
    name: 'Chris Brown',
    active: false,
    age: 30,
    tags: ['full-stack', 'Docker', 'Kubernetes'],
    address: { city: 'Toronto', country: 'Canada' },
  },
  {
    id: 6,
    name: 'Sarah Wilson',
    active: true,
    age: 26,
    tags: ['marketing', 'SEO', 'analytics'],
    address: { city: 'Paris', country: 'France' },
  },
  {
    id: 7,
    name: 'James Davis',
    active: true,
    age: 35,
    tags: ['devops', 'AWS', 'CI/CD'],
    address: { city: 'Berlin', country: 'Germany' },
  },
  {
    id: 8,
    name: 'Olivia Martinez',
    active: false,
    age: 29,
    tags: ['frontend', 'Vue.js', 'TailwindCSS'],
    address: { city: 'Madrid', country: 'Spain' },
  },
  {
    id: 9,
    name: 'David Garcia',
    active: true,
    age: 45,
    tags: ['project manager', 'Scrum', 'Agile'],
    address: { city: 'Mexico City', country: 'Mexico' },
  },
  {
    id: 10,
    name: 'Sophia Rodriguez',
    active: true,
    age: 50,
    tags: ['consultant', 'business', 'strategy'],
    address: { city: 'Sydney', country: 'Australia' },
  },
  {
    id: 11,
    name: 'Jacob Thomas',
    active: false,
    age: 27,
    tags: ['data scientist', 'Python', 'machine learning'],
    address: { city: 'Austin', country: 'USA' },
  },
  {
    id: 12,
    name: 'Isabella Lopez',
    active: true,
    age: 32,
    tags: ['product manager', 'roadmap', 'leadership'],
    address: { city: 'Rome', country: 'Italy' },
  },
  {
    id: 13,
    name: 'Ethan Wilson',
    active: false,
    age: 38,
    tags: ['designer', 'Sketch', 'UI/UX'],
    address: { city: 'Berlin', country: 'Germany' },
  },
  {
    id: 14,
    name: 'Mia Harris',
    active: true,
    age: 27,
    tags: ['developer', 'Python', 'Django'],
    address: { city: 'Amsterdam', country: 'Netherlands' },
  },
  {
    id: 15,
    name: 'Benjamin Clark',
    active: true,
    age: 41,
    tags: ['architect', 'cloud', 'Azure'],
    address: { city: 'Tokyo', country: 'Japan' },
  },
  {
    id: 16,
    name: 'Charlotte Evans',
    active: false,
    age: 33,
    tags: ['designer', 'Photoshop', 'illustrator'],
    address: { city: 'Buenos Aires', country: 'Argentina' },
  },
  {
    id: 17,
    name: 'Amelia White',
    active: true,
    age: 26,
    tags: ['data engineer', 'SQL', 'ETL'],
    address: { city: 'Cape Town', country: 'South Africa' },
  },
  {
    id: 18,
    name: 'Alexander Harris',
    active: true,
    age: 29,
    tags: ['content strategist', 'copywriting', 'content'],
    address: { city: 'Moscow', country: 'Russia' },
  },
  {
    id: 19,
    name: 'Jack Walker',
    active: false,
    age: 36,
    tags: ['sysadmin', 'Linux', 'automation'],
    address: { city: 'Dubai', country: 'UAE' },
  },
  {
    id: 20,
    name: 'Amelia Thompson',
    active: true,
    age: 43,
    tags: ['CTO', 'leadership', 'enterprise'],
    address: { city: 'Hong Kong', country: 'China' },
  },
  {
    id: 21,
    name: 'Harper Allen',
    active: true,
    age: 31,
    tags: ['developer', 'Ruby on Rails', 'JavaScript'],
    address: { city: 'Dublin', country: 'Ireland' },
  },
  {
    id: 22,
    name: 'Logan Moore',
    active: true,
    age: 24,
    tags: ['developer', 'Go', 'microservices'],
    address: { city: 'Seoul', country: 'South Korea' },
  },
  {
    id: 23,
    name: 'Avery King',
    active: false,
    age: 28,
    tags: ['marketer', 'branding', 'social media'],
    address: { city: 'Los Angeles', country: 'USA' },
  },
  {
    id: 24,
    name: 'Leo Scott',
    active: true,
    age: 49,
    tags: ['lead developer', 'team leader', 'Java'],
    address: { city: 'Singapore', country: 'Singapore' },
  },
  {
    id: 25,
    name: 'Zoe Allen',
    active: true,
    age: 22,
    tags: ['developer', 'Swift', 'iOS'],
    address: { city: 'Toronto', country: 'Canada' },
  },
  {
    id: 26,
    name: 'Liam Harris',
    active: false,
    age: 37,
    tags: ['developer', 'Angular', 'TypeScript'],
    address: { city: 'London', country: 'UK' },
  },
  {
    id: 27,
    name: 'Grace Moore',
    active: true,
    age: 29,
    tags: ['designer', 'UI/UX', 'wireframing'],
    address: { city: 'Melbourne', country: 'Australia' },
  },
]);
// #endregion

// #region Search form
type MockDataSearchForm = {
  query: FormField<string>;
  'address.country': FormField<string>;
  active: FormField<boolean | null>;
};

const { fields, values: formValues } = useForm<MockDataSearchForm>({
  query: useFormField<string>('', z.string()),
  'address.country': useFormField<string>('', z.string()),
  active: useFormField<boolean | null>(
    null,
    z.union([z.literal(true), z.literal(false), z.literal(null)])
  ),
});

const countryOptions = computed(() => [
  ...new Set(mockData.value.map((record) => record.address.country)),
]);

// #region Search
const searchState = computed<SearchConfig<MockDataRecord>>(() => ({
  query: formValues.value.query ?? '',
  queryKeys: ['name', 'tags', 'address.city', 'address.country'],
}));

const { searchedData } = useSearch<MockDataRecord>(mockData, searchState);
// #endregion

// #region Filtering
const filterState = computed<FilterConfig<MockDataRecord>>(() => ({
  active: { comparator: 'eq', value: formValues.value.active ?? null },
  'address.country': {
    comparator: 'eq',
    value: formValues.value['address.country'] ?? '',
  },
}));

const { filteredData } = useFilter<MockDataRecord>(searchedData, filterState);
// #endregion

// #region Sorting
const sortState = ref<SortConfig<MockDataRecord>>({});

const {
  sortedData,
  sortMap,
  sortBys,
  sortOrders,
  sortIcons,
  cycleSortMapEntry,
} = useSort(filteredData, sortState);
// #endregion

// #region Pagination
const paginationState = ref<PaginationConfig>({
  page: 1,
  perPage: 10,
});

const { paginatedData } = usePagination<MockDataRecord>(
  sortedData,
  paginationState
);
// #endregion
// #endregion

// #region Table
const tableRef = useTemplateRef<ComponentExposed<typeof TableBase> | null>(
  'tableRef'
);

const tableProps = computed<TableBaseProps<MockDataRecord>>(() => ({
  idKey: 'id',
  fields: [
    { key: '_selected', label: '+', sortable: true, filterable: true },
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      filterable: true,
      searchable: true,
    },
    { key: 'active', label: 'Active', sortable: true, filterable: true },
    { key: 'age', label: 'Age', sortable: true },
    {
      key: 'tags',
      label: 'Tags',
      formatter: (tags: string[]) => tags.join(', '),
    },
    {
      key: 'address.city',
      label: 'City',
      sortable: true,
      filterable: true,
      searchable: true,
    },
    {
      key: 'address.country',
      label: 'Country',
      sortable: true,
      filterable: true,
      searchable: true,
    },
    {
      key: '_actions',
      label: 'Actions',
      sortable: false,
      filterable: false,
      searchable: false,
    },
    {
      key: '_customField',
      label: 'Custom Field',
      sortable: false,
      filterable: false,
      searchable: false,
    },
  ],
}));

// #region Row selection
const {
  // selected,
  select,
  deselect,
  deselectAll,
} = useSelectable(mockData, { idKey: 'id' });

const {
  allSelected: allFilteredDataSelected,
  // selected: selectedFilteredData,
  isSelected: isFilteredDataSelected,
  selectAll: selectAllFilteredData,
  deselectAll: deselectAllFilteredData,
  select: selectFilteredData,
  deselect: deselectFilteredData,
} = useSelectable(searchedData, { idKey: 'id' });

const toggleFilteredData = (row: MockDataRecord) => {
  if (isFilteredDataSelected(row)) {
    deselect(row);
    deselectFilteredData(row);
  } else {
    select(row);
    selectFilteredData(row);
  }
};

const handleDeselectAllFilteredData = () => {
  deselectAll();
  deselectAllFilteredData();
};
// #endregion

// #region Pagination
const paginationProps = computed<PaginationBaseProps>(() => ({
  total: sortedData.value.length,
  dynamicPerPage: true,
}));
// #endregion
// #endregion

// #region filter query params
const { endpointParams } = useEndpointQueryParams({
  search: searchState,
  filter: filterState,
  sort: { bys: sortBys, orders: sortOrders },
  pagination: paginationState,
});
// #endregion
</script>
