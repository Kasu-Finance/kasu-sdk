'use client'

import { SxProps, Theme } from '@mui/material'

import useModalState from '@/hooks/context/useModalState'

import DialogWrapper from '@/components/atoms/DialogWrapper'
import AutoConversionToVariableModal from '@/components/organisms/modals/AutoConversionToVariableModal'
import BorrowerIdentifiedModal from '@/components/organisms/modals/BorrowIdentifiedModal'
import BuyKasuModalWrapper from '@/components/organisms/modals/BuyKasuModal/BuyKasuModalWrapper'
import CancelDepositModal from '@/components/organisms/modals/CancelDepositModal'
import CancelWithdrawalModal from '@/components/organisms/modals/CancelWithdrawalModal'
import FixApyModalWrapper from '@/components/organisms/modals/FixApyModal/FixApyModalWrapper'
import FixedLoanModal from '@/components/organisms/modals/FixedLoanModal'
import HistoricalRepaymentsModal from '@/components/organisms/modals/HistoricalRepaymentsModal'
import LendingModalWrapper from '@/components/organisms/modals/LendingModal/LendingModalWrapper'
import LinkWalletsModal from '@/components/organisms/modals/LinkWalletsModal'
import LoanContractModal from '@/components/organisms/modals/LoanContractModal'
import LockModalWrapper from '@/components/organisms/modals/LockModal/LockModalWrapper'
import LoyaltyLevelsModal from '@/components/organisms/modals/LoyaltyLevelsModal'
import MissingEmailModalWrapper from '@/components/organisms/modals/MissingEmailModal/MissingEmailModalWrapper'
import NftDetectedModal from '@/components/organisms/modals/NftDetectedModal'
import OptInModal from '@/components/organisms/modals/OptInModal'
import OptOutModal from '@/components/organisms/modals/OptOutModal'
import PendingDecisionModal from '@/components/organisms/modals/PendingDecisionsModal'
import ReferralDetectedModal from '@/components/organisms/modals/ReferralDetectedModal'
import ReferralModal from '@/components/organisms/modals/ReferralModal'
import ReferredUsersModal from '@/components/organisms/modals/ReferredUsersModal'
import RequestDetailsModal from '@/components/organisms/modals/RequestDetailsModal'
import UnlockModalWrapper from '@/components/organisms/modals/UnlockModal/UnlockModalWrapper'
import UnreleasedFeatureModal from '@/components/organisms/modals/UnreleasedFeatureModal'
import ViewLoanContractModal from '@/components/organisms/modals/ViewLoanContractModal'
import ViewWalletModal from '@/components/organisms/modals/ViewWalletModal'
import WipRedirectModal from '@/components/organisms/modals/WipRedirectModal'
import WIthdrawFundsAtExpiryModalWrapper from '@/components/organisms/modals/WithdrawFundsAtExpiryModal/WithdrawFundsAtExpiryModalWrapper'
import WithdrawModalWrapper from '@/components/organisms/modals/WithdrawModal/WithdrawModalWrapper'
import WrongNetworkModal from '@/components/organisms/modals/WrongNetworkModal'

import { Modals, ModalsKeys } from '@/context/modal/modal.types'

import KycModalWrapper from './KycModal/KycModalWrapper'

type ModalDetails = {
  component: JSX.Element
  ariaLabel?: string
  ariaDescription?: string
  fullscreen?: boolean
  sx?: SxProps<Theme>
  backdropSx?: SxProps<Theme>
  disableBackdropClose?: boolean
  disableElevation?: boolean
  disableEscapeKeyDown?: boolean
}

