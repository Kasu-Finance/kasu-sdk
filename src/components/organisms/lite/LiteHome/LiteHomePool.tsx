import { Box, Collapse, Grid2, IconButton, Typography } from '@mui/material'
import Image from 'next/image'
import { useReducer } from 'react'
import ReactMarkdown from 'react-markdown'

import LendButton from '@/components/atoms/LendButton'
import ToolTip from '@/components/atoms/ToolTip'
import WaveBox from '@/components/atoms/WaveBox'
import LiteApyTooltip from '@/components/molecules/tooltips/Lite/LiteApyTooltip'
import TrancheAnimator from '@/components/organisms/lite/LiteHome/TrancheAnimator'

import { CollapsedCloseIcon, CollapsedOpenIcon } from '@/assets/icons'

import { customPalette } from '@/themes/palette'
import { headingFontFamily } from '@/themes/typography'
import { formatPercentage } from '@/utils'

import { PoolOverviewWithDelegate } from '@/types/page'

type LiteHomePoolProps = {
  pool: PoolOverviewWithDelegate
  currentEpoch: string
  layoutType: 1 | 2 | 3
}

const LiteHomePool: React.FC<LiteHomePoolProps> = ({
  pool,
  currentEpoch,
  layoutType,
}) => {
  const [collapsed, toggleCollapsed] = useReducer((prev) => !prev, false)

  const maxApy = [...pool.tranches].reduce(
    (max, tranche) => Math.max(max, parseFloat(tranche.maxApy)),
    0
  )

  return (
    <Grid2
      sx={{
        '@media (hover: hover) and (pointer: fine)': {
          '&:hover': {
            '.wave-box': {
              width: 330,
              height: 330,
            },
            '.tranche-animation': {
              animationPlayState: 'paused',
            },
          },
        },
        ...(layoutType === 1 && {
          maxWidth: 652,
        }),
      }}
      size={{ xs: 12, md: 12 / layoutType }}
      textAlign='center'
    >
      <Box
        sx={
          layoutType === 1
            ? {
                display: 'flex',
                alignItems: 'center',
                gap: { xs: 2, md: 4 },
                flexDirection: { xs: 'column', md: 'row' },
              }
            : null
        }
      >
        <Box display='flex' alignItems='center' justifyContent='center'>
          <WaveBox
            variant='dark-gray'
            className='wave-box'
            sx={{
              borderRadius: '50%',
              width: { xs: 220, sm: 250, md: 276 },
              height: { xs: 220, sm: 250, md: 276 },
              position: 'absolute',
              zIndex: -1,
              transition: 'width 0.3s ease, height 0.3s ease',
            }}
          />
          <Image
            src={pool.thumbnailImageUrl}
            alt={pool.poolName}
            width={584}
            height={584}
            style={{
              width: 'min(330px, 100%)',
              height: 'auto',
              aspectRatio: '1 / 1',
            }}
          />
        </Box>
        <Box>
          <Typography
            fontFamily={headingFontFamily}
            fontSize={{ xs: 16, md: 18 }}
            color='white'
          >
            UP TO
          </Typography>
          <Box display='flex' alignItems='end' justifyContent='center'>
            <Typography
              fontFamily={headingFontFamily}
              fontSize={{ xs: 44, sm: 56, md: 64 }}
              fontWeight={300}
              color='white'
              lineHeight={{ xs: '40px', sm: '48px', md: '52px' }}
            >
              <Typography variant='inherit' fontWeight={700} component='span'>
                {formatPercentage(maxApy, 0)}{' '}
              </Typography>
              APY
            </Typography>
            <ToolTip
              title={<LiteApyTooltip />}
              iconSx={{
                color: 'gold.dark',
                '&:hover': {
                  color: 'gold.extraDark',
                },
              }}
            />
          </Box>
          <Typography
            variant='h3'
            color='gold.dark'
            mt={layoutType === 1 ? 4 : 2}
          >
            {pool.poolName}
          </Typography>
          <TrancheAnimator
            tranches={pool.tranches}
            mt={layoutType === 1 ? 3 : 2}
            spacing={layoutType === 1 ? 4 : 2}
          />
        </Box>
      </Box>
      <IconButton
        onClick={toggleCollapsed}
        sx={{
          mt: 2,
          '&:focus:before': {
            position: 'absolute',
            content: '""',
            width: 'calc(100% + 4px)',
            height: 'calc(100% + 2px)',
            border: `2px dotted ${customPalette.primary.main}`,
            borderRadius: '50%',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          },
        }}
      >
        {collapsed ? <CollapsedCloseIcon /> : <CollapsedOpenIcon />}
      </IconButton>
      <Collapse in={collapsed} timeout={300}>
        <Typography variant='baseMd' color='white'>
          <ReactMarkdown skipHtml>{pool.liteDescription}</ReactMarkdown>
        </Typography>
      </Collapse>
      <LendButton
        sx={{ mt: 2 }}
        fullWidth
        pool={pool}
        currentEpoch={currentEpoch}
      />
    </Grid2>
  )
}

export default LiteHomePool
