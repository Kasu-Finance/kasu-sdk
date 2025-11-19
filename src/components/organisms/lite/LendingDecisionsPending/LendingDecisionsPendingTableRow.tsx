import { Button, TableCell, TableRow } from '@mui/material'

import useModalState from '@/hooks/context/useModalState'
import getTranslation from '@/hooks/useTranslation'

import Countdown from '@/components/atoms/Countdown'

import { ModalsKeys } from '@/context/modal/modal.types'

import { OptInOutIcon } from '@/assets/icons'

import { customPalette } from '@/themes/palette'
import { customTypography } from '@/themes/typography'
import { LoanTicket } from '@/utils'

type LendingDecisionsPendingTableRowProps = {
  poolName: string
  tranche: string
  endTime: EpochTimeStamp
  ticket: LoanTicket
}

const LendingDecisionsPendingTableRow: React.FC<
  LendingDecisionsPendingTableRowProps
> = ({ endTime, poolName, ticket, tranche }) => {
  const { t } = getTranslation()

  const { openModal } = useModalState()

  const handleOpen = (loanTicket: LoanTicket) =>
    openModal({
      name: ModalsKeys.BORROWER_IDENTIFIED,
      subsequentTransaction: {
        amount: loanTicket.assets,
        endBorrowerID: loanTicket.endBorrowerID,
        poolID: loanTicket.poolID,
        timestamp: loanTicket.createdOn,
        trancheID: loanTicket.trancheID,
      },
      poolName: poolName,
    })

  return (
    <TableRow
      sx={{
        '.MuiTableCell-root': {
          py: 1,
        },
      }}
    >
      <TableCell>{poolName}</TableCell>
      <TableCell align='right'>{tranche}</TableCell>
      <TableCell align='right'>
        <Countdown
          endTime={endTime}
          format='HH:mm:ss'
          render={(countDown) => {
            const [hours, minutes, seconds] = countDown.split(':')

            return `${hours} hrs, ${minutes} mins, ${seconds} secs`
          }}
        />
      </TableCell>
      <TableCell align='right'>
        <Button
          variant='text'
          sx={{
            ...customTypography.baseSmBold,
            color: 'gold.middle',
            textTransform: 'capitalize',
            height: 21,
            '.MuiButton-startIcon path': {
              fill: customPalette.gold.middle,
            },
          }}
          startIcon={<OptInOutIcon />}
          onClick={() => handleOpen(ticket)}
        >
          {t('general.optInOut')}
        </Button>
      </TableCell>
    </TableRow>
  )
}

export default LendingDecisionsPendingTableRow
