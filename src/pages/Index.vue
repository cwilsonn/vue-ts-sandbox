<template>
  <article class="page">
    <div class="container mx-auto my-8 px-4">
      <h1 class="text-4xl font-bold mb-8">Hello, world!</h1>
      <!-- #region search form -->
      <form id="search-form" class="my-4">
        <div class="flex space-x-4 items-center">
          <label for="query" class="flex-grow-1">
            <span class="font-semibold text-sm">Search</span>
            <input v-model="searchState.query" id="query" name="query" type="text" placeholder="Search..."
              class="w-full p-2 border border-gray-300 rounded" />
          </label>
          <label for="country" class="flex-grow-1">
            <span class="font-semibold text-sm">Country</span>
            <select v-model="filterState['address.country'].value" id="country" name="country"
              class="p-2 border border-gray-300 rounded w-full">
              <option value="">All countries</option>
              <option v-for="country in countryOptions" :key="country" :value="country">{{ country }}</option>
            </select>
          </label>
          <label for="active" class="flex-grow-1">
            <span class="font-semibold text-sm">Active</span>
            <select v-model="filterState.active.value" id="active" name="active"
              class="p-2 border border-gray-300 rounded w-full">
              <option value="">All</option>
              <option :value="true">Active</option>
              <option :value="false">Inactive</option>
            </select>
          </label>
        </div>
      </form>
      <hr class="my-4 text-stone-200" />
      <!-- #endregion -->
      <!-- #region results count indicator -->
      <p class="mb-2">
        <template v-if="paginatedData.length === 1">
          Showing the only result
        </template>
        <template v-else-if="paginatedData.length === filteredData.length">
          Showing all {{ filteredData.length }} results
        </template>
        <template v-else-if="paginatedData.length > 0">
          Showing {{ (paginationState.page - 1) * paginationState.perPage + 1 }}-{{
            Math.min(paginationState.page *
              paginationState.perPage, filteredData.length) }} of {{
            filteredData.length }} results
        </template>
      </p>
      <!-- #endregion -->
      <!-- #region top pagination -->
      <PaginationBase v-bind="paginationProps" v-model="paginationState.page"
        v-model:per-page="paginationState.perPage" />
      <!-- #endregion -->
      <!-- #region table -->
      <TableBase ref="tableRef" v-bind="tableProps" class="mb-4">
        <template #header="{ field }: { field: TableFieldConfig<MockDataRecord> }">
          <div class="flex">
            {{ field.label }}
            <button v-if="field.sortable" @click="cycleSortMapEntry(field.key)"
              class="flex items-center space-x-1 appearance-none cursor-pointer" :title="`Sort by ${field.label} ${sortMap.has(field.key) ? sortMap.get(field.key) === 'asc' ? 'descending' : 'ascending' : 'ascending'
                }`">
              <Icon :icon="sortMap.has(field.key)
                ? sortIcons[sortMap.get(field.key) as SortOrder]
                : 'tabler:caret-up-down'" />
            </button>
          </div>
        </template>
        <template #header-_selected>
          <label for="allSelected" class="flex items-center space-x-1">
            <input id="allSelected" name="allSelected" type="checkbox" :checked="allSelected" @change="(e: Event) => {
              allSelected = (e!.target as HTMLInputElement).checked;
            }" />
          </label>
        </template>
        <template #cell-_selected="{ row }: { row: MockDataRecord }">
          <label for="selected" class="flex items-center space-x-1">
            <input id="selected" name="selected" type="checkbox" :checked="isSelected(row.id)" @change="(e: Event) => {
              (e!.target as HTMLInputElement).checked ? select(row.id) : deselect(row.id);
            }" />
          </label>
        </template>
        <template #cell-active="{ value }">
          <Icon :icon="value ? 'tabler:circle-check' : 'tabler:circle-x'"
            :class="value ? 'text-green-500' : 'text-red-500'" />
        </template>
        <template #cell-_actions="{ row }: { row: MockDataRecord }">
          <ButtonBase @click="tableRef?.toggleRowDetails(row.id)" :active="tableRef?.isRowDetailVisible(row.id)"
            size="sm" class="space-x-1">
            <!-- <span class="inline-flex items-center space-x-2"> -->
            <Icon :icon="tableRef?.isRowDetailVisible(row.id) ? 'tabler:eye-off' : 'tabler:eye'" />
            <span>
              {{ tableRef?.isRowDetailVisible(row.id) ? 'Hide' : 'Show' }}
            </span>
            <!-- </span> -->
          </ButtonBase>
        </template>"
      </TableBase>
      <!-- #endregion -->
      <!-- #region bottom pagination -->
      <PaginationBase v-bind="paginationProps" v-model="paginationState.page"
        v-model:per-page="paginationState.perPage" />
      <!-- #endregion -->
    </div>
  </article>
</template>

<script setup lang="ts">
import { ref, computed, watch, useTemplateRef } from 'vue';
import { useRouter } from 'vue-router';
import { type ComponentExposed } from 'vue-component-type-helpers';
import { Icon } from '@iconify/vue';
import qs from 'qs';

import { usePagination, type PaginationConfig } from '../composables/usePagination';
import { useSort, type SortConfig, type SortOrder } from '../composables/useSort';
import { useFilter, type FilterConfig } from '../composables/useFilter';
import { useSearch, type SearchConfig } from '../composables/useSearch';
import { useSelectable } from '../composables/useSelectable';
import TableBase, { type TableBaseProps, type TableFieldConfig } from '../components/organisms/TableBase.vue';
import PaginationBase, { type PaginationBaseProps } from '../components/organisms/PaginationBase.vue';
import ButtonBase from '../components/atoms/ButtonBase.vue';

const router = useRouter();

type MockDataRecord = {
  _selected?: boolean;
  _actions?: never;
  id: number;
  name: string;
  active: boolean;
  age: number;
  tags: string[];
  address: { city: string; country: string };
};

const mockData = ref<MockDataRecord[]>([
  {
    id: 1,
    name: "John Doe",
    active: true,
    age: 28,
    tags: ["developer", "Vue.js", "JavaScript"],
    address: { city: "New York", country: "USA" }
  },
  {
    id: 2,
    name: "Jane Smith",
    active: false,
    age: 34,
    tags: ["designer", "Figma", "UX/UI"],
    address: { city: "San Francisco", country: "USA" }
  },
  {
    id: 3,
    name: "Michael Lee",
    active: true,
    age: 22,
    tags: ["backend", "Node.js", "PostgreSQL"],
    address: { city: "Los Angeles", country: "USA" }
  },
  {
    id: 4,
    name: "Emily Johnson",
    active: true,
    age: 40,
    tags: ["frontend", "React", "CSS"],
    address: { city: "London", country: "UK" }
  },
  {
    id: 5,
    name: "Chris Brown",
    active: false,
    age: 30,
    tags: ["full-stack", "Docker", "Kubernetes"],
    address: { city: "Toronto", country: "Canada" }
  },
  {
    id: 6,
    name: "Sarah Wilson",
    active: true,
    age: 26,
    tags: ["marketing", "SEO", "analytics"],
    address: { city: "Paris", country: "France" }
  },
  {
    id: 7,
    name: "James Davis",
    active: true,
    age: 35,
    tags: ["devops", "AWS", "CI/CD"],
    address: { city: "Berlin", country: "Germany" }
  },
  {
    id: 8,
    name: "Olivia Martinez",
    active: false,
    age: 29,
    tags: ["frontend", "Vue.js", "TailwindCSS"],
    address: { city: "Madrid", country: "Spain" }
  },
  {
    id: 9,
    name: "David Garcia",
    active: true,
    age: 45,
    tags: ["project manager", "Scrum", "Agile"],
    address: { city: "Mexico City", country: "Mexico" }
  },
  {
    id: 10,
    name: "Sophia Rodriguez",
    active: true,
    age: 50,
    tags: ["consultant", "business", "strategy"],
    address: { city: "Sydney", country: "Australia" }
  },
  {
    id: 11,
    name: "Jacob Thomas",
    active: false,
    age: 27,
    tags: ["data scientist", "Python", "machine learning"],
    address: { city: "Austin", country: "USA" }
  },
  {
    id: 12,
    name: "Isabella Lopez",
    active: true,
    age: 32,
    tags: ["product manager", "roadmap", "leadership"],
    address: { city: "Rome", country: "Italy" }
  },
  {
    id: 13,
    name: "Ethan Wilson",
    active: false,
    age: 38,
    tags: ["designer", "Sketch", "UI/UX"],
    address: { city: "Berlin", country: "Germany" }
  },
  {
    id: 14,
    name: "Mia Harris",
    active: true,
    age: 27,
    tags: ["developer", "Python", "Django"],
    address: { city: "Amsterdam", country: "Netherlands" }
  },
  {
    id: 15,
    name: "Benjamin Clark",
    active: true,
    age: 41,
    tags: ["architect", "cloud", "Azure"],
    address: { city: "Tokyo", country: "Japan" }
  },
  {
    id: 16,
    name: "Charlotte Evans",
    active: false,
    age: 33,
    tags: ["designer", "Photoshop", "illustrator"],
    address: { city: "Buenos Aires", country: "Argentina" }
  },
  {
    id: 17,
    name: "Amelia White",
    active: true,
    age: 26,
    tags: ["data engineer", "SQL", "ETL"],
    address: { city: "Cape Town", country: "South Africa" }
  },
  {
    id: 18,
    name: "Alexander Harris",
    active: true,
    age: 29,
    tags: ["content strategist", "copywriting", "content"],
    address: { city: "Moscow", country: "Russia" }
  },
  {
    id: 19,
    name: "Jack Walker",
    active: false,
    age: 36,
    tags: ["sysadmin", "Linux", "automation"],
    address: { city: "Dubai", country: "UAE" }
  },
  {
    id: 20,
    name: "Amelia Thompson",
    active: true,
    age: 43,
    tags: ["CTO", "leadership", "enterprise"],
    address: { city: "Hong Kong", country: "China" }
  },
  {
    id: 21,
    name: "Harper Allen",
    active: true,
    age: 31,
    tags: ["developer", "Ruby on Rails", "JavaScript"],
    address: { city: "Dublin", country: "Ireland" }
  },
  {
    id: 22,
    name: "Logan Moore",
    active: true,
    age: 24,
    tags: ["developer", "Go", "microservices"],
    address: { city: "Seoul", country: "South Korea" }
  },
  {
    id: 23,
    name: "Avery King",
    active: false,
    age: 28,
    tags: ["marketer", "branding", "social media"],
    address: { city: "Los Angeles", country: "USA" }
  },
  {
    id: 24,
    name: "Leo Scott",
    active: true,
    age: 49,
    tags: ["lead developer", "team leader", "Java"],
    address: { city: "Singapore", country: "Singapore" }
  },
  {
    id: 25,
    name: "Zoe Allen",
    active: true,
    age: 22,
    tags: ["developer", "Swift", "iOS"],
    address: { city: "Toronto", country: "Canada" }
  },
  {
    id: 26,
    name: "Liam Harris",
    active: false,
    age: 37,
    tags: ["developer", "Angular", "TypeScript"],
    address: { city: "London", country: "UK" }
  },
  {
    id: 27,
    name: "Grace Moore",
    active: true,
    age: 29,
    tags: ["designer", "UI/UX", "wireframing"],
    address: { city: "Melbourne", country: "Australia" }
  }
]);

const searchState = ref<SearchConfig<MockDataRecord>>({
  searchKeys: ['name', 'tags', 'address.city', 'address.country'],
  query: '',
});
const { searchedData } = useSearch(mockData, searchState);

const countryOptions = computed(() => [
  ...new Set(mockData.value.map((record) => record.address.country)),
]);

const filterState = ref<FilterConfig<MockDataRecord>>({
  active: { comparator: 'eq', value: null },
  'address.country': { comparator: 'eq', value: null },
});
const filterKeysToValues = computed(() => Object.fromEntries(
  Object.entries(filterState.value).map(([key, { value }]) => [key, value])
));
const { filteredData } = useFilter(searchedData, filterState);

const sortState = ref<SortConfig<MockDataRecord>>([
  // { key: 'name', order: 'asc' },
]);
const { sortedData, sortMap, sortIcons, cycleSortMapEntry } = useSort(filteredData, sortState);

const paginationState = ref<PaginationConfig>({
  page: 1,
  perPage: 10,
});
const { paginatedData } = usePagination(sortedData, paginationState);

const {
  isSelected,
  select,
  deselect,
  selectAll,
  deselectAll,
  allSelected
} = useSelectable(filteredData, { key: 'id' });

const endpointParams = computed(() => ({
  query: searchState.value.query,
  searchKeys: searchState.value.searchKeys,
  filter: filterKeysToValues.value,
  sort: sortState.value,
  page: paginationState.value.page,
  perPage: paginationState.value.perPage,
}));

// Keep route query in sync with search, filter, sort, and pagination states
watch(endpointParams, (params) => {
  router.replace({
    // query: { demoTable: { ...params } }
    query: { demoTable: qs.stringify(params, { encode: false, arrayFormat: 'brackets' }) }
  });
}, { deep: true });

const tableRef = useTemplateRef<ComponentExposed<typeof TableBase> | null>('tableRef');

const tableProps = computed<TableBaseProps<MockDataRecord>>(() => ({
  data: paginatedData.value,
  fields: [
    { key: '_selected', label: '+', sortable: true, filterable: true },
    { key: 'name', label: 'Name', sortable: true, filterable: true, searchable: true },
    { key: 'active', label: 'Active', sortable: true, filterable: true },
    { key: 'age', label: 'Age', sortable: true },
    { key: 'tags', label: 'Tags', formatter: (tags: string[]) => tags.join(', ') },
    { key: 'address.city', label: 'City', sortable: true, filterable: true, searchable: true },
    { key: 'address.country', label: 'Country', sortable: true, filterable: true, searchable: true },
    { key: '_actions', label: 'Actions', sortable: false, filterable: false, searchable: false },
  ],
  rowIdKey: 'id',
}));

const paginationProps = computed<PaginationBaseProps>(() => ({
  total: sortedData.value.length,
  dynamicPerPage: true,
}));
</script>
