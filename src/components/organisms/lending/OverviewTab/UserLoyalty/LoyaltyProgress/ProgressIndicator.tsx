import { Box } from '@mui/material'

const ProgressIndicator = (props: React.CSSProperties) => (
  <Box
    position='absolute'
    top='50%'
    height={28}
    sx={{ transform: 'translate(-50%, -50%)', ...props }}
  >
    <svg
      width='27'
      height='28'
      viewBox='0 0 27 28'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <path
        d='M12.676 1.5C13.0609 0.833334 14.0231 0.833333 14.408 1.5L17.0061 6C17.391 6.66667 16.9099 7.5 16.1401 7.5H10.9439C10.1741 7.5 9.69299 6.66667 10.0779 6L12.676 1.5Z'
        fill='#C4996C'
      />
      <path
        d='M12.676 26.5C13.0609 27.1667 14.0231 27.1667 14.408 26.5L17.0061 22C17.391 21.3333 16.9099 20.5 16.1401 20.5H10.9439C10.1741 20.5 9.69299 21.3333 10.0779 22L12.676 26.5Z'
        fill='#C4996C'
      />
    </svg>
  </Box>
)

export default ProgressIndicator
