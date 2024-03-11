export interface PoolMetric {
  id: string
  content: string | number | string[]
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
          content: 1653303878,
          unit: '',
        },
        {
          id: 'totalFunds',
          content: '10.00 M',
          unit: 'USDC',
        },
        {
          id: 'totalLoans',
          content: '11',
          unit: '',
        },
        {
          id: 'assetClasses',
          content: 'Invoice Financing • Lorem Ipsum',
          unit: '',
        },
        {
          id: 'otherPools',
          content: [
            'Apxium Invoice Standard Financing Pool',
            'Apxium Tax Funding Pool',
            'XYZ Trade Finance Pool',
          ],
        },
        {
          id: 'loans',
          content: '10.00 M',
          unit: 'USDC',
        },
        {
          id: 'loss',
          content: '10.00 %',
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
          content: '12.50 %',
        },
        {
          id: 'assetClass',
          content: 'Invoice Financing',
        },
        {
          id: 'exposureIndustry',
          content: 'Accounting Firms',
        },
        {
          id: 'structureApy',
          content: 'Fixed/Variable',
        },
        {
          id: 'term',
          content: 'Open-ended • 10 years',
        },
        {
          id: 'loan',
          content: 'Amortising',
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
          content: '11.00 M',
          unit: 'USDC',
        },
        {
          id: 'management',
          content: '10,000.00',
          unit: 'USDC',
        },
        {
          id: 'yield',
          content: '15.00 %',
        },
        {
          id: 'capacity',
          content: 'Maximum capacity',
        },
        {
          id: 'activeLoans',
          content: '10',
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
          content: '0.00',
          unit: 'USDC',
          isRating: false,
        },
        {
          id: 'lossRate',
          content: '0.00%',
          isRating: false,
        },
        {
          id: 'riskScore',
          content: '4.00',
          unit: '/ 5.00',
          isRating: false,
        },
        {
          id: 'kasuRating',
          content: 5,
          isRating: true,
        },
      ],
    },
    security: {
      id: 'security',
      metrics: [
        {
          id: 'guarantees',
          content: [
            'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Nulla, eos?',
            'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Nulla, eos?',
          ],
        },
        {
          id: 'chargeAssets',
          content: 'Charge over Business Assets',
        },
        {
          id: 'bankControl',
          content: 'Charge over Bank Accounts',
        },
      ],
    },
    criteria: {
      id: 'criteria',
      metrics: [
        {
          id: 'yearsBusiness',
          content: 'Minimum 3 years in Business',
        },
        {
          id: 'propertyOwners',
          content: 'Directors must be property owners',
        },
      ],
    },
  },
}

export default mockResponseWithId
