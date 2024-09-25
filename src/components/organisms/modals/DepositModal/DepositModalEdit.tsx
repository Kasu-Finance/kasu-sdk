import { Box, Button } from '@mui/material'

import useDepositModalState from '@/hooks/context/useDepositModalState'
import useModalState from '@/hooks/context/useModalState'
import useModalStatusState from '@/hooks/context/useModalStatusState'
import useTranslation from '@/hooks/useTranslation'

import DepositTrancheSelect from '@/components/molecules/lending/DepositModal/DepositTrancheSelect'
import { PoolData } from '@/components/molecules/lending/overview/TranchesApyCard'
import DepositDescription from '@/components/organisms/modals/DepositModal/DepositDescription'
import SwapAndDeposit from '@/components/organisms/modals/DepositModal/SwapAndDeposit'

import { ModalsKeys } from '@/context/modal/modal.types'
import { ModalStatusAction } from '@/context/modalStatus/modalStatus.types'

type DepositModalEditProps = {
  poolData: PoolData
}

const DepositModalEdit: React.FC<DepositModalEditProps> = ({ poolData }) => {
  const { t } = useTranslation()

  const { openModal } = useModalState()

  const { amount, amountInUSD, termsAccepted } = useDepositModalState()

  const { modalStatus, setModalStatusAction } = useModalStatusState()

  const handleOpen = () => openModal({ name: ModalsKeys.LOYALTY_LEVELS })

  return (
    <Box display='grid' gap={2} mt={2}>
      <SwapAndDeposit
        title={t('modals.lock.swapAndDeposit.title')}
        poolData={poolData}
      />
      <DepositTrancheSelect poolData={poolData} />
      <DepositDescription />
      <Box display='flex' justifyContent='center' gap={1}>
        <Button
          variant='outlined'
          sx={{ fontSize: 15, width: 310, letterSpacing: '0.46px' }}
          onClick={handleOpen}
        >
          {t('modals.lock.actions.action-1')}
        </Button>
        <Button
          variant='contained'
          sx={{
            fontSize: 15,
            width: 225,
            letterSpacing: '0.46px',
          }}
          disabled={Boolean(
            !amount ||
              !amountInUSD ||
              modalStatus.type === 'error' ||
              modalStatus.type === 'focused' ||
              !termsAccepted
          )}
          onClick={() => setModalStatusAction(ModalStatusAction.REVIEWING)}
        >
          {t('modals.lock.actions.action-2')}
        </Button>
      </Box>
    </Box>
  )
}

export default DepositModalEdit
