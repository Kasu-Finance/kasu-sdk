const EMPTY = {} as const

export type IsEmptyObject<Obj extends Record<PropertyKey, unknown>> =
  typeof EMPTY extends Obj ? true : false

export type ValueOf<T> = T[keyof T]

export type ContextWrapper<TState, TAction> = TState & {
  dispatch: React.Dispatch<TAction>
}
