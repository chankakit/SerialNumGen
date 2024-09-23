<script setup lang="ts">
import { ref } from 'vue'

interface ValuePart {
  fixed: boolean
  start: string
  end: string
  step: number
  length: number
}

interface AVar {
  name: string
  valueParts: ValuePart[]
  valueList: String[]
}
const vars = ref<AVar[]>([])
const resultString = ref('')

const calValueLength = (theVar: AVar) => {
  for (let i = 0; i < theVar.valueParts.length; i++) {
    if (theVar.valueParts[i].fixed) {
      theVar.valueParts[i].length = 1
    } else {
      theVar.valueParts[i].length = (Number(theVar.valueParts[i].end) - Number(theVar.valueParts[i].start) + 1) / theVar.valueParts[i].step
    }
  }
}

function padWithZeros(number: number, length: number): String {
  // 将数字转换为字符串
  let str = String(number);

  // 计算需要补充的零的个数
  let zerosToAdd = Math.max(0, length - str.length);

  // 生成补零后的字符串
  let paddedString = '0'.repeat(zerosToAdd) + str;

  return paddedString;
}

function concatenateStrings(arr: String[]): String {
  let result = '';
  for (let i = 0; i < arr.length; i++) {
    result += arr[i];
  }
  return result;
}

const generateValuesList = (theVar: AVar, length: number) => {
  theVar.valueList = []
  for (let i = 0; i < length; i++) {
    let res = []
    for (let j = 0; j < theVar.valueParts.length; j++) {
      if (theVar.valueParts[j].fixed) {
        res.push(theVar.valueParts[j].start)
      } else {
        res.push(padWithZeros(Number(theVar.valueParts[j].start) + i * theVar.valueParts[j].step, theVar.valueParts[j].start.length))
      }
    }
    theVar.valueList.push(concatenateStrings(res))
  }
}

const allEqual = (arr: number[]) => arr.every(val => val === arr[0])
function checkAllVarsValueLength(allVars: AVar[]) {
  let allVarsValueLength = []
  for (let i = 0; i < allVars.length; i++) {
    for (let j = 0; j < allVars[i].valueParts.length; j++) {
      if (!allVars[i].valueParts[j].fixed) {
        allVarsValueLength.push(allVars[i].valueParts[j].length)
      }
    }
  }

  if (allVarsValueLength.length > 0) {
    return {
      isEqual: allEqual(allVarsValueLength),
      length: allEqual(allVarsValueLength) ? allVarsValueLength[0] : null
    }
  } else {
    return {
      isEqual: true,
      length: 1
    }
  }
}

const generateAllVarsValue = (allVars: AVar[]) => {
  const allVarsRes = checkAllVarsValueLength(allVars)
  if (allVarsRes.isEqual) {
    for (let i = 0; i < allVars.length; i++) {
      generateValuesList(allVars[i], allVarsRes.length!)
    }
  } else {
    alert("Length not equal.")
  }
  let csvString = generateCSV(vars.value)
  resultString.value = csvString
  console.log(csvString)
}

const generateCSV = (vars: AVar[]) => {
  let resultString = ''

  for(let i = 0; i < vars.length; i++) {
    resultString = resultString + vars[i].name + ','
  }
  resultString = resultString.slice(0, -1)
  resultString += '\n'

  for(let i = 0; i < vars[0].valueList.length; i++) {
    for(let j = 0; j < vars.length; j++) {
      resultString += vars[j].valueList[i] + ','
    }
    resultString = resultString.slice(0, -1)
    resultString += '\n'
  }

  return resultString
}

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
        <button>Import JSON</button>
        <button>Export JSON</button>
        <button @click="generateAllVarsValue(vars)">Gen Num</button>
        <button><a id="save_csv" @click="saveCSV">Save CSV</a></button>
        
      </div>
    </header>
    <div class="flex space-between" style="padding: 0 24px;">
    <div>
      <h3>Variables Settings</h3>
      <div v-for="item in vars">
        <div class="flex " style="flex-direction: column; gap: 8px;">
          <div class="flex v-center info-setting">
            <div class="info-title">Name</div>
            <input type="text" v-model="item.name">
            <button @click="vars.splice(vars.indexOf(item), 1)">Delete Variable</button>
          </div>
          <div class="flex v-center info-setting">
            <div class="info-title">Value</div>
            <div class="flex gap-6" v-for="(part, i) in item.valueParts">
              <div class="flex-v gap-6" v-if="!part.fixed">
                <input class="full-height-input" type="text" v-model="part.start" @input="calValueLength(item)"
                  placeholder="Start">
                <input v-if="!part.fixed" type="text" v-model="part.end" @input="calValueLength(item)"
                  placeholder="End">
              </div>
              <div class="flex-v gap-6" v-else>
                <input class="full-height-input" type="text" v-model="part.start" placeholder="Fixed Text">
              </div>
              <div v-if="!part.fixed" class="flex-v gap-6">
                <input class="input-m" type="number" v-model="part.step" @input="calValueLength(item)"
                  style="flex:1; text-align: center;" placeholder="Step">
                <input class="input-m" type="number" v-model="part.length" style="flex:1; text-align: center;" readonly>
              </div>
              <div class="flex-v gap-6">
                <button @click="part.fixed = !part.fixed">{{ part.fixed ? 'Fixed' : 'Var' }}</button>
                <button @click="item.valueParts.splice(i, 1)">Del</button>
              </div>
            </div>
            <button @click="item.valueParts.push({ start: '', end: '', step: 1, fixed: false, length: 0 })">+
              Add</button>
            <!-- <button @click="generateValuesList(item)">Generate Serial Num</button> -->
          </div>
        </div>
        <div class="divider"></div>
      </div>
      <button @click="vars.push({
        name: 'var' + (vars.length + 1),
        valueParts: [{ start: '', end: '', step: 1, fixed: false, length: 0 },],
        valueList: []
      })">+ Add Variable</button>
    </div>
    <div class="result-wrapper">
      <h3 style="margin: 8px 0 ;">
        Result: {{ resultString.split('\n').length - 2 }} lines
      </h3>
      <span style="white-space: pre;">{{ resultString }}</span>
    </div>
    </div>
  </div>
  
</template>

<style scoped>
header {
  position: sticky;
  top: 0;
  justify-content: space-between;
  padding: 16px 24px;
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
  padding: 8px;
  overflow: scroll;
  border-radius: 8px;
  background-color: #2d2e30;
}
.actions {}

.id-settings {
  gap: 16px;
}

.info-settings {
  flex-direction: column;
  gap: 8px;
}

.full-height-input {
  flex: 1;
}

.gap-6 {
  gap: 6px;
}

@media (prefers-color-scheme: light) {
  header {
    background-color: #ffffffb0;
  }
}
</style>