export const getModal = (
  modalName: ModalsKeys,
  handleClose: () => void
): ModalDetails => {
  switch (modalName) {
    case ModalsKeys.LINK_WALLETS:
      return {
        component: <LinkWalletsModal handleClose={handleClose} />,
      }
    case ModalsKeys.VIEW_WALLET:
      return {
        component: <ViewWalletModal handleClose={handleClose} />,
      }
    case ModalsKeys.LOYALTY_LEVELS:
      return {
        component: <LoyaltyLevelsModal handleClose={handleClose} />,
        ariaLabel: 'Loyalty Levels',
        ariaDescription: 'Information about loyalty levels',
      }
    case ModalsKeys.MISSING_EMAIL:
      return {
        component: <MissingEmailModalWrapper handleClose={handleClose} />,
      }
    case ModalsKeys.LOCK:
      return {
        component: <LockModalWrapper handleClose={handleClose} />,
      }
    case ModalsKeys.UNLOCK:
      return {
        component: <UnlockModalWrapper handleClose={handleClose} />,
      }
    case ModalsKeys.WITHDRAW:
      return {
        component: <WithdrawModalWrapper handleClose={handleClose} />,
      }
    case ModalsKeys.KYC:
      return {
        component: <KycModalWrapper handleClose={handleClose} />,
      }
    case ModalsKeys.CANCEL_DEPOSIT:
      return {
        component: <CancelDepositModal handleClose={handleClose} />,
      }
    case ModalsKeys.CANCEL_WITHDRAWAL:
      return {
        component: <CancelWithdrawalModal handleClose={handleClose} />,
      }
    case ModalsKeys.LEND:
      return {
        component: <LendingModalWrapper handleClose={handleClose} />,
      }
    case ModalsKeys.LOAN_CONTRACT:
      return {
        component: <LoanContractModal handleClose={handleClose} />,
        sx: {
          overflow: 'hidden',
        },
      }
    case ModalsKeys.BORROWER_IDENTIFIED:
      return {
        component: <BorrowerIdentifiedModal handleClose={handleClose} />,
      }
    case ModalsKeys.OPT_IN:
      return {
        component: <OptInModal handleClose={handleClose} />,
      }
    case ModalsKeys.OPT_OUT:
      return {
        component: <OptOutModal handleClose={handleClose} />,
      }
    case ModalsKeys.REQUEST_DETAILS:
      return {
        component: <RequestDetailsModal handleClose={handleClose} />,
        sx: {
          maxWidth: 1000,
          width: '100%',
        },
      }
    case ModalsKeys.PENDING_DECISIONS:
      return {
        component: <PendingDecisionModal handleClose={handleClose} />,
        sx: {
          maxWidth: 900,
          width: '100%',
        },
      }
    case ModalsKeys.FIXED_LOAN:
      return {
        component: <FixedLoanModal handleClose={handleClose} />,
      }
    case ModalsKeys.WITHDRAW_FUNDS_AT_EXPIRY:
      return {
        component: (
          <WIthdrawFundsAtExpiryModalWrapper handleClose={handleClose} />
        ),
      }
    case ModalsKeys.AUTO_CONVERSION_TO_VARIABLE:
      return {
        component: <AutoConversionToVariableModal handleClose={handleClose} />,
      }
    case ModalsKeys.FIX_APY:
      return {
        component: <FixApyModalWrapper handleClose={handleClose} />,
      }
    case ModalsKeys.UNRELEASED_FEATURE:
      return {
        component: <UnreleasedFeatureModal handleClose={handleClose} />,
      }
    case ModalsKeys.HISTORICAL_REPAYMENTS:
      return {
        component: <HistoricalRepaymentsModal handleClose={handleClose} />,
      }
    case ModalsKeys.VIEW_LOAN_CONTRACTS:
      return {
        component: <ViewLoanContractModal handleClose={handleClose} />,
      }
    case ModalsKeys.WIP_REDIRECT:
      return {
        component: <WipRedirectModal handleClose={handleClose} />,
        backdropSx: {
          backdropFilter: 'blur(20px)',
          bgcolor: 'rgba(31, 31, 34, 0.9)',
        },
        disableBackdropClose: true,
      }
    case ModalsKeys.NFT_DETECTED:
      return {
        component: <NftDetectedModal handleClose={handleClose} />,
        backdropSx: {
          backdropFilter: 'blur(20px)',
          bgcolor: 'rgba(31, 31, 34, 0.9)',
        },
        disableBackdropClose: true,
        disableElevation: true,
      }
    case ModalsKeys.REFERRAL:
      return {
        component: <ReferralModal handleClose={handleClose} />,
      }
    case ModalsKeys.REFERRED_USERS:
      return {
        component: <ReferredUsersModal handleClose={handleClose} />,
      }
    case ModalsKeys.REFERRAL_DETECTED:
      return {
        component: <ReferralDetectedModal handleClose={handleClose} />,
      }
    case ModalsKeys.BUY_KASU:
      return {
        component: <BuyKasuModalWrapper handleClose={handleClose} />,
      }
    case ModalsKeys.WRONG_NETWORK:
      return {
        component: <WrongNetworkModal handleClose={handleClose} />,
        backdropSx: {
          backdropFilter: 'blur(20px)',
          bgcolor: 'rgba(31, 31, 34, 0.9)',
        },
        disableBackdropClose: true,
        disableEscapeKeyDown: true,
        disableElevation: true,
      }
  }
}

const ModalsContainer = () => {
  const { modal } = useModalState()

  return (
    <>
      {Object.keys(modal).map((modalName) => (
        <DialogWrapper key={modalName} modalName={modalName as keyof Modals} />
      ))}
    </>
  )
}

export default ModalsContainer
