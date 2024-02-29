  type ColumnItem = {
    title: string;
    toolTipInfo: string;
    metric: string | string[];
    unit?: string;
  };
  
  type PoolDelegateData = {
    leftColumn: ColumnItem[];
    rightColumn: ColumnItem[];
  };
  
const poolDelegateMock: PoolDelegateData = {
    "leftColumn": [
      {
        "title": "Lending History",
        "toolTipInfo": "toolTipInfo",
        "metric": "2 years • 3 months"
      },
      {
        "title": "Asset Class(es)",
        "toolTipInfo": "toolTipInfo",
        "metric": "Invoice Financing • Lorem Ipsum"
      },
      {
        "title": "Other KASU Pools",
        "toolTipInfo": "toolTipInfo",
        "metric": [
          "Apxium Invoice Standard Financing Pool",
          "Apxium Tax Funding Pool",
          "XYZ Trade Finance Pool"
        ]
      }
    ],
    "rightColumn": [
      {
        "title": "Total Loan Funds Originated​",
        "toolTipInfo": "toolTipInfo",
        "metric": "10.00 M",
        "unit": "USDC"
      },
      {
        "title": "Total Loans Originated",
        "toolTipInfo": "toolTipInfo",
        "metric": "1.00 M",
        "unit": "USDC"
      },
      {
        "title": "Loans Under Management",
        "toolTipInfo": "toolTipInfo",
        "metric": "1.00 M",
        "unit": "USDC"
      },
      {
        "title": "Historical Loss Rate",
        "toolTipInfo": "toolTipInfo",
        "metric": "1.00 %",
        "unit": ""
      }
    ]
  }
  
  export default poolDelegateMock;
  