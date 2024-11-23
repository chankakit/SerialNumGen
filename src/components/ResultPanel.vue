<script lang="ts" setup>

defineProps<{
  resultString: string
}>()

</script>

<template>
  <div class="result-wrapper">
    <h3 style="margin: 8px 0 ;">
      Result: {{ resultString.split('\n').length - 2 }} lines
    </h3>
    <span style="white-space: pre;">{{ resultString }}</span>
  </div>
</template>

<style scoped>
.result-wrapper {
  width: 320px;
  height: 640px;
  padding: var(--spacing-small);
  overflow: scroll;
  border-radius: var(--border-radius);
  background-color: #2d2e30;
}

@media (prefers-color-scheme: light) {
  .result-wrapper {
    background-color: #ebf3f5;
  }
}
</style>

