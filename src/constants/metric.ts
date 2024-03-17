export enum PoolDetailsSectionIds {
  PoolDelegate = 'poolDelegate',
  PoolDetails = 'poolDetails',
  PoolTraction = 'poolTraction',
  RiskManagement = 'riskManagement',
  RiskStatus = 'riskStatus',
  Security = 'security',
  Criteria = 'criteria',
}

export enum PoolDelegateMetricIds {
  History = 'history',
  TotalFunds = 'totalFunds',
  TotalLoans = 'totalLoans',
  AssetClasses = 'assetClasses',
  OtherPools = 'otherPools',
  Loans = 'loans',
  Loss = 'loss',
}

export enum PoolDetailsMetricIds {
  APY = 'apy',
  AssetClass = 'assetClass',
  ExposureIndustry = 'exposureIndustry',
  StructureApy = 'structureApy',
  Term = 'term',
  Loan = 'loan',
}

export enum PoolTractionMetricIds {
  ValueLocked = 'valueLocked',
  Management = 'management',
  Yield = 'yield',
  Capacity = 'capacity',
  ActiveLoans = 'activeLoans',
}

export enum RiskMetricIds {
  FirstLoss = 'firstLoss',
  LossRate = 'lossRate',
  RiskScore = 'riskScore',
  KasuRating = 'kasuRating',
  Guarantees = 'guarantees',
  ChargeAssets = 'chargeAssets',
  BankControl = 'bankControl',
  YearsBusiness = 'yearsBusiness',
  PropertyOwners = 'propertyOwners',
}

export enum MetricGroupType {
  First = 'first',
  Second = 'second',
  Third = 'third',
}
