export enum BaseRoutesPaths {
  HOME = '/',
  LENDING = '/lending',
  BORROW = '/borrow',
  DOCS = '/docs',
  LOCKING = '/locking',
  ACCOUNT = '/account',
}

export type RouteDefinition = {
  url: string
}

type RouteGroup = {
  [key: string]: {
    [key: string]: RouteDefinition
  }
}

export const Routes: RouteGroup = {
  home: {
    root: { url: BaseRoutesPaths.HOME },
  },
  lending: {
    root: { url: BaseRoutesPaths.LENDING },
  },
  borrow: {
    root: { url: BaseRoutesPaths.BORROW },
  },
  docs: {
    root: { url: BaseRoutesPaths.DOCS },
  },
  locking: {
    root: { url: BaseRoutesPaths.LOCKING },
  },
  account: {
    root: { url: BaseRoutesPaths.ACCOUNT },
  },
}
