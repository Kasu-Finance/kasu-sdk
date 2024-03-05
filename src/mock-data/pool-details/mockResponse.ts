import { TranslationKeys } from "@/hooks/useTranslation";

export interface MetricItemWithId {
  id: string;
  metric: string | number | string[];
  unit?: string;
  isRating?: boolean;
}

export interface SectionData {
  id: string;
  metrics: MetricItemWithId[];
}

interface RiskManagementSection {
  id: string;
  title: TranslationKeys;
  metrics: MetricItemWithId[];
}


interface MetricTitleTooltip {
  title: TranslationKeys; 
  tooltip: TranslationKeys;
}

export interface SectionInfo {
  metrics: Record<string, MetricTitleTooltip>;
}

export interface MockResponseWithId {
  poolDelegate: {
    title: TranslationKeys;
    data: SectionData;
  };
  poolDetails: {
    title: TranslationKeys;
    data: SectionData;
  };
  poolTraction: {
    title: TranslationKeys;
    data: SectionData;
  };
  riskManagement: {
    securityStructure: RiskManagementSection;
    borrowerCriteria: RiskManagementSection;
    riskPerformance: RiskManagementSection;
  };
}

const mockResponseWithId: MockResponseWithId = {
  poolDelegate: {
    title: "details.poolDelegate.title",
    data: {
      id: "poolDelegate",
      metrics: [
        { id: "lendingHistory", metric: "2 years • 3 months"},
        { id: "assetClasses", metric: "Invoice Financing • Lorem Ipsum"},
        { id: "otherKasuPools", metric: ["Apxium Invoice Standard Financing Pool", "Apxium Tax Funding Pool", "XYZ Trade Finance Pool"]},
        { id: "totalLoanFunds",metric: "10.00 M", unit: "USDC" },
        { id: "totalLoansOriginated", metric: "10.00 M", unit: "USDC"},
        { id: "loansUnderManagement", metric: "11"},
        { id: "historicalLossRate", metric: "10.00 %" },
      ],
    },
  },
  poolDetails: {
      title: "details.poolDetails.title",
      data: {
      id: "poolDetails",
      metrics: [
        { id: "apy", metric: "12.50 %" },
        { id: "assetClass", metric: "Invoice Financing" },
        { id: "poolApyStructure", metric: "Fixed/Variable" },
        { id: "poolInvestmentTerm", metric: "Open-ended • 10 years" },
        { id: "industryExposure", metric: "Accounting Firms" },
        { id: "loanStructure", metric: "Amortising" },
      ],
    },
  },
  poolTraction: {
    title: "details.poolTraction.title",
    data: {
      id: "tractionMetrics",
      metrics: [
        { id: "totalValueLocked", metric: "11.00 M", unit: "USDC" },
        { id: "yieldEarned", metric: "10,000.00", unit: "USDC" },
        { id: "poolCapacity", metric: "15.00 %" },
        { id: "activeLoans", metric: "10" },
      ],
    },
  },
  riskManagement: {
    securityStructure: {
      title: "details.riskManagement.securityStructureBorrowers",
      id: "securityStructure",
      metrics: [
        { id: "directorsGuarantees", metric: ["Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempo", "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempo"] },
        { id: "chargeBusinessAssets", metric: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." },
        { id: "controlBankAccounts", metric: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat." },
      ],
    },
    borrowerCriteria: {
      title: "details.riskManagement.borrowerCriteria",
      id: "borrowerCriteria",
      metrics: [
        { id: "minimum3yearsInBusiness", metric: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur." },
        { id: "directorsPropertyOwners", metric: "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum." },
      ],
    },
    riskPerformance: {
      title: "details.riskManagement.riskPerformance",
      id: "riskPerformance",
      metrics: [
        { id: "firstLossCapital", metric: "0.00", unit: "USDC", isRating: false },
        { id: "poolLossRate", metric: "0.00%", isRating: false },
        { id: "independentRiskScore", metric: "4.00 ", unit:'/ 5.00',  isRating: false },
        { id: "communityRating", metric: 5, isRating: true },
      ],
    },
  },
};

export default mockResponseWithId

