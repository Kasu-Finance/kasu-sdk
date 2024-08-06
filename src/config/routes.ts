export enum BaseRoutesPaths {
  HOME = '/',
  LENDING = '/lending',
  BORROW = '/borrow',
  DOCS = '/docs',
  LOCKING = '/locking',
  PORTFOLIO = '/portfolio',
}

export type RouteDefinition = {
  url: `${BaseRoutesPaths}${string}`
}

type RouteGroup = {
  [key: string]: {
    [key: string]: RouteDefinition
  }
}

export const Routes = {
  home: {
    root: { url: BaseRoutesPaths.HOME },
  },
  lending: {
    root: { url: BaseRoutesPaths.LENDING },
    closedLendingStrategies: {
      url: `${BaseRoutesPaths.LENDING}/closedLendingStrategies`,
    },
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
  portfolio: {
    root: { url: BaseRoutesPaths.PORTFOLIO },
  },
} as const satisfies RouteGroup
