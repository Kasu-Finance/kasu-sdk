import { Button, Stack, Typography } from '@mui/material'

import getTranslation from '@/hooks/useTranslation'

import CustomCard from '@/components/atoms/CustomCard'
import { DialogChildProps } from '@/components/atoms/DialogWrapper'
import WaveBox from '@/components/atoms/WaveBox'
import CustomTable from '@/components/molecules/CustomTable'
import DialogHeader from '@/components/molecules/DialogHeader'
import FixedLoanTableHeader from '@/components/organisms/modals/FixedLoanModal/FixedLoanTableHeader'
import FixedLoanTableRow from '@/components/organisms/modals/FixedLoanModal/FixedLoanTableRow'

const FixedLoanModal: React.FC<DialogChildProps> = ({ handleClose }) => {
  const { t } = getTranslation()

  return (
    <CustomCard>
      <DialogHeader title={t('modals.fixedLoan.title')} onClose={handleClose} />
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
        tableHeader={<FixedLoanTableHeader />}
        tableBody={[1, 2].map((_, index) => (
          <FixedLoanTableRow key={index} />
        ))}
      />
      <WaveBox variant='gold' sx={{ px: 2, pt: 1, pb: 3 }}>
        <Stack spacing={3}>
          <Typography variant='baseSm'>
            <Typography variant='inherit' color='error' component='span'>
              *{' '}
            </Typography>
            {t('modals.fixedLoan.description')}
          </Typography>
          <Button
            variant='contained'
            color='secondary'
            sx={{ textTransform: 'capitalize' }}
            onClick={handleClose}
          >
            {t('general.close')}
          </Button>
        </Stack>
      </WaveBox>
    </CustomCard>
  )
}

export default FixedLoanModal
