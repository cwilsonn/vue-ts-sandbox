import { computed, ref } from 'vue';
import { ZodSchema } from 'zod';

export function useFormField<T>(initialValue: T, schema?: ZodSchema<T>) {
  const value = ref<T>(initialValue);
  const errors = ref<string[]>([]);

  const isValid = computed(() => errors.value.length === 0);

  const validate = () => {
    if (!schema) return true;
    const result = schema.safeParse(value.value);
    errors.value = result.error ? result.error.errors.map(err => err.message) : [];
    return result.success;
  };

  return {
    value,
    errors,
    validate,
    isValid,
  };
}
