<script setup lang="ts">
import { ref } from 'vue'
import type { Field } from './types/field'
import { padWithZeros, concatenateStrings, findLastNumberSegmentIndices } from './utils/string'
import { generateCSV } from './utils/csv'
import VariableField from './components/VariableField.vue'
import SpaceDialog from './components/SpaceDialog.vue'
import ResultPanel from './components/ResultPanel.vue'

const fields = ref<Field[]>([])
const resultString = ref('')

const showSpaceDialog = ref(false)
const pendingFields = ref<Field[]>([])

/**
 * 更新流水号个数
 * @param field 对应字段
 */
const setValueLength = (field: Field) => {
  for (let i = 0; i < field.valueParts.length; i++) {
    if (field.valueParts[i].fixed) {
      field.valueParts[i].length = 1
    } else {
      field.valueParts[i].length = (Number(field.valueParts[i].end) - Number(field.valueParts[i].start) + 1) / field.valueParts[i].step
    }
  }
}

/** 
 * 处理字段更新
 * @param index 需要更新的字段索引
 * @param value 要更新的值
 */
const handleFieldUpdate = (index: number, value: Field) => {
  fields.value[index] = value
  setValueLength(value)
  setEndNumber(value)
}

/** 
 * 处理字段删除
 * @param index 需要删除的字段索引
 */
const handleFieldDelete = (index: number) => {
  fields.value.splice(index, 1)
}

/**
 * 更新结束值
 * @param field 对应字段
 */
const setEndNumber = (field: Field) => {
  for (let i = 0; i < field.valueParts.length; i++) {
    if (field.valueParts[i].fixed) {
      // theVar.valueParts[i].length = 1
    } else {
      let endNum = Number(field.valueParts[i].length) * field.valueParts[i].step + Number(field.valueParts[i].start) - 1
      field.valueParts[i].end = padWithZeros(endNum, field.valueParts[i].start.length)
    }
  }
}

/**
 * 生成值列表
 * @param field 对应字段
 * @param length 长度
 */
const generateValuesList = (field: Field, length: number) => {
  field.valueList = []
  for (let i = 0; i < length; i++) {
    let res = []
    for (let j = 0; j < field.valueParts.length; j++) {
      if (field.valueParts[j].fixed) {
        res.push(field.valueParts[j].start)
      } else {
        res.push(padWithZeros(Number(field.valueParts[j].start) + i * field.valueParts[j].step, field.valueParts[j].start.length))
      }
    }
    field.valueList.push(concatenateStrings(res))
  }
}

// 用于检查所有字段的流水号数量是否相等状态
const allEqual = (arr: number[]) => arr.every(val => val === arr[0])

/**
 * 检查所有字段的流水号数量是否相等
 * 结果会直接赋值到 allEqual 变量
 * @param allFields 
 */
function checkAllVarsValueLength(allFields: Field[]) {
  let allFieldsValueLength = []
  for (let i = 0; i < allFields.length; i++) {
    for (let j = 0; j < allFields[i].valueParts.length; j++) {
      if (!allFields[i].valueParts[j].fixed) {
        allFieldsValueLength.push(allFields[i].valueParts[j].length)
      }
    }
  }

  if (allFieldsValueLength.length > 0) {
    return {
      isEqual: allEqual(allFieldsValueLength),
      length: allEqual(allFieldsValueLength) ? allFieldsValueLength[0] : null
    }
  } else {
    return {
      isEqual: true,
      length: 1
    }
  }
}

/**
 * 检查对应字段的每一部分，开头是否为空格
 * @param fields 字段数组
 * @returns 布尔值，true即为空格
 */
const hasLeadingSpace = (fields: Field[]): boolean => {
  for (const field of fields) {
    for (const part of field.valueParts) {
      if (part.start.startsWith(' ')) {
        return true
      }
    }
  }
  return false
}

/**
 * 生成所有字段的流水号
 * @param allFields 所有字段数组
 */
const generateAllVarsValue = (allFields: Field[]) => {
  pendingFields.value = allFields

  if (hasLeadingSpace(allFields)) {
    showSpaceDialog.value = true
    return
  }

  processGeneration(allFields)
}

/**
 * 处理生成流水号
 * @param allFields 所有字段数组
 * @param removeSpace 是否移除空格
 */
const processGeneration = (allFields: Field[], removeSpace: boolean = false) => {
  if (removeSpace) {
    // Remove leading spaces from all fields
    for (const field of allFields) {
      for (const part of field.valueParts) {
        part.start = part.start.trimStart()
      }
    }
  }

  const checkResult = checkAllVarsValueLength(allFields)
  if (checkResult.isEqual) {
    for (let i = 0; i < allFields.length; i++) {
      generateValuesList(allFields[i], checkResult.length!)
    }
  } else {
    alert("Length not equal.")
  }

  let csvString = generateCSV(fields.value)
  resultString.value = csvString
}

/**
 * 保存CSV文件
 */
const saveCSV = () => {
  let fileName = 'data.csv'
  let blob = new Blob([resultString.value], { type: 'text/csv;charset=utf-8' })

  window.URL = window.URL || window.webkitURL
  let saveBtn = document.getElementById('save_csv')
  saveBtn?.setAttribute('href', window.URL.createObjectURL(blob))
  saveBtn?.setAttribute('download', fileName)
}
</script>

<template>
  <div>
    <header class="flex v-center">
      <div class="title">Serial Number Generator</div>
      <div class="flex gap-small actions">
        <button @click="generateAllVarsValue(fields)">Gen Num</button>
        <button class="primary-btn"><a style="color:white;font-weight: 600;" id="save_csv" @click="saveCSV">Save CSV</a></button>
      </div>
    </header>
    <div class="flex space-between" style="padding: 0 24px;">

      <div>
        <h3>Variables Settings</h3>
        <div v-for="(field, index) in fields" :key="index">
          <VariableField :field="field" 
            @update:field="(val) => handleFieldUpdate(index, val)"
            @delete="handleFieldDelete(index)" />
        </div>
        <button class="highlight-btn" @click="fields.push({
          name: 'var_sn' + (fields.length + 1),
          valueParts: [{ start: '', end: '', step: 1, fixed: false, length: 0 }],
          valueList: []
        })">
          + Add Variable
        </button>
      </div>
      <ResultPanel :result-string="resultString" />
    </div>

    <!-- 检测到空格的对话框 -->
    <SpaceDialog 
      :visible="showSpaceDialog" 
      @on-close="() => showSpaceDialog = false" 
      @on-continue="(removeSpace) => {showSpaceDialog = false; processGeneration(pendingFields, removeSpace)}" />
  </div>
</template>

<style scoped>
header {
  position: sticky;
  top: 0;
  justify-content: space-between;
  padding: var(--spacing-medium)  var(--spacing-large);
  background-color: #242424b0;
  backdrop-filter: blur(5px);

  .title {
    font-size: 20px;
    font-weight: 700;
  }
}

.result-wrapper {
  width: 320px;
  height: 640px;
  padding: var(--spacing-small);
  overflow: scroll;
  border-radius: var(--border-radius);
  background-color: #2d2e30;
}

@media (prefers-color-scheme: light) {
  header {
    background-color: #ffffffb0;
  }

  .result-wrapper {
    background-color: #ebf3f5;
  }
}
</style>
