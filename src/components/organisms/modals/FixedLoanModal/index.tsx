import { Button, Stack, Typography } from '@mui/material'

import useModalState from '@/hooks/context/useModalState'
import getTranslation from '@/hooks/useTranslation'

import CustomCard from '@/components/atoms/CustomCard'
import { DialogChildProps } from '@/components/atoms/DialogWrapper'
import WaveBox from '@/components/atoms/WaveBox'
import CustomTable from '@/components/molecules/CustomTable'
import DialogHeader from '@/components/molecules/DialogHeader'
import FixedLoanTableHeader from '@/components/organisms/modals/FixedLoanModal/FixedLoanTableHeader'
import FixedLoanTableRow from '@/components/organisms/modals/FixedLoanModal/FixedLoanTableRow'

import { ModalsKeys } from '@/context/modal/modal.types'

import { Routes } from '@/config/routes'

const FixedLoanModal: React.FC<DialogChildProps> = ({ handleClose }) => {
  const { t } = getTranslation()

  const { modal } = useModalState()

  const { fixedLoans } = modal[ModalsKeys.FIXED_LOAN]

  return (
    <CustomCard>
      <DialogHeader title={t('modals.fixedLoan.title')} onClose={handleClose} />
      <CustomTable
        sx={{
          pb: 0,
        }}
        tableSx={{
          background: 'url("/images/wave-dark-gold.png") repeat',
          backgroundSize: '17px 16px',
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
        }}
        tableBodySx={{
          background: 'url("/images/wave-gold.png") repeat',
          backgroundSize: '17px 16px',
          '& .MuiTableRow-root:first-child .MuiTableCell-root': {
            pb: 2,
          },
        }}
        tableHeader={<FixedLoanTableHeader />}
        tableBody={fixedLoans.map((fixedLoan, index) => (
          <FixedLoanTableRow fixedLoan={fixedLoan} key={index} />
        ))}
      />
      <WaveBox variant='gold' sx={{ px: 2, pt: 1, pb: 3 }}>
        <Stack spacing={3}>
          <Typography variant='baseSm'>
            {t('modals.fixedLoan.description-1')}{' '}
            <Button
              variant='text'
              sx={{
                p: 0,
                height: 'auto',
                textTransform: 'unset',
                font: 'inherit',
                verticalAlign: 'inherit',
                display: 'inline',
                color: 'white',
              }}
              href={Routes.portfolio.root.url}
              target='_blank'
              style={{ font: 'inherit', color: 'white' }}
            >
              {t('general.myPortfolio')}
            </Button>{' '}
            {t('modals.fixedLoan.description-2')}
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
