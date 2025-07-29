import { TableCell, TableRow } from '@mui/material'
import React, { Fragment } from 'react'

import DottedDivider from '@/components/atoms/DottedDivider'
import LendingDecisionsPendingTableRow from '@/components/organisms/lite/LendingDecisionsPending/LendingDecisionsPendingTableRow'

import dayjs from '@/dayjs'
import { PendingDecision } from '@/utils'

type LendingDecisionsPendingTableBodyProps = {
  pendingDecisions: PendingDecision[]
}

const LendingDecisionsPendingTableBody: React.FC<
  LendingDecisionsPendingTableBodyProps
> = ({ pendingDecisions }) => {
  return pendingDecisions.map((pendingDecision, index) => (
    <Fragment key={index}>
      {pendingDecision.tranches.map((tranche) =>
        tranche.tickets.map((ticket, ticketIndex) => (
          <LendingDecisionsPendingTableRow
            key={ticketIndex}
            poolName={pendingDecision.poolName}
            endTime={dayjs.unix(ticket.createdOn).add(2, 'days').unix()}
            tranche={tranche.name}
            ticket={ticket}
          />
        ))
      )}
      <TableRow>
        <TableCell colSpan={4} padding='none'>
          <DottedDivider />
        </TableCell>
      </TableRow>
    </Fragment>
  ))
}

export default LendingDecisionsPendingTableBody
