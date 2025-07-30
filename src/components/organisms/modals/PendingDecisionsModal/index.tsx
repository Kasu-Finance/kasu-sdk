import { Button, TableCell, TableRow, Typography } from '@mui/material'

import useModalState from '@/hooks/context/useModalState'
import getTranslation from '@/hooks/useTranslation'

import CustomCard from '@/components/atoms/CustomCard'
import { DialogChildProps } from '@/components/atoms/DialogWrapper'
import CustomTable from '@/components/molecules/CustomTable'
import DialogHeader from '@/components/molecules/DialogHeader'
import PendingDecisionsTableHeader from '@/components/organisms/modals/PendingDecisionsModal/PendingDecisionsTableHeader'
import PendingDecisionsTableRow from '@/components/organisms/modals/PendingDecisionsModal/PendingDecisionsTableRow'

import { ModalsKeys } from '@/context/modal/modal.types'

const PendingDecisionModal: React.FC<DialogChildProps> = ({ handleClose }) => {
  const { t } = getTranslation()

  const { modal } = useModalState()

  const { pendingDecisions } = modal[ModalsKeys.PENDING_DECISIONS]

  return (
    <CustomCard>
      <DialogHeader
        title={t('modals.pendingDecisions.title')}
        onClose={handleClose}
      />
      <CustomTable
        sx={{
          pb: 0,
        }}
        tableSx={{
          background: 'url("/images/wave-dark-gold.png") repeat',
          backgroundSize: '17px 16px',
        }}
        tableBodySx={{
          background: 'url("/images/wave-gold.png") repeat',
          backgroundSize: '17px 16px',
          '& .MuiTableRow-root:first-child': {
            display: 'none',
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
        tableHeader={<PendingDecisionsTableHeader />}
        tableBody={
          pendingDecisions.length ? (
            pendingDecisions.map((pendingDecision) => (
              <PendingDecisionsTableRow
                key={pendingDecision.id}
                pendingDecision={pendingDecision}
              />
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4}>
                <Typography variant='h4' textAlign='center' mb={4} mt={2}>
                  {t('modals.pendingDecisions.emptyDataMessage')}
                </Typography>
                <Button
                  variant='contained'
                  color='secondary'
                  fullWidth
                  onClick={handleClose}
                  sx={{ textTransform: 'capitalize' }}
                >
                  {t('general.close')}
                </Button>
              </TableCell>
            </TableRow>
          )
        }
      />
    </CustomCard>
  )
}

export default PendingDecisionModal
