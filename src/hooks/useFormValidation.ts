import { useState, useCallback } from 'react';
import { ValidationError } from '../utils/validation';

interface UseFormValidationProps<T> {
  initialValues: T;
  validate: (values: T) => ValidationError[];
}

interface UseFormValidationReturn<T> {
  values: T;
  errors: ValidationError[];
  isValid: boolean;
  setValue: (field: keyof T, value: any) => void;
  setValues: (values: Partial<T>) => void;
  validateField: (field: keyof T) => void;
  validateForm: () => boolean;
  reset: () => void;
  getFieldError: (field: keyof T) => string | undefined;
}

export const useFormValidation = <T extends Record<string, any>>({
  initialValues,
  validate
}: UseFormValidationProps<T>): UseFormValidationReturn<T> => {
  const [values, setValuesState] = useState<T>(initialValues);
  const [errors, setErrors] = useState<ValidationError[]>([]);

  const setValue = useCallback((field: keyof T, value: any) => {
    setValuesState(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field when value changes
    setErrors(prev => prev.filter(error => error.field !== field));
  }, []);

  const setValues = useCallback((newValues: Partial<T>) => {
    setValuesState(prev => ({ ...prev, ...newValues }));
  }, []);

  const validateField = useCallback((field: keyof T) => {
    const fieldErrors = validate(values).filter(error => error.field === field);
    setErrors(prev => [
      ...prev.filter(error => error.field !== field),
      ...fieldErrors
    ]);
  }, [values, validate]);

  const validateForm = useCallback(() => {
    const validationErrors = validate(values);
    setErrors(validationErrors);
    return validationErrors.length === 0;
  }, [values, validate]);

  const reset = useCallback(() => {
    setValuesState(initialValues);
    setErrors([]);
  }, [initialValues]);

  const getFieldError = useCallback((field: keyof T) => {
    const error = errors.find(error => error.field === field);
    return error?.message;
  }, [errors]);

  const isValid = errors.length === 0;

  return {
    values,
    errors,
    isValid,
    setValue,
    setValues,
    validateField,
    validateForm,
    reset,
    getFieldError
  };
};
