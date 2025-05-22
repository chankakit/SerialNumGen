import type { Field } from '../types/field'

/**
 * 生成CSV字符串
 * @param fields 字段数组
 * @returns CSV字符串
 */
export function generateCSV(fields: Field[]) {
  const headers = fields.map(f => f.name).join(',');
  const rows = fields[0].valueList.map((_, i) =>
    fields.map(field => field.valueList[i]).join(',')
  );

  return `${headers}\n${rows.join('\n')}\n`;
}