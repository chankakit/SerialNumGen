// utils/validator.ts
import { Field } from "../types/field";

export function validateField(field: Field): string[] {
  const errors: string[] = [];

  if (!field.name) {
    errors.push('Name is required');
  }

  field.valueParts.forEach((part, index) => {
    if (!part.fixed && Number(part.end) < Number(part.start)) {
      errors.push(`Part ${index + 1}: End value must be greater than start value`);
    }
  });

  return errors;
}