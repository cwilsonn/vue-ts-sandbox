<template>
  <KeepAlive>
    <RouterView v-slot="{ Component }">
      <component :is="Component" />
    </RouterView>
  </KeepAlive>
</template>
