<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ 
  info: {
    title: String,
    value: String
  },
}>()


</script>

<template>
  <div class="flex v-center info-setting">
    <div class="info-title">{{ info.title }}</div>
    <input class="input-xl" type="file" :v-model="info.value">
  </div>
</template>

<style scoped>

</style>
