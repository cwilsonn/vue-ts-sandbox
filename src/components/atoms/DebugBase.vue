<template>
  <details :open="open">
    <summary>
      <slot name="summary">{{ summary }}</slot>
    </summary>
    <code>
      <pre><slot></slot></pre>
    </code>
  </details>
</template>

<script setup lang="ts">
const {
  summary = 'Debug',
}: {
  summary?: string;
} = defineProps<{
  summary: string;
}>();

const open = defineModel('open', {
  type: Boolean,
  default: false,
});
</script>
