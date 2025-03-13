import { Button, Stack, Typography } from '@mui/material'

import useModalState from '@/hooks/context/useModalState'
import getTranslation from '@/hooks/useTranslation'

import CustomCard from '@/components/atoms/CustomCard'
import { DialogChildProps } from '@/components/atoms/DialogWrapper'
import CustomTable from '@/components/molecules/CustomTable'
import DialogContent from '@/components/molecules/DialogContent'
import DialogHeader from '@/components/molecules/DialogHeader'
import AutoConversionTableHeader from '@/components/organisms/modals/AutoConversionToVariableModal/AutoConversionTableHeader'
import AutoConversionTableRow from '@/components/organisms/modals/AutoConversionToVariableModal/AutoConversionTableRow'

import { ModalsKeys } from '@/context/modal/modal.types'

const AutoConversionToVariableModal: React.FC<DialogChildProps> = ({
  handleClose,
}) => {
  const { t } = getTranslation()

  const { modal } = useModalState()

  const { epochNumber, fixedLoans } =
    modal[ModalsKeys.AUTO_CONVERSION_TO_VARIABLE]

  return (
    <CustomCard>
      <DialogHeader
        title={t('modals.autoConversionToVariable.title')}
        onClose={handleClose}
      />
      <DialogContent p={0}>
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
          }}
          tableHeader={<AutoConversionTableHeader />}
          tableBody={fixedLoans.map((fixedLoan, index) => (
            <AutoConversionTableRow fixedLoan={fixedLoan} key={index} />
          ))}
        />
        <Stack spacing={3} p={2}>
          <Typography variant='baseMd'>
            {t('modals.autoConversionToVariable.description').replace(
              '{{ epoch }}',
              epochNumber
            )}
          </Typography>
          <Button
            variant='contained'
            color='secondary'
            fullWidth
            sx={{ textTransform: 'capitalize' }}
            onClick={handleClose}
          >
            {t('general.close')}
          </Button>
        </Stack>
      </DialogContent>
    </CustomCard>
  )
}

export default AutoConversionToVariableModal
