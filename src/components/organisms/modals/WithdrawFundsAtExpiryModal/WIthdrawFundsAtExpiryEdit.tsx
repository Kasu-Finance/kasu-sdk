import { Box, Button, Stack, Typography } from '@mui/material'
import { useState } from 'react'

import useModalState from '@/hooks/context/useModalState'
import useWithdrawFundsAtExpiry from '@/hooks/lending/useWithdrawFundsAtExpiry'
import getTranslation from '@/hooks/useTranslation'

import { DialogChildProps } from '@/components/atoms/DialogWrapper'
import CustomTable from '@/components/molecules/CustomTable'
import WithdrawFundsAtExpiryTableHeader from '@/components/organisms/modals/WithdrawFundsAtExpiryModal/WithdrawFundsAtExpiryTableHeader'
import WithdrawFundsAtExpiryTableRow from '@/components/organisms/modals/WithdrawFundsAtExpiryModal/WithdrawFundsAtExpiryTableRow'

import { ModalsKeys } from '@/context/modal/modal.types'

const WithdrawFundsAtExpiryEdit: React.FC<DialogChildProps> = ({
  handleClose,
}) => {
  const { t } = getTranslation()

  const { modal } = useModalState()

  const { fixedLoans, pool } = modal[ModalsKeys.WITHDRAW_FUNDS_AT_EXPIRY]

  const [fixedTermDepositId, setFixedTermDepositId] = useState('')

  const withdrawFundsAtExpiry = useWithdrawFundsAtExpiry()

  return (
    <>
      <CustomTable
        sx={{
          pb: 0,
        }}
        tableSx={{
          background: 'url("/images/wave-dark-gold.png") repeat',
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
        }}
        tableBodySx={{
          background: 'url("/images/wave-gold.png") repeat',
          '& .MuiTableRow-root:first-child .MuiTableCell-root': {
            pb: 2,
          },
          'tr:nth-child(2)': {
            'td:first-child': {
              borderTopLeftRadius: 8,
            },
            'td:last-child': {
              borderTopRightRadius: 8,
            },
          },
        }}
        tableHeader={<WithdrawFundsAtExpiryTableHeader />}
        tableBody={fixedLoans.map((fixedLoan, index) => (
          <WithdrawFundsAtExpiryTableRow
            fixedLoan={fixedLoan}
            fixedTermDepositId={fixedTermDepositId}
            setFixedTermDeposit={setFixedTermDepositId}
            key={index}
          />
        ))}
      />
      <Stack spacing={3} p={2}>
        <Typography variant='baseMd'>
          {t('modals.withdrawFundsAtExpiry.description-1')}{' '}
          <Typography variant='baseMdBold'>
            {t('modals.withdrawFundsAtExpiry.description-2').replace(
              '{{ epoch }}',
              pool.requestEpochsInAdvance
            )}{' '}
          </Typography>
          {t('modals.withdrawFundsAtExpiry.description-3')}
        </Typography>
        <Box display='flex' gap={4}>
          <Button
            variant='outlined'
            color='secondary'
            onClick={handleClose}
            fullWidth
            sx={{ textTransform: 'capitalize', maxWidth: 175 }}
          >
            {t('general.cancel')}
          </Button>
          <Button
            variant='contained'
            color='secondary'
            onClick={() => withdrawFundsAtExpiry(pool.id, fixedTermDepositId)}
            fullWidth
            sx={{ textTransform: 'capitalize' }}
          >
            {t('modals.withdrawFundsAtExpiry.action')}
          </Button>
        </Box>
      </Stack>
    </>
  )
}

export default WithdrawFundsAtExpiryEdit
