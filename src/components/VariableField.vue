<script setup lang="ts">
import type { Field, ValuePart } from '../types/field'

const props = defineProps<{
  field: Field
}>()

const emit = defineEmits<{
  (e: 'delete'): void
  (e: 'update:field', value: Field): void
}>()


/** 
 * 处理长度更新
 */
const handleLengthChange = (part: ValuePart) => {
  if (!part.fixed) {
    // 根据 length 更新 end 值
    const endNum = Number(part.length) * part.step + Number(part.start) - 1
    part.end = String(endNum).padStart(part.start.length, '0')
  }
  handleValueChange()
}

// 处理字段值变化
const handleValueChange = () => {
  emit('update:field', props.field)
}

/** 
 * 添加新的字段值部分
 */
const addValuePart = () => {
  props.field.valueParts.push({
    start: '',
    end: '',
    step: 1,
    fixed: false,
    length: 0
  })
  handleValueChange()
}

/** 
 * 删除字段值部分
 */
const deleteValuePart = (index: number) => {
  props.field.valueParts.splice(index, 1)
  handleValueChange()
}

/** 
 * 切换固定/变量模式
 */
const toggleFixed = (part: ValuePart) => {
  part.fixed = !part.fixed
  handleValueChange()
}
</script>

<template>
  <div class="flex" style="flex-direction: column; gap: 8px;">
    <div class="flex v-center info-setting">
      <div class="info-title">Name</div>
      <input type="text" v-model="field.name" @input="handleValueChange">
      <button class="danger-bg" @click="$emit('delete')">
        Delete Variable
      </button>
    </div>

    <div class="flex v-center info-setting">
      <div class="info-title">Value</div>
      <div class="flex gap-6" v-for="(part, i) in field.valueParts" :key="i">
        <div class="flex-v gap-6" v-if="!part.fixed">
          <input class="full-height-input" type="text" v-model="part.start" @input="handleValueChange"
            placeholder="Start">
          <input v-if="!part.fixed" type="text" v-model="part.end" @input="handleValueChange" placeholder="End">
        </div>
        <div class="flex-v gap-6" v-else>
          <input class="full-height-input" type="text" v-model="part.start" placeholder="Fixed Text">
        </div>
        <div v-if="!part.fixed" class="flex-v gap-6">
          <input class="input-m" type="number" v-model="part.step" @input="handleValueChange"
            style="flex:1; text-align: center;" placeholder="Step">
          <input class="input-m" type="number" v-model="part.length" @input="() => handleLengthChange(part)"
            style="flex:1; text-align: center;" placeholder="Length">
        </div>
        <div class="flex-v gap-6">
          <button @click="toggleFixed(part)">
            {{ part.fixed ? 'Fixed' : 'Var' }}
          </button>
          <button class="danger-bg" @click="deleteValuePart(i)">Del</button>
        </div>
      </div>
      <button @click="addValuePart">+ Add</button>
    </div>
  </div>
  <div class="divider"></div>
</template>

<style scoped>
.full-height-input {
  flex: 1;
}
</style>
