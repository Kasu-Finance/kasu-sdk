import { Button, TableCell, TableRow } from '@mui/material'
import { Fragment } from 'react'

import useModalState from '@/hooks/context/useModalState'
import getTranslation from '@/hooks/useTranslation'

import Countdown from '@/components/atoms/Countdown'
import DottedDivider from '@/components/atoms/DottedDivider'

import { ModalsKeys } from '@/context/modal/modal.types'

import { OptInOutIcon } from '@/assets/icons'

import { LoanTicketDto } from '@/config/api.lendersAgreement'
import dayjs from '@/dayjs'
import { customTypography } from '@/themes/typography'
import {
  formatAmount,
  formatTimestamp,
  LoanTicket,
  mapPendingDecisionsToPools,
  PendingDecision,
} from '@/utils'

type PendingDecisionsTableRowProps = {
  pendingDecision: PendingDecision
}

const PendingDecisionsTableRow: React.FC<PendingDecisionsTableRowProps> = ({
  pendingDecision,
}) => {
  const { t } = getTranslation()

  const { openModal, modal } = useModalState()

  const { pools } = modal[ModalsKeys.PENDING_DECISIONS]

  const handleOpen = (loanTicket: LoanTicket) =>
    openModal({
      name: ModalsKeys.BORROWER_IDENTIFIED,
      loanTicket,
      poolName: pendingDecision.poolName,
      callback: (newLoanTickets: LoanTicketDto[]) => {
        openModal({
          name: ModalsKeys.PENDING_DECISIONS,
          pendingDecisions: mapPendingDecisionsToPools(newLoanTickets, pools)
            .pendingDecisions,
          pools: pools,
        })
      },
    })

  return (
    <>
      <TableRow>
        <TableCell colSpan={4} sx={{ ...customTypography.h4, pt: 3 }}>
          {pendingDecision.poolName}
        </TableCell>
      </TableRow>
      {pendingDecision.tranches.map((tranche) => (
        <Fragment key={tranche.id}>
          <TableRow>
            <TableCell
              colSpan={4}
              sx={{ ...customTypography.baseMdBold, pb: 1 }}
            >
              {tranche.name} {t('general.tranche')}
            </TableCell>
          </TableRow>
          {tranche.tickets.map((ticket) => (
            <Fragment key={ticket.id}>
              <TableRow
                sx={{
                  '.MuiTableCell-root': {
                    pt: 0,
                    pb: 1,
                  },
                }}
              >
                <TableCell>
                  {
                    formatTimestamp(dayjs(ticket.createdOn).unix(), {
                      format: 'DD.MM.YYYY',
                    }).date
                  }
                </TableCell>
                <TableCell>
                  {formatAmount(ticket.assets, { minDecimals: 2 })} USDC
                </TableCell>
                <TableCell>
                  <Countdown
                    endTime={dayjs.unix(ticket.createdOn).add(2, 'days').unix()}
                    format='HH:mm:ss'
                    render={(countDown) => {
                      const [hours, minutes, seconds] = countDown.split(':')

                      return `${hours} hrs, ${minutes} mins, ${seconds} secs.`
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Button
                    variant='text'
                    sx={{
                      ...customTypography.baseMdBold,
                      color: 'white',
                      textTransform: 'capitalize',
                      height: 21,
                    }}
                    startIcon={<OptInOutIcon />}
                    onClick={() => handleOpen(ticket)}
                  >
                    {t('general.optInOut')}
                  </Button>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={4} sx={{ pt: 0 }}>
                  <DottedDivider color='white' />
                </TableCell>
              </TableRow>
            </Fragment>
          ))}
        </Fragment>
      ))}
    </>
  )
}

export default PendingDecisionsTableRow
