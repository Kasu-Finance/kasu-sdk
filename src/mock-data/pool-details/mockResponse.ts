export interface PoolMetric {
  id: string
  value: string | number | string[]
  unit?: string
  isRating?: boolean
}

export interface SectionData {
  id: string
  metrics: PoolMetric[]
}

interface RiskManagementSection {
  riskStatus: SectionData
  security: SectionData
  criteria: SectionData
}

interface MockResponseWithId {
  poolDelegate: {
    data: SectionData
  }
  poolDetails: {
    data: SectionData
  }
  poolTraction: {
    data: SectionData
  }
  riskManagement: RiskManagementSection
}

const mockResponseWithId: MockResponseWithId = {
  poolDelegate: {
    data: {
      id: 'poolDelegate',
      metrics: [
        {
          id: 'history',
          value: 1653303878,
          unit: '',
        },
        {
          id: 'totalFunds',
          value: '10.00 M',
          unit: 'USDC',
        },
        {
          id: 'totalLoans',
          value: '11',
          unit: '',
        },
        {
          id: 'assetClasses',
          value: 'Invoice Financing • Lorem Ipsum',
          unit: '',
        },
        {
          id: 'otherPools',
          value: [
            'Apxium Invoice Standard Financing Pool',
            'Apxium Tax Funding Pool',
            'XYZ Trade Finance Pool',
          ],
        },
        {
          id: 'loans',
          value: '10.00 M',
          unit: 'USDC',
        },
        {
          id: 'loss',
          value: '10.00 %',
          unit: '',
        },
      ],
    },
  },
  poolDetails: {
    data: {
      id: 'poolDetails',
      metrics: [
        {
          id: 'apy',
          value: '12.50 %',
        },
        {
          id: 'assetClass',
          value: 'Invoice Financing',
        },
        {
          id: 'exposureIndustry',
          value: 'Accounting Firms',
        },
        {
          id: 'structureApy',
          value: 'Fixed/Variable',
        },
        {
          id: 'term',
          value: 'Open-ended • 10 years',
        },
        {
          id: 'loan',
          value: 'Amortising',
        },
      ],
    },
  },
  poolTraction: {
    data: {
      id: 'poolTraction',
      metrics: [
        {
          id: 'valueLocked',
          value: '11.00 M',
          unit: 'USDC',
        },
        {
          id: 'management',
          value: '10,000.00',
          unit: 'USDC',
        },
        {
          id: 'yield',
          value: '15.00 %',
        },
        {
          id: 'capacity',
          value: 'Maximum capacity',
        },
        {
          id: 'activeLoans',
          value: '10',
        },
      ],
    },
  },
  riskManagement: {
    riskStatus: {
      id: 'riskStatus',
      metrics: [
        {
          id: 'firstLoss',
          value: '0.00',
          unit: 'USDC',
          isRating: false,
        },
        {
          id: 'lossRate',
          value: '0.00%',
          isRating: false,
        },
        {
          id: 'riskScore',
          value: '4.00',
          unit: '/ 5.00',
          isRating: false,
        },
        {
          id: 'kasuRating',
          value: 5,
          isRating: true,
        },
      ],
    },
    security: {
      id: 'security',
      metrics: [
        {
          id: 'guarantees',
          value: [
            'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Nulla, eos?',
            'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Nulla, eos?',
          ],
        },
        {
          id: 'chargeAssets',
          value: 'Charge over Business Assets',
        },
        {
          id: 'bankControl',
          value: 'Charge over Bank Accounts',
        },
      ],
    },
    criteria: {
      id: 'criteria',
      metrics: [
        {
          id: 'yearsBusiness',
          value: 'Minimum 3 years in Business',
        },
        {
          id: 'propertyOwners',
          value: 'Directors must be property owners',
        },
      ],
    },
  },
}

export default mockResponseWithId
