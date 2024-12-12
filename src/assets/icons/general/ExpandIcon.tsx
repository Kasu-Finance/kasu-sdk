import { customPalette } from '@/themes/palette'
import { customTypography } from '@/themes/typography'

type ExpandIconProps = {
  text: string
}

const ExpandIcon: React.FC<ExpandIconProps> = ({ text }) => (
  <svg
    width='144'
    height='42'
    viewBox='0 0 144 42'
    fill='none'
    xmlns='http://www.w3.org/2000/svg'
  >
    <path
      d='M144 42L143.5 42C139.082 42 135.5 38.4182 135.5 34V8C135.5 3.58172 131.918 0 127.5 -3.8147e-06L16.5 -4.19617e-05C12.0817 -4.57764e-05 8.5 3.58168 8.5 7.99996V34C8.5 38.4182 4.91827 42 0.5 42H0L144 42Z'
      fill='#28282A'
    />
    <text
      style={{ fill: customPalette.gold.dark, ...customTypography.baseMd }}
      x='50%'
      y='23'
      dominantBaseline='middle'
      textAnchor='middle'
    >
      {text}
    </text>
  </svg>
)

export default ExpandIcon
