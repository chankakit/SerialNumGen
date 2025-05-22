<script setup lang="ts">
import { ref } from 'vue'
import type { Field } from './types/field'
import { padWithZeros, concatenateStrings } from './utils/string'
import { generateCSV } from './utils/csv'
import VariableField from './components/VariableField.vue'
import SpaceDialog from './components/SpaceDialog.vue'
import ResultPanel from './components/ResultPanel.vue'

const fields = ref<Field[]>([])
const resultString = ref('')

const showSpaceDialog = ref(false)
const pendingFields = ref<Field[]>([])

const pageSettings = ref({
  amountPerPage: 1,
  pages: 1
})

const calculateLengthAndSetValue = () => {
  const length = pageSettings.value.amountPerPage * pageSettings.value.pages
  for (let i = 0; i < fields.value.length; i++) {
    // 把所有的字段的每个part都设置为相同的长度
    for (let j = 0; j < fields.value[i].valueParts.length; j++) {
      if (!fields.value[i].valueParts[j].fixed) {
        fields.value[i].valueParts[j].length = length
        fields.value[i].valueParts[j].end = padWithZeros(Number(fields.value[i].valueParts[j].start) + length * fields.value[i].valueParts[j].step - 1, fields.value[i].valueParts[j].start.length)
      }
    }
  }
}


const reverseSettings = ref({
  amountPerGroup: 1,
  reverseGroup: false
})

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


function chunkArray<T>(arr: T[], chunkSize: number): T[][] {
  // 处理边界情况
  if (chunkSize <= 0) {
    throw new Error("chunkSize must be a positive integer");
  }

  const result: T[][] = [];
  const length = arr.length;
  
  // 遍历数组，每次增加 chunkSize
  for (let i = 0; i < length; i += chunkSize) {
    // 获取当前块
    const chunk = arr.slice(i, i + chunkSize);
    
    // 如果不足 chunkSize，则补空值
    while (chunk.length < chunkSize) {
      // 这里使用类型断言，因为我们知道补的是空字符串或默认值
      // 实际上可能需要更复杂的处理来保持类型一致
      chunk.push("" as unknown as T);
    }
    
    result.push(chunk);
  }
  
  return result;
}

/**
 * 组反转,但组内是顺序的
 * @param amountPerGroup 每组内元素数量
 * @param originalArray 原数组
 * @returns 反转后的新数组
 */
const reverseGroup = (amountPerGroup: number, originalArray: string[]) => {
  let reversed = chunkArray(originalArray, amountPerGroup)
  // 反转reversed数组
  reversed.reverse()

  return reversed.flat()
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
  if (reverseSettings.value.reverseGroup) {
    field.valueList = reverseGroup(reverseSettings.value.amountPerGroup, field.valueList)
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
      <div class="flex-v">
        <div>
          <h3>Page Settings</h3>
          <div class="flex-v gap-6">
            <div class="flex gap-6">
              <input type="number" placeholder="Amount Per Page" v-model="pageSettings.amountPerPage">
              <input type="number" placeholder="Pages" v-model="pageSettings.pages">
              <button @click="calculateLengthAndSetValue">Set length</button>
            </div>
            <div class="flex v-center gap-6">
              <input type="number" placeholder="Amount Per Group" v-model="reverseSettings.amountPerGroup">
              <input id="reverse-group-checkbox" type="checkbox" v-model="reverseSettings.reverseGroup">
              <label for="reverse-group-checkbox">Reverse Group</label>
            </div>
          </div>
        </div>
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

@media (prefers-color-scheme: light) {
  header {
    background-color: #ffffffb0;
  }

  .result-wrapper {
    background-color: #ebf3f5;
  }
}
</style>
