import { Box, Typography } from '@mui/material'
import { Dispatch, SetStateAction } from 'react'

import useTranslation from '@/hooks/useTranslation'

import NumericalInput from '@/components/molecules/NumericalInput'

type DepositInputProps = {
  balance: string
  amount: string
  setAmount: Dispatch<SetStateAction<string>>
}

const DepositInput: React.FC<DepositInputProps> = ({
  balance,
  amount,
  setAmount,
}) => {
  const handleMax = () => setAmount(balance)
  const { t } = useTranslation()

  return (
    <Box>
      <Typography variant='subtitle1' component='span' display='block'>
        {t('modals.lock.deposit.title')}
      </Typography>
      <NumericalInput
        amount={amount}
        setAmount={setAmount}
        formControlProps={{ sx: { mt: 1 } }}
        handleMax={handleMax}
      />
      <Typography
        mt='3px'
        ml={1.5}
        variant='caption'
        component='span'
        display='block'
        sx={{ textTransform: 'capitalize' }}
      >
        {`${t('general.balance')} ${balance} KSU`}
      </Typography>
    </Box>
  )
}

export default DepositInput
