import { createRouter, createWebHistory } from 'vue-router';
import qs from 'qs';

export const routes = [
  {
    name: 'index',
    path: '/',
    component: () => import('../pages/Index.vue'),
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
  parseQuery: qs.parse,
  stringifyQuery: (query) =>
    qs.stringify(query, { encode: false, arrayFormat: 'brackets' }),
});
