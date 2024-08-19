import { SVGProps } from 'react'

import { theme } from '@/themes/MainTheme'

export type DottedDividerProps = SVGProps<SVGSVGElement> & {
  color?: string
}

const DottedDivider: React.FC<DottedDividerProps> = ({
  color = theme.palette.gold.dark,
  ...props
}) => (
  <svg
    display='block'
    height='2'
    width='100%'
    preserveAspectRatio='none'
    {...props}
  >
    <line
      stroke={color}
      strokeWidth={2}
      x1='1'
      y1='1'
      x2='100%'
      y2='1'
      strokeDasharray='0, 4'
      strokeLinecap='round'
    />
  </svg>
)

export default DottedDivider
