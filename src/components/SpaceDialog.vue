<script setup lang="ts">

defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  (e: 'on-close'): void
  (e: 'on-continue', value: boolean): void
}>()

const closeDialog = () => {
  emit('on-close')
}

const continueGeneration = (isRemoveSpace: boolean) => {
  emit('on-continue', isRemoveSpace)
}

</script>

<template>
  <!-- 检测到空格的对话框 -->
  <div v-if="visible" class="dialog-overlay">
    <div class="dialog">
      <p style="font-size: 13px; font-weight: 500;">The first character is space, Keep it or Remove it?</p>
      <div class="dialog-buttons">
        <button @click="closeDialog()">Stop</button>
        <div class="flex gap-6">
          <button @click="continueGeneration(false)">Keep</button>
          <button @click="continueGeneration(true)">Remove</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dialog {
  background: #242424;
  padding: var(--spacing-medium);
  border-radius: var(--border-radius);
  min-width: 300px;
  text-align: center;
}

.dialog-buttons {
  display: flex;
  gap: 10px;
  justify-content: space-between;
  margin-top: 20px;
}

@media (prefers-color-scheme: light) {
  .dialog {
    background: #ffffff;
  }
}
</style>