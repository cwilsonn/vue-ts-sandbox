import { ref, computed } from 'vue';
import { useFormField } from './useFormField';
import { type FormField, type FormValues, type FormErrors } from '../types/forms';
import { type Path } from '../types/path';

export function useForm<T extends FormValues<T>>(formFields: Record<Path<T>, FormField<any>>) {
  const fields = ref(
    (Object.keys(formFields) as (keyof T)[]).reduce((acc, key) => {
      acc[key] = useFormField(formFields[key].value, formFields[key].validation);
      return acc;
    }, {} as { [K in keyof T]: ReturnType<typeof useFormField> })
  );

  const values = computed(() => {
    return (Object.keys(fields.value) as (keyof T)[]).reduce((acc, key) => {
      acc[key] = fields.value[key].value;
      return acc;
    }, {} as T);
  });

  const errors = computed(() => {
    return (Object.keys(fields.value) as (keyof T)[]).reduce((acc, key) => {
      acc[key] = fields.value[key].errors;
      return acc;
    }, {} as FormErrors<T>);
  });

  const validateForm = () => {
    let isValid = true;
    for (const key in fields.value) {
      fields.value[key].validate();
      if (fields.value[key].errors.length > 0) {
        isValid = false;
      }
    }
    return isValid;
  };

  const isValid = computed(() => validateForm());

  const resetForm = () => {
    for (const key in fields.value) {
      fields.value[key].value.value = formFields[key as keyof T].value;
      fields.value[key].errors.value = [];
    }
  };

  return {
    fields,
    values,
    errors,
    isValid,
    resetForm,
  };
}


