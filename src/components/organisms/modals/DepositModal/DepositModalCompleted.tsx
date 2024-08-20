import { Box, Button, Typography } from '@mui/material'

import useDepositModalState from '@/hooks/context/useDepositModalState'
import useModalState from '@/hooks/context/useModalState'
import useTranslation from '@/hooks/useTranslation'

import UnorderedList from '@/components/atoms/UnorderedList'

import { ModalsKeys } from '@/context/modal/modal.types'

import { formatAmount } from '@/utils'
import { PoolData } from '@/utils/lending/getPoolData'

type DepositModalCompletedProps = {
  poolData: PoolData
}

const DepositModalCompleted: React.FC<DepositModalCompletedProps> = ({
  poolData,
}) => {
  const { t } = useTranslation()

  const { openModal } = useModalState()

  const { amount, amountInUSD, trancheId } = useDepositModalState()

  const handleOpen = () => openModal({ name: ModalsKeys.LOYALTY_LEVELS })

  return (
    <Box px={1} pt={1} mt={2}>
      <Box width={413}>
        <Typography variant='subtitle1' component='p'>
          {t('modals.lending.completed.description-1')}
        </Typography>
        <UnorderedList>
          <li>
            <Typography variant='subtitle1' component='p'>
              {formatAmount(amountInUSD || amount || '0')} USDC •{' '}
              <Typography variant='subtitle2' component='span'>
                {t('modals.lending.completed.description-2')}
              </Typography>{' '}
              {poolData.poolName}
            </Typography>
          </li>
          {poolData.tranches.length > 1 && (
            <li>
              <Typography variant='subtitle2' component='p'>
                {t('general.tranche')}{' '}
                <Typography variant='subtitle1' component='span'>
                  •{' '}
                  {poolData.tranches.find(
                    (tranche) => tranche.trancheId === trancheId
                  )?.title || t('general.tranche')}
                </Typography>{' '}
              </Typography>
            </li>
          )}
        </UnorderedList>
      </Box>
      <Typography
        display='block'
        mt={2}
        variant='body2'
        component='p'
        textAlign='center'
      >
        {t('modals.lending.terms-and-conditions-1')}{' '}
        <Button
          onClick={handleOpen}
          variant='text'
          sx={{
            display: 'inline',
            p: 0,
            fontSize: 'inherit',
            fontWeight: 'inherit',
            fontFamily: 'inherit',
            textTransform: 'inherit',
            lineHeight: 'inherit',
          }}
        >
          {t('modals.lending.terms-and-conditions-2')}
        </Button>
      </Typography>
    </Box>
  )
}

export default DepositModalCompleted
