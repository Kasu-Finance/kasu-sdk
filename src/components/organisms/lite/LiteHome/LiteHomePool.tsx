import { Box, Collapse, Grid2, IconButton, Typography } from '@mui/material'
import Image from 'next/image'
import { useReducer } from 'react'

import LendButton from '@/components/atoms/LendButton'
import ToolTip from '@/components/atoms/ToolTip'
import WaveBox from '@/components/atoms/WaveBox'
import TrancheAnimator from '@/components/organisms/lite/LiteHome/TrancheAnimator'

import { CollapsedCloseIcon, CollapsedOpenIcon } from '@/assets/icons'

import { headingFontFamily } from '@/themes/typography'
import { formatPercentage } from '@/utils'

import { PoolOverviewWithDelegate } from '@/types/page'

type LiteHomePoolProps = {
  pool: PoolOverviewWithDelegate
  currentEpoch: string
}

const LiteHomePool: React.FC<LiteHomePoolProps> = ({ pool, currentEpoch }) => {
  const [collapsed, toggleCollapsed] = useReducer((prev) => !prev, false)

  const maxApy = [...pool.tranches].reduce(
    (max, tranche) => Math.max(max, parseFloat(tranche.maxApy)),
    0
  )

  return (
    <Grid2
      sx={{
        '&:hover': {
          '.wave-box': {
            width: 330,
            height: 330,
          },

          '.tranche-animation': {
            animationPlayState: 'paused',
          },
        },
      }}
      textAlign='center'
    >
      <Box display='flex' alignItems='center' justifyContent='center'>
        <WaveBox
          variant='dark-gray'
          className='wave-box'
          sx={{
            borderRadius: '50%',
            width: 276,
            height: 276,
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
            width: 330,
            height: 330,
          }}
        />
      </Box>
      <Typography fontFamily={headingFontFamily} fontSize={18} color='white'>
        UP TO
      </Typography>
      <Box display='flex' alignItems='end' justifyContent='center'>
        <Typography
          fontFamily={headingFontFamily}
          fontSize={64}
          fontWeight={300}
          color='white'
          lineHeight='52px'
        >
          <Typography variant='inherit' fontWeight={700} component='span'>
            {formatPercentage(maxApy, 0).replaceAll(' %', '%')}{' '}
          </Typography>
          APY
        </Typography>
        <ToolTip
          title='info'
          iconSx={{
            color: 'gold.dark',
            '&:hover': {
              color: 'gold.extraDark',
            },
          }}
        />
      </Box>
      <Typography variant='h3' color='gold.dark' mt={2}>
        {pool.poolName}
      </Typography>
      <TrancheAnimator tranches={pool.tranches} />
      <IconButton onClick={toggleCollapsed} sx={{ mt: 2 }}>
        {collapsed ? <CollapsedCloseIcon /> : <CollapsedOpenIcon />}
      </IconButton>
      <Collapse in={collapsed} timeout={300}>
        <Typography variant='baseMd' color='white'>
          {pool.liteDescription}
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
