'use client'

import React from 'react'

import InfoColumn from '@/components/atoms/InfoColumn'
import TokenAmount from '@/components/atoms/TokenAmount'
import WaveBox from '@/components/atoms/WaveBox'

type HomeOverviewCardProps = {
  titleKey: string
  tooltipKey: string
  content: string
  unit: string
  isLast: boolean
}

const HomeOverviewCard: React.FC<HomeOverviewCardProps> = ({
  content,
  titleKey,
  tooltipKey,
  unit,
  isLast,
}) => {
  return (
    <WaveBox borderRadius={2} py={4} height={116}>
      <InfoColumn
        title={titleKey}
        titleStyle={{
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
          overflow: 'hidden',
          fontSize: { xs: 10, sm: 14 },
        }}
        containerSx={(theme) => ({
          [theme.breakpoints.down('md')]: isLast
            ? { gridColumn: '1/3' }
            : undefined,
        })}
        titleContainerSx={(theme) => ({
          py: 0,
          [theme.breakpoints.down('md')]: {
            px: 0,
          },
        })}
        toolTipInfo={tooltipKey}
        metric={<TokenAmount px={{ md: 2 }} amount={content} symbol={unit} />}
      />
    </WaveBox>
  )
}

export default HomeOverviewCard
