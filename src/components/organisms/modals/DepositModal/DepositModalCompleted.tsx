import { Box, Button, Typography } from '@mui/material'

import useDepositModalState from '@/hooks/context/useDepositModalState'
import useModalState from '@/hooks/context/useModalState'

import UnorderedList from '@/components/atoms/UnorderedList'
import { PoolData } from '@/components/molecules/lending/overview/TranchesApyCard'

import { ModalsKeys } from '@/context/modal/modal.types'

import { formatAmount } from '@/utils'

type DepositModalCompletedProps = {
  poolData: PoolData
}

const DepositModalCompleted: React.FC<DepositModalCompletedProps> = ({
  poolData,
}) => {
  const { openModal } = useModalState()

  const { amount, trancheId } = useDepositModalState()

  const handleOpen = () => openModal({ name: ModalsKeys.LOYALTY_LEVELS })

  return (
    <Box px={1} pt={1} mt={2}>
      <Box width={413}>
        <Typography variant='subtitle1' component='p'>
          You have successfully queued:
        </Typography>
        <UnorderedList>
          <li>
            <Typography variant='subtitle1' component='p'>
              {formatAmount(amount || '0')} USDC •{' '}
              <Typography variant='subtitle2' component='span'>
                to be deposited in the next Epoch to
              </Typography>{' '}
              {poolData.poolName}
            </Typography>
          </li>
          {poolData.tranches.length > 1 && (
            <li>
              <Typography variant='subtitle2' component='p'>
                Tranches{' '}
                <Typography variant='subtitle1' component='span'>
                  •{' '}
                  {poolData.tranches.find(
                    (tranche) => tranche.trancheId === trancheId
                  )?.title || 'Tranche'}
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
        By depositing funds to this Lending Pool, you accept the{' '}
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
          Terms and Conditions.
        </Button>
      </Typography>
    </Box>
  )
}

export default DepositModalCompleted
