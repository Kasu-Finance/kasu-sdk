const EMPTY = {} as const

export type IsEmptyObject<Obj extends Record<PropertyKey, unknown>> =
  typeof EMPTY extends Obj ? true : false

export type ValueOf<T> = T[keyof T]

export type ContextWrapper<TState, TAction> = TState & {
  dispatch: React.Dispatch<TAction>
}

type Join<K, P> = K extends string | number
  ? P extends string | number
    ? `${K}${'' extends P ? '' : '.'}${P}`
    : never
  : never

// how deep does nested object go
// prettier-ignore
type Prev = [never, 0, 1, 2, 3, 4, ...0[]]

/* returns nested object leaf paths
  e.g
  {
    a: string
    b: string
    c : { nested : string},
    d: { nested : { deepNested: string } }
  } 
  
  returns "a" | "b" | "c.nested" | "d.nested.deepNested"
  */
export type Leaves<T, D extends number = 10> = [D] extends [never]
  ? never
  : T extends object
    ? { [K in keyof T]-?: Join<K, Leaves<T[K], Prev[D]>> }[keyof T]
    : ''
