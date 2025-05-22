export function padWithZeros(number: number, length: number): string {
  // 将数字转换为字符串
  let str = String(number);

  // 计算需要补充的零的个数
  let zerosToAdd = Math.max(0, length - str.length);

  // 生成补零后的字符串
  let paddedString = '0'.repeat(zerosToAdd) + str;

  return paddedString;
}

/**
 * 将字符串数组拼接成一个字符串
 * @param arr 字符串数组
 * @returns 拼接后的字符串
 */

export function concatenateStrings(arr: string[]): string {
  let result = '';
  for (let i = 0; i < arr.length; i++) {
    result += arr[i];
  }
  return result;
}

/**
 * WIP Feature: 找到字符串中最后一个数字段的位置
 * @param input 字符串
 * @returns 数字段的位置
 */
export function findLastNumberSegmentIndices(input: string): { start: number, end: number } | null {
  let start: number | null = null;
  let end: number | null = null;
  let inNumberSegment = false;

  for (let i = input.length - 1; i >= 0; i--) {
    if (/\d/.test(input[i])) {
      if (!inNumberSegment) {
        end = i;
        inNumberSegment = true;
      }
      start = i;
    } else {
      if (inNumberSegment) {
        break;
      }
    }
  }

  if (start !== null && end !== null) {
    return { start, end };
  }

  return null; // 返回 null 表示没有找到数字段
}