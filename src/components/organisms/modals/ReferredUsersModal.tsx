import { Button, TableCell, TableRow, Typography } from '@mui/material'
import React, { Fragment } from 'react'

import useModalState from '@/hooks/context/useModalState'
import getTranslation from '@/hooks/useTranslation'

import CustomCard from '@/components/atoms/CustomCard'
import { DialogChildProps } from '@/components/atoms/DialogWrapper'
import DottedDivider from '@/components/atoms/DottedDivider'
import WaveBox from '@/components/atoms/WaveBox'
import CustomTable from '@/components/molecules/CustomTable'
import DialogHeader from '@/components/molecules/DialogHeader'

import { ModalsKeys } from '@/context/modal/modal.types'

import { formatAccount, formatAmount, toBigNumber } from '@/utils'

const ReferredUsersModal: React.FC<DialogChildProps> = ({ handleClose }) => {
  const { t } = getTranslation()

  const { modal } = useModalState()

  const { referredUsers } = modal[ModalsKeys.REFERRED_USERS]

  return (
    <CustomCard>
      <DialogHeader title='Referred Users' onClose={handleClose} />

      <CustomTable
        sx={{ pb: 0 }}
        tableSx={{
          background: 'url("/images/wave-dark-gold.png") repeat',
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
        }}
        tableBodySx={{
          background: 'url("/images/wave-gold.png") repeat',
        }}
        tableHeader={
          <TableRow>
            <TableCell width='40%'>User</TableCell>
            <TableCell width='30%' align='right'>
              First Deposit Amount
            </TableCell>
            <TableCell width='30%' align='right'>
              Reward Earned
            </TableCell>
          </TableRow>
        }
        tableBody={
          referredUsers.length ? (
            referredUsers.map(
              ({ user, depositAmount, referralReward }, index) => {
                const hasDeposited = toBigNumber(depositAmount).gt(0)

                return (
                  <Fragment key={user}>
                    {index !== 0 && (
                      <TableRow>
                        <TableCell colSpan={3} sx={{ py: 0 }}>
                          <DottedDivider color='white' />
                        </TableCell>
                      </TableRow>
                    )}
                    <TableRow>
                      <TableCell>{formatAccount(user)}</TableCell>
                      <TableCell align='right'>
                        {hasDeposited
                          ? `${formatAmount(depositAmount, { minDecimals: 2 })} USDC`
                          : 'N/A'}
                      </TableCell>
                      <TableCell align='right'>
                        {hasDeposited
                          ? `${formatAmount(referralReward, { minDecimals: 2 })} USDC`
                          : 'N/A'}
                      </TableCell>
                    </TableRow>
                  </Fragment>
                )
              }
            )
          ) : (
            <TableRow>
              <TableCell colSpan={3}>
                <Typography variant='h4' textAlign='center' mb={4} mt={2}>
                  You have not referred any users yet...
                </Typography>
              </TableCell>
            </TableRow>
          )
        }
      />
      <WaveBox variant='gold' sx={{ px: 2, pt: 1, pb: 3 }}>
        <Button
          variant='contained'
          color='secondary'
          sx={{ textTransform: 'capitalize' }}
          onClick={handleClose}
          fullWidth
        >
          {t('general.close')}
        </Button>
      </WaveBox>
    </CustomCard>
  )
}

export default ReferredUsersModal
