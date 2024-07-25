import { Typography } from '@mui/material'

import useTranslation from '@/hooks/useTranslation'

import UnorderedList from '@/components/atoms/UnorderedList'

const LoanStructure = () => {
  const { t } = useTranslation()

  return (
    <>
      <Typography variant='inherit'>
        {t('details.poolDetails.loan.tooltip-1')}
      </Typography>
      <br />
      <UnorderedList
        sx={{
          'li + li': {
            mt: 1,
          },
        }}
      >
        <li>{t('details.poolDetails.loan.list.list-0')}</li>
        <li>{t('details.poolDetails.loan.list.list-1')}</li>
        <li>{t('details.poolDetails.loan.list.list-2')}</li>
      </UnorderedList>
    </>
  )
}

export default LoanStructure
