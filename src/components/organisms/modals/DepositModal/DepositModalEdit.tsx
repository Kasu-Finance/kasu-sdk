import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import VerifiedIcon from '@mui/icons-material/Verified'
import { Box, Button } from '@mui/material'
import { formatUnits } from 'ethers/lib/utils'

import useDepositModalState from '@/hooks/context/useDepositModalState'
import useModalState from '@/hooks/context/useModalState'
import useModalStatusState from '@/hooks/context/useModalStatusState'
import useUserBalance from '@/hooks/web3/useUserBalance'

import DepositAmountInput from '@/components/molecules/lending/DepositModal/DepositAmountInput'
import DepositModalOverview from '@/components/molecules/lending/DepositModal/DepositModalOverview'
import DepositTrancheSelect from '@/components/molecules/lending/DepositModal/DepositTrancheSelect'
import { PoolData } from '@/components/molecules/lending/overview/TranchesApyCard'
import DepositDescription from '@/components/organisms/modals/DepositModal/DepositDescription'

import { ModalStatusAction } from '@/context/modalStatus/modalStatus.types'

import { USDC } from '@/config/sdk'

type DepositModalEditProps = {
  poolData: PoolData
}

const DepositModalEdit: React.FC<DepositModalEditProps> = ({ poolData }) => {
  const { balance, decimals } = useUserBalance(USDC)

  const { openModal } = useModalState()

  const { amount } = useDepositModalState()

  const { modalStatus, setModalStatusAction } = useModalStatusState()

  const handleOpen = () => openModal({ name: 'loyaltyLevelsModal' })

  const userBalance = formatUnits(balance || '0', decimals)

  return (
    <Box display='grid' gap={2} mt={2}>
      <DepositModalOverview poolData={poolData} userBalance={userBalance} />
      <DepositAmountInput poolData={poolData} />
      <DepositTrancheSelect poolData={poolData} />
      <DepositDescription />
      <Box display='flex' justifyContent='center' gap={2}>
        <Button
          variant='outlined'
          startIcon={<VerifiedIcon />}
          sx={{ fontSize: 15, width: 342, letterSpacing: '0.46px' }}
          onClick={handleOpen}
        >
          INCREASE/ESTABLISH LOYALTY LEVEL
        </Button>
        <Button
          variant='contained'
          endIcon={<ChevronRightIcon />}
          sx={{
            fontSize: 15,
            width: 194,
            letterSpacing: '0.46px',
          }}
          disabled={Boolean(!amount || modalStatus.type === 'error')}
          onClick={() => setModalStatusAction(ModalStatusAction.REVIEWING)}
        >
          REVIEW DEPOSIT
        </Button>
      </Box>
    </Box>
  )
}

export default DepositModalEdit
