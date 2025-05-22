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
  height: calc(100vh - 96px);
  padding: var(--spacing-small);
  overflow: auto;
  border-radius: var(--border-radius);
  background-color: #2d2e30;
  font-family: 'Ubuntu Mono','Courier New', monospace;
  font-weight: 500;
  letter-spacing: 0.8px;
  /* 自定义滚动条 */
  scrollbar-color: #4b4b4b #2d2e30;
  scrollbar-width: thin;
}

@media (prefers-color-scheme: light) {
  .result-wrapper {
    background-color: #ebf3f5;
  }
}
</style>

