import { BoxProps } from '@mui/material'
import { ReactNode } from 'react'

import InfoColumn, { InfoColumnProps } from '@/components/atoms/InfoColumn'
import TokenAmount, { TokenAmountProps } from '@/components/atoms/TokenAmount'
import WaveBox, { WaveBoxProps } from '@/components/atoms/WaveBox'

type WaveCardProps = WaveBoxProps &
  BoxProps & {
    title: string
    toolTipInfo: ReactNode
    content: string
    unit: string
    infoColumnProps?: Omit<InfoColumnProps, 'title' | 'toolTipInfo' | 'metric'>
    tokenAmountProps?: Omit<TokenAmountProps, 'amount' | 'symbol'>
  }

const WaveCard: React.FC<WaveCardProps> = ({
  title,
  toolTipInfo,
  content,
  unit,
  infoColumnProps,
  tokenAmountProps,
  ...rest
}) => (
  <WaveBox borderRadius={2} py={4} px={2} {...rest}>
    <InfoColumn
      title={title}
      toolTipInfo={toolTipInfo}
      metric={
        <TokenAmount
          mt={0.5}
          amount={content}
          symbol={unit}
          {...tokenAmountProps}
        />
      }
      {...infoColumnProps}
    />
  </WaveBox>
)

export default WaveCard
