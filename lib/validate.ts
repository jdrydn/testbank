import * as yup from 'yup';

export { yup };

export function validate<T>(input: any, schema: ReturnType<typeof yup.object<T>>): yup.InferType<typeof schema> {
  return schema.validateSync(input ?? {}, {
    abortEarly: false,
    stripUnknown: true,
  });
}
