import { Box, Divider, Tooltip, Typography } from '@mui/material'

import TooltipTrigger from '@/components/atoms/TooltipTrigger'

import { InfoIcon } from '@/assets/icons'

type TypographyVariant =
  | 'inherit'
  | 'button'
  | 'overline'
  | 'caption'
  | 'subtitle1'
  | 'subtitle2'
  | 'body1'
  | 'body2'

type InfoRowProps = {
  title: string
  subtitle?: string
  info: string
  showDivider?: boolean
  metricInfo: string
  metricStyle?: TypographyVariant
  tooltip?: boolean
}

const InfoRow: React.FC<InfoRowProps> = ({
  title,
  subtitle,
  info,
  showDivider = false,
  metricStyle = 'body2',
  tooltip = true,
  metricInfo,
}) => {
  return (
    <>
      <Box display='flex' justifyContent='space-between' px={2} py='6px'>
        <Box display='flex' alignItems='center'>
          <Box>
            <Typography
              variant='subtitle2'
              component='span'
              color='text.primary'
              mr='4px'
            >
              {title}
            </Typography>
            {subtitle && (
              <Typography
                variant='body2'
                component='span'
                color='text.primary'
                mr='4px'
              >
                {subtitle}
              </Typography>
            )}
          </Box>
          {tooltip && (
            <Tooltip disableFocusListener disableTouchListener title={info}>
              <TooltipTrigger>
                <InfoIcon />
              </TooltipTrigger>
            </Tooltip>
          )}
        </Box>
        <Typography variant={metricStyle} component='span'>
          {metricInfo}
        </Typography>
      </Box>
      {showDivider && <Divider />}
    </>
  )
}

export default InfoRow
