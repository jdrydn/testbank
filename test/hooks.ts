import util from 'util';

// eslint-disable-next-line no-unused-vars, space-before-function-paren
export function useTestState<T, P extends Record<string, ((this: { value: () => T | undefined } & P) => any)>>(
  setup: () => (Promise<T> | T),
  teardown?: (state?: T | undefined) => (Promise<void> | void), // eslint-disable-line no-unused-vars
  properties?: ThisType<{ value: () => T | undefined } & P> & P,
): ThisType<{ value: () => T | undefined } & P> & { value: () => T | undefined } & P {
  let state: T | undefined;

  before(async () => {
    state = await setup();
  });

  after(() => {
    if (typeof teardown === 'function') {
      teardown(state);
    }
  });

  return {
    ...properties,
    value: () => state,
    [util.inspect.custom]() {
      return {
        value: this.value(),
        ...Object.fromEntries(Object.entries(properties ?? {}).map(([ key, getter ]) => {
          try {
            return [ key, typeof getter === 'function' ? getter.call(this) : undefined ];
          } catch (err) {
            return [ key, err ];
          }
        })),
      };
    },
  } as (P & {
    value: () => T | undefined,
    [util.inspect.custom]: () => any,
  });
}
