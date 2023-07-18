import * as yup from 'yup';

export { yup };

export function validate<T extends yup.AnyObject>(input: any, schema: yup.ObjectSchema<T>): typeof schema['__outputType'] {
  return schema.validateSync(input ?? {}, {
    abortEarly: false,
    stripUnknown: true,
  });
}
