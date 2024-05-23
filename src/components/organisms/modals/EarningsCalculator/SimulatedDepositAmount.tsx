import { Box, Typography } from '@mui/material'
import { useState } from 'react'

import useModalStatusState from '@/hooks/context/useModalStatusState'
import { LoyaltyLevel } from '@/hooks/locking/useLoyaltyLevel'
import useTranslation from '@/hooks/useTranslation'

import ColoredBox from '@/components/atoms/ColoredBox'
import DepositAmountInput from '@/components/molecules/lending/DepositModal/DepositAmountInput'
import { PoolData } from '@/components/molecules/lending/overview/TranchesApyCard'
import SwapAndDepositInput from '@/components/molecules/SwapAndDepositInput'

type SimulatedDepositAmountProps = {
  loyaltyLevel: LoyaltyLevel
  poolData: PoolData
}

const SimulatedDepositAmount: React.FC<SimulatedDepositAmountProps> = ({
  loyaltyLevel,
  poolData,
}) => {
  const { t } = useTranslation()

  const { modalStatus } = useModalStatusState()

  const [selectedToken, setSelectedToken] = useState({
    balance: '0',
    decimals: 0,
  })

  const isLoyal = loyaltyLevel === 1 || loyaltyLevel === 2

  return (
    <Box my={2}>
      <Box display='flex' justifyContent='space-between' alignItems='center'>
        <Typography variant='subtitle1' component='span'>
          {t('modals.earningsCalculator.simulatedAmount.title')}
        </Typography>

        <Box display='flex' alignItems='center'>
          <Typography
            variant='body2'
            component='span'
            textTransform='capitalize'
          >
            {t('general.loyaltyLevel')}
          </Typography>
          <Box
            ml={1}
            display='flex'
            alignItems='center'
            bgcolor={(theme) => theme.palette.primary.main}
            color='white'
            height={32}
            px={1}
            borderRadius={1}
          >
            <Typography variant='subtitle2' component='span'>
              {isLoyal
                ? loyaltyLevel.toString()
                : t('locking.widgets.loyalty.level.level-0.title')}
            </Typography>
          </Box>
        </Box>
      </Box>
      <ColoredBox sx={{ bgcolor: modalStatus.bgColor, mt: 2, mb: 1 }}>
        <SwapAndDepositInput
          title={t('modals.earningsCalculator.simulatedAmount.metric-1')}
          setSelectedBalance={setSelectedToken}
        />
      </ColoredBox>
      <DepositAmountInput
        decimals={6}
        balance={selectedToken.balance}
        poolData={poolData}
        disabled={!selectedToken.decimals} // if decimals is zero, disable
      />
    </Box>
  )
}

export default SimulatedDepositAmount
