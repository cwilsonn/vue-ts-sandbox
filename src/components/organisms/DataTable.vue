<template>

</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

import { useSelectable } from '../../composables/useSelectable';
import { usePagination } from '../../composables/usePagination';
import { useFilter } from '../../composables/useFilter';
import { useSearch } from '../../composables/useSearch';
import { useSort } from '../../composables/useSort';
import BaseTable from './BaseTable.vue';
</script>
