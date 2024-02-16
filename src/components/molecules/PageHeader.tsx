import { Paper, Typography } from '@mui/material'

import BackButton from '@/components/atoms/BackButton'

type PageHeaderProps = {
  title: string
}

const PageHeader: React.FC<PageHeaderProps> = ({ title }) => (
  <Paper sx={{ padding: 2 }}>
    <Typography variant='h5' component='h1'>
      {title}
    </Typography>
    <BackButton title='Pools' />
  </Paper>
)

export default PageHeader
