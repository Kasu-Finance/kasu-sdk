import { Box, BoxProps, Typography } from '@mui/material'

import useTranslation from '@/hooks/useTranslation'

import RenderMetrics from '@/components/molecules/repayments/RenderMetrics'

import {
  RepaymentSection,
  RepaymentsSections,
} from '@/utils/convert/adaptDataForRepayments'

type RepaymentsDataCardProps = BoxProps & {
  data: RepaymentSection
  dataKey: keyof RepaymentsSections
}

const RepaymentsDataCard: React.FC<RepaymentsDataCardProps> = ({
  data,
  dataKey,
  ...rest
}) => {
  const { t } = useTranslation()

  return (
    <Box sx={{ width: '100%' }} {...rest}>
      <Typography variant='subtitle1'>
        {t(`repayments.sections.${dataKey}.title`)}
      </Typography>
      <Typography variant='caption' sx={{ mb: 2 }} component='p'>
        {t(`repayments.sections.${dataKey}.titleSuffix`)}
      </Typography>
      <RenderMetrics data={data} sectionKey={dataKey} />
    </Box>
  )
}

export default RepaymentsDataCard
