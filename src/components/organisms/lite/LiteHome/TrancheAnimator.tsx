import { TrancheData } from '@kasufinance/kasu-sdk'
import { Box, keyframes, Stack, StackProps, Typography } from '@mui/material'
import { useState } from 'react'

import ProgressBar from '@/components/atoms/ProgressBar'
import ToolTip from '@/components/atoms/ToolTip'
import LiteTrancheTooltip from '@/components/molecules/tooltips/Lite/LiteTrancheTooltip'

import { formatPercentage } from '@/utils'

const generateArrangement = (index: number, tranches: TrancheData[]) => {
  const current = tranches[index]

  const next = tranches[index + 1] ?? tranches[0]

  return [current, next]
}

const getAnimation = (index: number) => {
  switch (index) {
    case 1:
      return `${letterSwapEffectLast}`
    default:
      return `${letterSwapEffectMiddle}`
  }
}

const letterSwapEffectMiddle = keyframes`
  0% {
    transform: translateY(0%);
  }
  100%{
      transform: translateY(-105%);
  }
`
const letterSwapEffectLast = keyframes`
  from {
    transform: translateY(0%);
  }
  to {
    transform: translateY(-100%);
  }
`

// duration in seconds
const ANIMATION_DURATION = 4

type TrancheAnimatorProps = StackProps & {
  tranches: TrancheData[]
}

const TrancheAnimator: React.FC<TrancheAnimatorProps> = ({
  tranches,
  ...rest
}) => {
  const [animate, setAnimate] = useState({
    active: 0,
    total: tranches.length,
  })

  const [currentTranche, setCurrentTranche] = useState(tranches[0])

  const [arrangement, setArragement] = useState(
    generateArrangement(animate.active, tranches)
  )

  const handleAnimateStart = () => {
    setCurrentTranche(tranches[animate.active + 1] ?? tranches[0])
  }

  const handleAnimateEnd = () => {
    setAnimate((prev) => {
      const newActive = prev.active + 1
      const active = newActive >= prev.total ? 0 : newActive

      setArragement(generateArrangement(active, tranches))

      return {
        ...prev,
        active,
      }
    })
  }

  return (
    <Stack {...rest}>
      <Box
        display='flex'
        alignItems='center'
        justifyContent='center'
        color='white'
        height={16}
        position='relative'
      >
        <Box
          sx={{
            position: 'absolute',
            width: '100%',
            overflow: 'hidden',
            height: 18,
          }}
        >
          {arrangement.map((tranche, trancheIndex) => {
            return (
              <Typography
                key={tranche.id}
                variant='h4'
                sx={{
                  position: 'relative',
                  height: 18,
                  lineHeight: '18px',
                }}
              >
                {[...`${tranche.name}#Tranche`].map((letter, index) => (
                  <Typography
                    key={index}
                    variant='inherit'
                    component='span'
                    sx={{
                      position: 'relative',
                      display: 'inline-block',
                      animation: `${getAnimation(trancheIndex)} ${(index + 1) * 0.1}s cubic-bezier(0.65, 0, 0.21, 1.47) ${ANIMATION_DURATION}s forwards`,
                    }}
                    className='tranche-animation'
                    onAnimationStart={
                      index === 0 ? handleAnimateStart : undefined
                    }
                  >
                    {letter.replace('#', '\u00a0')}
                  </Typography>
                ))}
                <ToolTip
                  title={<LiteTrancheTooltip />}
                  className='tranche-animation'
                  iconSx={{
                    color: 'gold.dark',
                    position: 'relative',
                    display: 'inline-block',
                    animation: `${getAnimation(trancheIndex)} ${(tranche.name.length + 9) * 0.1}s cubic-bezier(0.65, 0, 0.21, 1.47) ${ANIMATION_DURATION}s forwards`,
                    '&:hover': {
                      color: 'gold.extraDark',
                    },
                  }}
                  onAnimationEnd={
                    trancheIndex === 0 ? handleAnimateEnd : undefined
                  }
                />
              </Typography>
            )
          })}
        </Box>
      </Box>
      <ProgressBar
        value={(1 - parseFloat(currentTranche.poolCapacityPercentage)) * 100}
        barStyles={{
          height: 16,
          '&.progress-background': {
            backgroundColor: 'gray.dark',
          },
          '&.progress-foreground': {
            borderRadius: 40,
            transition: 'width 1s cubic-bezier(0.65, 0, 0.21, 1.47)',
          },
        }}
        rootStyles={{
          height: 16,
          borderRadius: 30,
          textAlign: 'left',
          width: { xs: 200, sm: 222 },
          alignSelf: 'center',
        }}
      >
        <Typography variant='baseXs' width='100%' px={1}>
          {formatPercentage(
            1 - parseFloat(currentTranche.poolCapacityPercentage),
            0
          )}{' '}
          FULL
        </Typography>
      </ProgressBar>
    </Stack>
  )
}
export default TrancheAnimator
