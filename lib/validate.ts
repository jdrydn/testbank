import * as yup from 'yup';

export { yup };

/**
 * Validate an object with a Yup object schema, enforcing:
 * - `abortEarly: false` to return one error with all validation problems.
 * - `stripUnknown: true` to auto-remove unknown properties.
 */
export function validate<T extends yup.AnyObject>(input: any, schema: yup.ObjectSchema<T>):
ReturnType<typeof schema.validateSync> {
  return schema.validateSync(input ?? {}, {
    abortEarly: false,
    stripUnknown: true,
  });
}
